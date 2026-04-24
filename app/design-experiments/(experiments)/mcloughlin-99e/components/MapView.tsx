'use client'

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, Layer as LeafletLayer, LatLngBoundsExpression } from 'leaflet'
import styles from '../styles.module.css'
import { corridor, CORRIDOR_CENTER } from '../data/corridor.geojson'
import { speedZoneReduced } from '../data/speedZones.geojson'
import type {
  LayerId,
  HighCrashStreetsCollection,
  HighCrashIntersectionsCollection,
  HighCrashIntersectionProperties,
  PedCrashesCollection,
  PedCrashProperties,
  FatalCrashesCollection,
  FatalCrashProperties,
  SidewalksCollection,
  ParksCollection,
  SchoolsCollection,
  MaxLineCollection,
  SpringwaterCollection,
} from '../types'

type Props = {
  visibleLayers: LayerId[]
  activeBounds: LatLngBoundsExpression
  highCrashStreets: HighCrashStreetsCollection
  highCrashIntersections: HighCrashIntersectionsCollection
  pedCrashes: PedCrashesCollection
  fatalCrashes: FatalCrashesCollection
  sidewalks: SidewalksCollection
  parks: ParksCollection
  schools: SchoolsCollection
  maxOrange: MaxLineCollection
  springwater: SpringwaterCollection
}

export default function MapView({
  visibleLayers,
  activeBounds,
  highCrashStreets,
  highCrashIntersections,
  pedCrashes,
  fatalCrashes,
  sidewalks,
  parks,
  schools,
  maxOrange,
  springwater,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layersRef = useRef<Partial<Record<LayerId, LeafletLayer>>>({})
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    let mounted = true
    let map: LeafletMap | null = null
    let resizeObserver: ResizeObserver | null = null

    ;(async () => {
      const L = (await import('leaflet')).default
      if (!mounted || !containerRef.current) return

      map = L.map(containerRef.current, {
        center: CORRIDOR_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      const speedGlow = L.geoJSON(speedZoneReduced as never, {
        style: { color: '#e8b04e', weight: 18, opacity: 0.22 },
        interactive: false,
      })

      const corridorLine = L.geoJSON(corridor as never, {
        style: { color: '#e8b04e', weight: 4, opacity: 0.95 },
      })

      const streetsLayer = L.geoJSON(highCrashStreets as never, {
        style: { color: '#ec4899', weight: 3, opacity: 0.75, dashArray: '4 3' },
        onEachFeature: (feature, layer) => {
          const p = feature.properties as {
            CorridorName?: string
            CorridorDescription?: string
          }
          if (p?.CorridorName) {
            layer.bindPopup(
              `<div class="${styles.popup}">` +
                `<div class="${styles.popupLabel}">High Crash Network</div>` +
                `<div><strong>${escapeHtml(p.CorridorName)}</strong></div>` +
                (p.CorridorDescription
                  ? `<div style="margin-top:4px;color:rgba(10,13,18,0.7);font-size:11px">${escapeHtml(p.CorridorDescription)}</div>`
                  : '') +
                `</div>`,
            )
          }
        },
      })

      const intersectionsLayer = L.geoJSON(highCrashIntersections as never, {
        pointToLayer: (feature, latlng) => {
          const p = feature.properties as HighCrashIntersectionProperties
          const fatal = (p.NumFatal ?? 0) > 0
          const serious = (p.NumInjA ?? 0) > 0
          const color = fatal ? '#ef4444' : serious ? '#f59e0b' : '#fcd34d'
          const radius = fatal ? 10 : serious ? 8 : 6
          return L.circleMarker(latlng, {
            radius,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            fillOpacity: 0.85,
          })
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties as HighCrashIntersectionProperties
          const rank = p.CurrentRank != null ? `Rank #${p.CurrentRank}` : 'Ranked intersection'
          const fatalLine =
            (p.NumFatal ?? 0) > 0
              ? `<div><strong>${p.NumFatal}</strong> fatal · <strong>${p.NumInjA ?? 0}</strong> serious injury</div>`
              : `<div><strong>${p.NumInjA ?? 0}</strong> serious injury</div>`
          const costs =
            p.InjuryCosts != null
              ? `<div style="margin-top:4px">$${(p.InjuryCosts / 1_000_000).toFixed(2)}M in injury costs</div>`
              : ''
          layer.bindPopup(
            `<div class="${styles.popup}">` +
              `<div class="${styles.popupLabel}">${rank} · Portland</div>` +
              `<div><strong>${escapeHtml(p.LocationDescription?.trim() ?? 'Intersection')}</strong></div>` +
              `<div style="margin-top:6px">${fatalLine}</div>` +
              costs +
              `</div>`,
          )
        },
      })

      const sidewalksLayer = L.geoJSON(sidewalks as never, {
        style: { color: '#2dd4bf', weight: 2, opacity: 0.65 },
      })

      const pedCrashesLayer = L.geoJSON(pedCrashes as never, {
        pointToLayer: (feature, latlng) => {
          const p = feature.properties as PedCrashProperties
          const fatal = (p.TOT_PED_FATAL_CNT ?? 0) > 0
          const serious = (p.TOT_PED_INJ_CNT ?? 0) > 0
          const borderColor = fatal ? '#ef4444' : serious ? '#f97316' : '#fbbf24'
          const radius = fatal ? 8 : serious ? 6 : 5
          return L.circleMarker(latlng, {
            radius,
            fillColor: '#0a0d12',
            color: borderColor,
            weight: 2.5,
            fillOpacity: 0.85,
          })
        },
        onEachFeature: (feature, layer) => {
          const p = feature.properties as PedCrashProperties
          const year = p.CRASH_DT ? new Date(Number(p.CRASH_DT)).getFullYear() : 'unknown year'
          const fatal = p.TOT_PED_FATAL_CNT ?? 0
          const injured = p.TOT_PED_INJ_CNT ?? 0
          const sev = p.Graph_Severity ?? (fatal > 0 ? 'Fatal' : 'Injury')
          const sevLine =
            fatal > 0
              ? `<div><strong>${fatal}</strong> ped fatal · <strong>${injured}</strong> injured</div>`
              : `<div><strong>${injured}</strong> ped injured</div>`
          layer.bindPopup(
            `<div class="${styles.popup}">` +
              `<div class="${styles.popupLabel}">Ped Crash · ${sev} · ${year}</div>` +
              sevLine +
              `</div>`,
          )
        },
      })

      // Fatal + serious-injury crashes of all types, excluding pedestrian (those
      // render as pedCrashes to avoid double-marking). Rendered as rotated
      // diamonds to read distinctly from the circle-based crash markers.
      const fatalCrashesLayer = L.layerGroup(
        fatalCrashes.features
          .filter((f) => {
            const p = f.properties as FatalCrashProperties & { TOT_PED_CNT?: number | null }
            return !(p.TOT_PED_CNT && p.TOT_PED_CNT > 0)
          })
          .map((f) => {
            const p = f.properties as FatalCrashProperties
            const [lng, lat] = f.geometry.coordinates
            const fatal = (p.KABCO ?? '').toUpperCase() === 'K'
            const cls = fatal ? styles.crashDiamondFatal : styles.crashDiamondSerious
            const marker = L.marker([lat, lng], {
              icon: L.divIcon({
                className: cls,
                iconSize: [10, 10],
                iconAnchor: [5, 5],
              }),
            })
            const year = p.CRASH_DT ? new Date(Number(p.CRASH_DT)).getFullYear() : ''
            const sev = fatal ? 'Fatal crash' : 'Serious-injury crash'
            marker.bindPopup(
              `<div class="${styles.popup}">` +
                `<div class="${styles.popupLabel}">${sev}${year ? ` · ${year}` : ''}</div>` +
                `<div>ODOT record</div>` +
                `</div>`,
            )
            return marker
          }),
      )

      const parksLayer = L.geoJSON(parks as never, {
        style: {
          color: '#4ade80',
          weight: 1.5,
          opacity: 1,
          fillColor: '#22c55e',
          fillOpacity: 0.32,
        },
        pointToLayer: (_feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 5,
            fillColor: '#22c55e',
            color: '#4ade80',
            weight: 1.5,
            fillOpacity: 0.7,
          }),
        onEachFeature: (feature, layer) => {
          const p = feature.properties as { name?: string }
          if (p?.name) {
            layer.bindPopup(
              `<div class="${styles.popup}">` +
                `<div class="${styles.popupLabel}">Park</div>` +
                `<div><strong>${escapeHtml(p.name)}</strong></div>` +
                `</div>`,
            )
          }
        },
      })

      // Render every school as a ~200 m "school zone" circle (~2 blocks) to
      // emphasize pedestrian-sensitive catchments, not just the parcel.
      const schoolsLayer = L.layerGroup(
        schools.features.map((feature) => {
          const center = featureCentroid(feature.geometry)
          const p = (feature.properties ?? {}) as { name?: string }
          const circle = L.circle(center, {
            radius: 200,
            color: '#93c5fd',
            weight: 1.5,
            opacity: 0.9,
            fillColor: '#3b82f6',
            fillOpacity: 0.38,
          })
          if (p.name) {
            circle.bindPopup(
              `<div class="${styles.popup}">` +
                `<div class="${styles.popupLabel}">School Zone</div>` +
                `<div><strong>${escapeHtml(p.name)}</strong></div>` +
                `</div>`,
            )
          }
          return circle
        }),
      )

      const maxOrangeLayer = L.geoJSON(maxOrange as never, {
        style: { color: '#f58025', weight: 3, opacity: 0.9 },
        interactive: false,
      })

      const springwaterLayer = L.geoJSON(springwater as never, {
        style: { color: '#15803d', weight: 3, opacity: 1, dashArray: '6 4' },
        interactive: false,
      })

      layersRef.current = {
        speedZone: speedGlow,
        corridor: corridorLine,
        highCrashStreets: streetsLayer,
        highCrashIntersections: intersectionsLayer,
        sidewalks: sidewalksLayer,
        pedCrashes: pedCrashesLayer,
        fatalCrashes: fatalCrashesLayer,
        parks: parksLayer,
        schools: schoolsLayer,
        maxOrange: maxOrangeLayer,
        springwater: springwaterLayer,
      }
      mapRef.current = map

      map.fitBounds(corridorLine.getBounds(), { padding: [40, 40] })
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
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    applyVisibility(map, layersRef.current, visibleLayers)
  }, [visibleLayers])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !mapReady) return
    map.closePopup()
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      map.fitBounds(activeBounds, { padding: [40, 40] })
    } else {
      map.flyToBounds(activeBounds, { padding: [40, 40], duration: 0.8 })
    }
  }, [activeBounds, mapReady])

  return <div ref={containerRef} className={styles.map} />
}

function featureCentroid(
  geom: Record<string, unknown>,
): [number, number] {
  const collect = (arr: unknown, out: [number, number][]): void => {
    if (!Array.isArray(arr)) return
    if (arr.length > 0 && typeof arr[0] === 'number' && arr.length >= 2) {
      out.push([arr[1] as number, arr[0] as number])
      return
    }
    for (const item of arr) collect(item, out)
  }
  const pts: [number, number][] = []
  collect((geom as { coordinates: unknown }).coordinates, pts)
  if (pts.length === 0) return [0, 0]
  let lat = 0
  let lng = 0
  for (const [la, lo] of pts) {
    lat += la
    lng += lo
  }
  return [lat / pts.length, lng / pts.length]
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
  const ids: LayerId[] = [
    'speedZone',
    'parks',
    'schools',
    'sidewalks',
    'springwater',
    'maxOrange',
    'highCrashStreets',
    'corridor',
    'highCrashIntersections',
    'fatalCrashes',
    'pedCrashes',
  ]
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
