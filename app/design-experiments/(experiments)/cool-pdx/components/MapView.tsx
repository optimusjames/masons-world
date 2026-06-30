'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Layer as LeafletLayer, LayerGroup } from 'leaflet'
import styles from '../styles.module.css'
import type {
  LayerId,
  CanopyGrid,
  FountainsCollection,
  FountainProps,
  CoolingCollection,
  CoolingProps,
  ActiveSpot,
} from '../types'

type Props = {
  visibleLayers: LayerId[]
  canopy: CanopyGrid
  fountains: FountainsCollection
  cooling: CoolingCollection
  origin: [number, number] | null // [lat, lon]
  activeSpots: ActiveSpot[]
  onPickOrigin: (coord: [number, number]) => void
}

// Real walking route geometry from a public OSRM foot service; null on any failure
// (caller falls back to a straight line). Returns [lat, lon] pairs.
async function fetchRouteLine(
  from: [number, number],
  to: [number, number],
  signal: AbortSignal,
): Promise<[number, number][] | null> {
  try {
    const url =
      `https://routing.openstreetmap.de/routed-foot/route/v1/foot/` +
      `${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`
    const res = await fetch(url, { signal })
    if (!res.ok) return null
    const data = await res.json()
    const coords = data?.routes?.[0]?.geometry?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) return null
    return coords.map((c: [number, number]) => [c[1], c[0]])
  } catch {
    return null
  }
}

const PORTLAND_BOUNDS: [[number, number], [number, number]] = [
  [45.45, -122.78],
  [45.63, -122.52],
]

const WATER = '#2b8fd0'
const COOL = '#6366f1'
const CANOPY = '#3f9b5c'

export default function MapView({
  visibleLayers,
  canopy,
  fountains,
  cooling,
  origin,
  activeSpots,
  onPickOrigin,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layersRef = useRef<Partial<Record<LayerId, LeafletLayer>>>({})
  const userLayerRef = useRef<LayerGroup | null>(null)
  const routeLayerRef = useRef<LayerGroup | null>(null)
  const onPickRef = useRef(onPickOrigin)
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    onPickRef.current = onPickOrigin
  }, [onPickOrigin])

  useEffect(() => {
    let mounted = true
    let map: LeafletMap | null = null
    let resizeObserver: ResizeObserver | null = null

    ;(async () => {
      const L = (await import('leaflet')).default
      if (!mounted || !containerRef.current) return

      map = L.map(containerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
      })
      map.fitBounds(PORTLAND_BOUNDS)

      L.control.zoom({ position: 'bottomright' }).addTo(map)
      // Keep the in-map credit to the license minimum; full data-source credits
      // (incl. City of Portland trees) live in the page's source line under the map.
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution(
          '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> · ' +
            '© <a href="https://carto.com" target="_blank" rel="noopener">CARTO</a>',
        )
        .addTo(map)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '',
      }).addTo(map)

      // --- Canopy gradient: reconstruct cell rectangles from the compact grid ---
      const [originLon, originLat] = canopy.origin
      const size = canopy.cell
      const canopyGroup = L.layerGroup(
        canopy.cells.map(([ix, iy, intensity]) => {
          const west = originLon + ix * size
          const south = originLat + iy * size
          return L.rectangle(
            [
              [south, west],
              [south + size, west + size],
            ],
            {
              stroke: false,
              fillColor: CANOPY,
              // 0.10 floor so sparse cells still read; up to ~0.7 for the leafiest.
              fillOpacity: 0.1 + intensity * 0.6,
              interactive: false,
            },
          )
        }),
      )

      // --- Fountains ---
      const fountainsGroup = L.geoJSON(fountains as never, {
        pointToLayer: (_f, latlng) =>
          L.circleMarker(latlng, {
            radius: 5,
            fillColor: WATER,
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.95,
          }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties as FountainProps
          const [lon, lat] = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates
          layer.bindPopup(
            reliefPopup(
              'Cold water',
              WATER,
              p.name || 'Drinking fountain',
              p.bubbler ? 'Benson Bubbler' : 'Public drinking water',
              [lat, lon],
            ),
          )
        },
      })

      // --- Cooling spots ---
      const coolingGroup = L.geoJSON(cooling as never, {
        pointToLayer: (_f, latlng) =>
          L.circleMarker(latlng, {
            radius: 6,
            fillColor: COOL,
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.92,
          }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties as CoolingProps
          const [lon, lat] = (feature.geometry as unknown as { coordinates: [number, number] }).coordinates
          layer.bindPopup(
            reliefPopup(
              'Cool air · AC',
              COOL,
              p.name,
              p.kind === 'library' ? 'Library · air-conditioned' : 'Community center · air-conditioned',
              [lat, lon],
            ),
          )
        },
      })

      layersRef.current = {
        canopy: canopyGroup,
        fountains: fountainsGroup,
        cooling: coolingGroup,
      }
      mapRef.current = map
      applyVisibility(map, layersRef.current, visibleLayers)

      // Overlay groups on top of the data layers: routes underneath, markers over.
      routeLayerRef.current = L.layerGroup().addTo(map)
      userLayerRef.current = L.layerGroup().addTo(map)

      // Tapping an empty part of the map sets the search origin ("check this spot").
      // Marker clicks don't fire map 'click', so popups are unaffected.
      map.on('click', (e) => {
        onPickRef.current([e.latlng.lat, e.latlng.lng])
      })

      map.invalidateSize()
      setMapReady(true)

      if (containerRef.current && 'ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => {
          if (mapRef.current) mapRef.current.invalidateSize()
        })
        resizeObserver.observe(containerRef.current)
      }
    })()

    return () => {
      mounted = false
      if (resizeObserver) resizeObserver.disconnect()
      if (map) map.remove()
      layersRef.current = {}
      userLayerRef.current = null
      routeLayerRef.current = null
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    applyVisibility(map, layersRef.current, visibleLayers)
  }, [visibleLayers])

  // Origin + selected destinations: markers/labels draw immediately; real walking
  // routes load async and replace the straight-line fallback.
  const spotsKey = activeSpots.map((s) => `${s.key}:${s.coord.join(',')}`).join('|')
  const originKey = origin ? origin.join(',') : ''
  useEffect(() => {
    const map = mapRef.current
    const markers = userLayerRef.current
    const routes = routeLayerRef.current
    if (!map || !markers || !routes || !mapReady) return
    let cancelled = false
    const ctrl = new AbortController()

    ;(async () => {
      const L = (await import('leaflet')).default
      markers.clearLayers()
      routes.clearLayers()
      if (!origin) return

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Target markers + walk-time labels (drawn now, on top).
      for (const s of activeSpots) {
        L.circleMarker(s.coord, {
          radius: 15,
          stroke: false,
          fillColor: s.color,
          fillOpacity: 0.16,
          interactive: false,
        }).addTo(markers)
        L.circleMarker(s.coord, {
          radius: 8,
          color: '#ffffff',
          weight: 2,
          fillColor: s.color,
          fillOpacity: 1,
          interactive: false,
        }).addTo(markers)
        L.marker(s.coord, {
          interactive: false,
          icon: L.divIcon({
            className: '',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            html:
              `<div style="position:absolute;transform:translate(-50%,-230%);white-space:nowrap;` +
              `font:700 11px ui-sans-serif,system-ui,sans-serif;background:#fff;color:${s.color};` +
              `border:1px solid ${s.color}66;padding:2px 8px;border-radius:999px;` +
              `box-shadow:0 2px 8px rgba(42,35,32,0.2);">~${s.minWalk} min walk</div>`,
          }),
        }).addTo(markers)
      }

      // Origin marker — halo + solid dot.
      L.circleMarker(origin, {
        radius: 14,
        stroke: false,
        fillColor: '#2a2320',
        fillOpacity: 0.1,
        interactive: false,
      }).addTo(markers)
      L.circleMarker(origin, {
        radius: 7,
        fillColor: '#2a2320',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      })
        .addTo(markers)
        .bindPopup(`<div class="${styles.popup}">Searching from here</div>`)

      // Frame origin + targets right away.
      const pts: [number, number][] = [origin, ...activeSpots.map((s) => s.coord)]
      const bounds = L.latLngBounds(pts).pad(0.35)
      if (reduced) map.fitBounds(bounds)
      else map.flyToBounds(bounds, { duration: 0.7 })

      // Real walking routes (async); fall back to a straight dashed line.
      for (const s of activeSpots) {
        const line = await fetchRouteLine(origin, s.coord, ctrl.signal)
        if (cancelled) return
        const latlngs = line ?? [origin, s.coord]
        L.polyline(latlngs, {
          color: s.color,
          weight: 3.5,
          opacity: 0.85,
          dashArray: line ? undefined : '1 7',
          className: !line && !reduced ? styles.routeLine : '',
          interactive: false,
        }).addTo(routes)
      }
    })()

    return () => {
      cancelled = true
      ctrl.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originKey, spotsKey, mapReady])

  return <div ref={containerRef} className={styles.map} />
}

// Builds a popup that matches the "Nearest relief" card: benefit eyebrow, name,
// sub, and a Directions link — so any clicked spot is as useful as the located one.
function reliefPopup(
  eyebrow: string,
  color: string,
  name: string,
  sub: string,
  coord: [number, number],
): string {
  const dir = `https://www.google.com/maps/dir/?api=1&destination=${coord[0]},${coord[1]}`
  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupEyebrow}" style="color:${color}">` +
    `<span class="${styles.popupDot}" style="background:${color}"></span>${eyebrow}</div>` +
    `<div class="${styles.popupName}">${escapeHtml(name)}</div>` +
    `<div class="${styles.popupMeta}">${escapeHtml(sub)}</div>` +
    `<a class="${styles.popupDir}" href="${dir}" target="_blank" rel="noopener noreferrer" style="color:${color}">Directions ↗</a>` +
    `</div>`
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyVisibility(
  map: LeafletMap,
  layers: Partial<Record<LayerId, LeafletLayer>>,
  visible: LayerId[],
) {
  // Draw order: canopy underneath, points on top.
  const ids: LayerId[] = ['canopy', 'cooling', 'fountains']
  ids.forEach((id) => {
    const layer = layers[id]
    if (!layer) return
    if (visible.includes(id)) {
      if (!map.hasLayer(layer)) layer.addTo(map)
    } else if (map.hasLayer(layer)) {
      map.removeLayer(layer)
    }
  })
}
