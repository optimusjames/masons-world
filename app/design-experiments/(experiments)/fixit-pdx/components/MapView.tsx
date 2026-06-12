'use client'

import { useEffect, useRef, useState } from 'react'
import type {
  Map as LeafletMap,
  CircleMarker,
  LayerGroup,
  Marker,
  LeafletMouseEvent,
} from 'leaflet'
import styles from '../styles.module.css'
import type { CategoryId, MapPin, PickedLocation, ReportStatus } from '../types'
import { CATEGORY_MAP } from '../data/categories'
import { STATUS_COLOR, STATUS_LABEL, glyphSvg } from './icons'

const PORTLAND_CENTER: [number, number] = [45.515, -122.652]

type Props = {
  pins: MapPin[]
  visibleStatuses: ReportStatus[]
  visibleCategory: CategoryId | 'all'
  mode: 'browse' | 'pick'
  picked: PickedLocation | null
  onPick: (lat: number, lng: number) => void
  onReady?: () => void
}

export default function MapView({
  pins,
  visibleStatuses,
  visibleCategory,
  mode,
  picked,
  onPick,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const pinsLayerRef = useRef<LayerGroup | null>(null)
  const pickMarkerRef = useRef<Marker | null>(null)
  const onPickRef = useRef(onPick)
  onPickRef.current = onPick
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
        center: PORTLAND_CENTER,
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      })
      L.control.zoom({ position: 'bottomright' }).addTo(map)
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution(
          'Pothole data © <a href="https://www.portlandmaps.com" target="_blank" rel="noopener">City of Portland</a> · © <a href="https://carto.com" target="_blank" rel="noopener">CARTO</a>',
        )
        .addTo(map)

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map)

      pinsLayerRef.current = L.layerGroup().addTo(map)

      map.on('click', (e: LeafletMouseEvent) => {
        onPickRef.current(e.latlng.lat, e.latlng.lng)
      })

      mapRef.current = map
      map.invalidateSize()
      setReady(true)
      onReady?.()

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
      pinsLayerRef.current = null
      pickMarkerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- render pins on data/filter change ------------------------------------
  useEffect(() => {
    const group = pinsLayerRef.current
    if (!group || !ready) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()

      // While picking a location, hide existing pins so every tap on the map
      // registers as a location pick (not a marker popup).
      if (mode === 'pick') return

      const statusSet = new Set(visibleStatuses)
      for (const pin of pins) {
        if (!statusSet.has(pin.status)) continue
        if (visibleCategory !== 'all' && pin.category !== visibleCategory) continue

        const color = STATUS_COLOR[pin.status]
        const marker: CircleMarker = L.circleMarker([pin.lat, pin.lng], {
          radius: pin.status === 'reported' ? 6 : 5.5,
          fillColor: color,
          color: '#ffffff',
          weight: 1.5,
          fillOpacity: 0.92,
        })
        marker.bindPopup(storyHtml(pin), {
          closeButton: true,
          className: styles.popupWrap,
          maxWidth: 260,
        })
        marker.addTo(group)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pins, visibleStatuses, visibleCategory, mode, ready])

  // ---- pick-mode marker -----------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return

      // Disable pin popups while picking a location so taps register as picks.
      map.getContainer().classList.toggle(styles.picking, mode === 'pick')

      if (mode === 'pick' && picked) {
        const latlng: [number, number] = [picked.lat, picked.lng]
        if (!pickMarkerRef.current) {
          const icon = L.divIcon({
            className: styles.pickPin,
            html: '<span></span>',
            iconSize: [30, 30],
            iconAnchor: [15, 28],
          })
          const m = L.marker(latlng, { icon, draggable: true })
          m.on('dragend', () => {
            const p = m.getLatLng()
            onPickRef.current(p.lat, p.lng)
          })
          m.addTo(map)
          pickMarkerRef.current = m
        } else {
          pickMarkerRef.current.setLatLng(latlng)
        }
        map.panTo(latlng, { animate: true })
      } else if (pickMarkerRef.current) {
        map.removeLayer(pickMarkerRef.current)
        pickMarkerRef.current = null
      }
    })()

    return () => {
      cancelled = true
    }
  }, [mode, picked])

  return <div ref={containerRef} className={styles.map} />
}

function storyHtml(pin: MapPin): string {
  const cat = CATEGORY_MAP[pin.category]
  const color = STATUS_COLOR[pin.status]
  const reported = fmtDate(pin.reportedDate)

  // Timeline rows: Reported -> (Assessed) -> Fixed
  const rows: string[] = [
    row('reported', `Reported`, reported, color),
  ]
  if (pin.status === 'in_progress') {
    rows.push(row('in_progress', 'In progress', 'Crew assigned', '#3b7fb8'))
  }
  if (pin.status === 'fixed') {
    const detail = pin.daysToFix != null ? `Fixed in ${pin.daysToFix} days` : 'Repaired'
    rows.push(row('fixed', 'Fixed', detail, '#3f9d6b'))
  }

  const note = pin.note
    ? `<div class="${styles.popupNote}">${escapeHtml(pin.note)}</div>`
    : ''
  const realTag = pin.real
    ? `<span class="${styles.popupReal}">real city record</span>`
    : ''

  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupHead}">` +
    `<span class="${styles.popupGlyph}" style="color:${color}">${glyphSvg(pin.category, color)}</span>` +
    `<span class="${styles.popupTitle}">${escapeHtml(cat?.label ?? 'Issue')}</span>` +
    `<span class="${styles.popupBadge}" style="background:${color}">${STATUS_LABEL[pin.status]}</span>` +
    `</div>` +
    `<div class="${styles.popupTimeline}">${rows.join('')}</div>` +
    note +
    realTag +
    `</div>`
  )
}

function row(_key: string, label: string, detail: string, color: string): string {
  return (
    `<div class="${styles.popupRow}">` +
    `<span class="${styles.popupDot}" style="background:${color}"></span>` +
    `<span class="${styles.popupRowLabel}">${label}</span>` +
    `<span class="${styles.popupRowDetail}">${escapeHtml(detail)}</span>` +
    `</div>`
  )
}

function fmtDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
