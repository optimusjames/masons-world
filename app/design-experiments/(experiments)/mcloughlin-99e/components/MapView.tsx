'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap, Layer as LeafletLayer } from 'leaflet'
import styles from '../styles.module.css'
import { corridor, CORRIDOR_CENTER } from '../data/corridor.geojson'
import { speedZoneReduced } from '../data/speedZones.geojson'
import type {
  LayerId,
  HighCrashStreetsCollection,
  HighCrashIntersectionsCollection,
  HighCrashIntersectionProperties,
} from '../types'

type Props = {
  visibleLayers: LayerId[]
  highCrashStreets: HighCrashStreetsCollection
  highCrashIntersections: HighCrashIntersectionsCollection
}

export default function MapView({
  visibleLayers,
  highCrashStreets,
  highCrashIntersections,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const layersRef = useRef<Partial<Record<LayerId, LeafletLayer>>>({})

  useEffect(() => {
    let mounted = true
    let map: LeafletMap | null = null

    ;(async () => {
      const L = (await import('leaflet')).default
      if (!mounted || !containerRef.current) return

      map = L.map(containerRef.current, {
        center: CORRIDOR_CENTER,
        zoom: 13,
        zoomControl: true,
        attributionControl: true,
      })

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a> · Portland Open Data',
          maxZoom: 19,
          subdomains: 'abcd',
        },
      ).addTo(map)

      const speedGlow = L.geoJSON(speedZoneReduced as never, {
        style: { color: '#e8b04e', weight: 14, opacity: 0.18 },
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

      layersRef.current = {
        speedZone: speedGlow,
        corridor: corridorLine,
        highCrashStreets: streetsLayer,
        highCrashIntersections: intersectionsLayer,
      }
      mapRef.current = map

      map.fitBounds(corridorLine.getBounds(), { padding: [40, 40] })
      applyVisibility(map, layersRef.current, visibleLayers)
    })()

    return () => {
      mounted = false
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

  return (
    <>
      <div ref={containerRef} className={styles.map} />
      <div className={styles.mapCallout}>
        <strong>4 mi</strong> · Ross Island Bridge → Milwaukie · 45 → 40 mph
      </div>
    </>
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
  const ids: LayerId[] = [
    'speedZone',
    'highCrashStreets',
    'corridor',
    'highCrashIntersections',
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
