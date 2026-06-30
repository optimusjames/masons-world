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
  NearestResult,
} from '../types'

type Props = {
  visibleLayers: LayerId[]
  canopy: CanopyGrid
  fountains: FountainsCollection
  cooling: CoolingCollection
  userLocation: [number, number] | null // [lat, lon]
  nearest: NearestResult | null
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
  userLocation,
  nearest,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layersRef = useRef<Partial<Record<LayerId, LeafletLayer>>>({})
  const userLayerRef = useRef<LayerGroup | null>(null)
  const [mapReady, setMapReady] = useState(false)

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
      L.control
        .attribution({ position: 'bottomright', prefix: false })
        .addAttribution(
          '© <a href="https://carto.com" target="_blank" rel="noopener">CARTO</a> · ' +
            'Trees: City of Portland · Fountains & cool spots: © OpenStreetMap',
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
          const label = p.bubbler ? 'Benson Bubbler' : 'Drinking fountain'
          layer.bindPopup(
            `<div class="${styles.popup}">` +
              `<div class="${styles.popupLabel}">${label}</div>` +
              (p.name ? `<div><strong>${escapeHtml(p.name)}</strong></div>` : '<div>Public water</div>') +
              `</div>`,
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
          const kind = p.kind === 'library' ? 'Library' : 'Community center'
          layer.bindPopup(
            `<div class="${styles.popup}">` +
              `<div class="${styles.popupLabel}">${kind} · cool air</div>` +
              `<div><strong>${escapeHtml(p.name)}</strong></div>` +
              `</div>`,
          )
        },
      })

      layersRef.current = {
        canopy: canopyGroup,
        fountains: fountainsGroup,
        cooling: coolingGroup,
      }
      userLayerRef.current = L.layerGroup().addTo(map)
      mapRef.current = map

      applyVisibility(map, layersRef.current, visibleLayers)
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
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    applyVisibility(map, layersRef.current, visibleLayers)
  }, [visibleLayers])

  // User location + connectors to nearest relief
  useEffect(() => {
    const map = mapRef.current
    const group = userLayerRef.current
    if (!map || !group || !mapReady) return

    ;(async () => {
      const L = (await import('leaflet')).default
      group.clearLayers()
      if (!userLocation) return

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const connect = (to: [number, number] | undefined, color: string) => {
        if (!to) return
        L.polyline([userLocation, to], {
          color,
          weight: 2.5,
          opacity: 0.7,
          dashArray: '2 6',
          interactive: false,
        }).addTo(group)
      }
      connect(nearest?.fountain?.coord, WATER)
      connect(nearest?.cooling?.coord, COOL)

      L.circleMarker(userLocation, {
        radius: 7,
        fillColor: '#2a2320',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      })
        .addTo(group)
        .bindPopup(`<div class="${styles.popup}">You are here</div>`)

      const pts: [number, number][] = [userLocation]
      if (nearest?.fountain) pts.push(nearest.fountain.coord)
      if (nearest?.cooling) pts.push(nearest.cooling.coord)
      const bounds = L.latLngBounds(pts).pad(0.4)
      if (reduced) map.fitBounds(bounds)
      else map.flyToBounds(bounds, { duration: 0.7 })
    })()
  }, [userLocation, nearest, mapReady])

  return <div ref={containerRef} className={styles.map} />
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
