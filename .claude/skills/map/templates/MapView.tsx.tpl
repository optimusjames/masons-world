'use client'

// All Leaflet lives in this file. Nothing else in the experiment imports it.
//
// Leaflet touches `window` at module scope, so every reference to it is behind
// a dynamic import inside an effect. Importing it at the top of the file will
// break the production build.

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, LayerGroup, CircleMarker } from 'leaflet'
import styles from '../styles.module.css'
import { addBasemap } from '@/lib/basemap'
import { MAP_CONFIG } from '../map.config'
import { PLACE } from '../data/place'
import type { LayerId, MapFeature, ShapeLayer } from '../types'
import { colorFor, radiusFor, weightFor } from './scale'

type Props = {
  features: MapFeature[]
  shapes?: ShapeLayer[]
  visibleLayers: LayerId[]
  /** Bumped by the parent on fullscreen toggle so the map re-measures. */
  resizeKey?: unknown
  onSelect?: (feature: MapFeature) => void
  onReady?: () => void
}

export default function MapView({
  features,
  shapes,
  visibleLayers,
  resizeKey,
  onSelect,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const pointsRef = useRef<LayerGroup | null>(null)
  const shapesRef = useRef<LayerGroup | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const [ready, setReady] = useState(false)

  // ---- init (once) ----------------------------------------------------------
  useEffect(() => {
    let mounted = true
    let map: LeafletMap | null = null
    let resizeObserver: ResizeObserver | null = null

    ;(async () => {
      const L = (await import('leaflet')).default
      if (!mounted || !containerRef.current) return

      map = L.map(containerRef.current, {
        center: PLACE.center,
        zoom: PLACE.zoom,
        minZoom: PLACE.minZoom,
        maxZoom: PLACE.maxZoom,
        maxBounds: PLACE.bounds,
        maxBoundsViscosity: 0.7,
        zoomControl: false,
        attributionControl: false,
        // Hundreds of markers as DOM nodes will crawl. Canvas is not optional.
        preferCanvas: true,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // Attribution is required, for the basemap and for every data source.
      const credits = [
        MAP_CONFIG.basemap.attribution,
        ...MAP_CONFIG.sources.map((s) =>
          s.url.startsWith('http')
            ? `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`
            : s.name,
        ),
      ].join(' · ')
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution(credits)
        .addTo(map)

      // Another await, so the component can unmount mid-flight; bail before
      // touching a map the cleanup has already removed.
      await addBasemap(map, { theme: MAP_CONFIG.basemap.theme })
      if (!mounted) return

      // Shapes below points, always.
      shapesRef.current = L.layerGroup().addTo(map)
      pointsRef.current = L.layerGroup().addTo(map)

      mapRef.current = map
      map.invalidateSize()
      setReady(true)
      onReady?.()

      // Without this the map renders as grey tiles inside a flex layout.
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => mapRef.current?.invalidateSize())
        resizeObserver.observe(containerRef.current)
      }
    })()

    return () => {
      mounted = false
      resizeObserver?.disconnect()
      map?.remove()
      mapRef.current = null
      pointsRef.current = null
      shapesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fullscreen changes the container size outside React's knowledge, so the
  // parent bumps resizeKey and Leaflet re-measures.
  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => mapRef.current?.invalidateSize(), 60)
    return () => window.clearTimeout(id)
  }, [resizeKey, ready])

  // ---- points ---------------------------------------------------------------
  useEffect(() => {
    const group = pointsRef.current
    if (!group || !ready) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()

      const on = new Set(visibleLayers)
      for (const f of features) {
        if (!on.has(f.layer)) continue

        const color = colorFor(f)
        const marker: CircleMarker = L.circleMarker([f.lat, f.lng], {
          // Second visual channel: size carries the value too, so the map is
          // readable without relying on hue alone.
          radius: radiusFor(f),
          fillColor: color,
          color: '#ffffff',
          weight: weightFor(f),
          fillOpacity: 0.92,
        })
        marker.bindPopup(popupHtml(f), {
          closeButton: true,
          className: styles.popupWrap,
          maxWidth: 280,
        })
        if (onSelectRef.current) {
          marker.on('click', () => onSelectRef.current?.(f))
        }
        marker.addTo(group)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [features, visibleLayers, ready])

  // ---- shapes (polygons / lines) --------------------------------------------
  useEffect(() => {
    const group = shapesRef.current
    if (!group || !ready || !shapes?.length) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()

      const on = new Set(visibleLayers)
      for (const s of shapes) {
        if (!on.has(s.layer)) continue
        L.geoJSON(s.geojson, {
          style: (feat) => ({
            color: colorFor({ layer: s.layer, value: feat?.properties?.value }),
            weight: 1,
            // Past ~0.55 the streets underneath vanish and people lose their
            // bearings. Do not raise this to make a layer "pop".
            fillOpacity: 0.45,
            opacity: 0.8,
          }),
        }).addTo(group)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [shapes, visibleLayers, ready])

  return <div ref={containerRef} className={styles.map} />
}

// ---- popup ----------------------------------------------------------------

function popupHtml(f: MapFeature): string {
  const rows = (f.detail ?? [])
    .map(
      (d) =>
        `<div class="${styles.popupRow}">` +
        `<span class="${styles.popupRowLabel}">${escapeHtml(d.label)}</span>` +
        `<span class="${styles.popupRowValue}">${escapeHtml(d.value)}</span>` +
        `</div>`,
    )
    .join('')

  // Honesty marker. Illustrative records say so where they are drawn, not only
  // in SOURCES.md.
  const provenance = f.real
    ? `<span class="${styles.popupReal}">verified source</span>`
    : `<span class="${styles.popupSynthetic}">illustrative</span>`

  const when = f.observedAt
    ? `<div class="${styles.popupWhen}">${escapeHtml(fmtTime(f.observedAt))}</div>`
    : ''

  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupHead}">` +
    `<span class="${styles.popupDot}" style="background:${colorFor(f)}"></span>` +
    `<span class="${styles.popupTitle}">${escapeHtml(f.label)}</span>` +
    `</div>` +
    when +
    rows +
    provenance +
    `</div>`
  )
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
