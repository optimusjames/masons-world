'use client'

// All Leaflet lives in this file. Nothing else in the experiment imports it.
// Leaflet touches `window` at module scope, so every reference is behind a
// dynamic import inside an effect. Importing it at the top breaks the build.

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, LayerGroup } from 'leaflet'
import styles from '../styles.module.css'
import { MAP_CONFIG } from '../map.config'
import { EDGE_FADE_DEG, METRO, PAN_BOUNDS, REGION } from '../data/place'
import type { LayerId, MapFeature, ShapeLayer } from '../types'
import {
  arrowLength,
  arrowOpacity,
  arrowWidth,
  bandFor,
  colorFor,
  FIRE,
  radiusFor,
  WIND,
} from './scale'

type Props = {
  features: MapFeature[]
  shapes: ShapeLayer[]
  visibleLayers: LayerId[]
  /** Bumped by the parent on fullscreen toggle so the map re-measures. */
  resizeKey?: unknown
  /** Set by the parent to fly to a feature and open its card. The nonce makes
   *  a repeat request on the same feature a new request. */
  focus?: { feature: MapFeature; nonce: number } | null
  onReady?: () => void
}

export default function MapView({
  features,
  shapes,
  visibleLayers,
  resizeKey,
  focus,
  onReady,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const monitorsRef = useRef<LayerGroup | null>(null)
  const windRef = useRef<LayerGroup | null>(null)
  const firesRef = useRef<LayerGroup | null>(null)
  const [ready, setReady] = useState(false)
  const [zoom, setZoom] = useState(METRO.zoom)
  // Bumped on every pan/zoom so the wind lattice re-samples for the new view.
  const [view, setView] = useState(0)

  // ---- init (once) ----------------------------------------------------------
  useEffect(() => {
    let mounted = true
    let map: LeafletMap | null = null
    let resizeObserver: ResizeObserver | null = null

    ;(async () => {
      const L = (await import('leaflet')).default
      if (!mounted || !containerRef.current) return

      map = L.map(containerRef.current, {
        center: METRO.center,
        zoom: METRO.zoom,
        minZoom: REGION.minZoom,
        maxZoom: REGION.maxZoom,
        // Pannable across the whole smoke shed plus a margin. The data extent
        // is REGION; the camera gets PAN_BOUNDS, which is REGION with room
        // around it so a marker on the edge can still be centered.
        maxBounds: PAN_BOUNDS,
        // Soft rather than rigid. The stop is now well outside the data, so a
        // little give at the very edge costs nothing and stops the map from
        // fighting a drag or a popup trying to pan itself into view.
        maxBoundsViscosity: 0.6,
        zoomControl: false,
        attributionControl: false,
        // Nearly 200 markers. Canvas is not optional.
        preferCanvas: true,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // The basemap credit travels with the tiles and always shows. The data
      // sources are wrapped so CSS can drop them on a phone, where the
      // provenance footer sits right below the map saying the same thing at
      // more length. Fullscreen hides that footer, so the styles put them back.
      const sourceCredits = MAP_CONFIG.sources
        .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`)
        .join(' · ')
      const credits =
        `${MAP_CONFIG.basemap.attribution}` +
        `<span class="smokeAttrSources"> · ${sourceCredits}</span>`
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution(credits)
        .addTo(map)

      L.tileLayer(MAP_CONFIG.basemap.url, {
        subdomains: MAP_CONFIG.basemap.subdomains,
        maxZoom: 19,
      }).addTo(map)

      // Order matters: fires at the bottom, then wind, monitors on top. The
      // measurement is never hidden by the cause.
      firesRef.current = L.layerGroup().addTo(map)
      windRef.current = L.layerGroup().addTo(map)
      monitorsRef.current = L.layerGroup().addTo(map)

      // Place names on their own pane, ABOVE everything.
      //
      // This flipped once the dots stopped carrying numbers. While a reading
      // was printed inside each marker, a city name drawing over it would hide
      // data, so labels sat below. Now the dots are pure color and a name
      // landing on one costs nothing, while a city vanishing under a dot costs
      // the reader their bearings. 650 puts labels over the marker pane (600).
      map.createPane('labels')
      const labelPane = map.getPane('labels')!
      labelPane.style.zIndex = '650'
      labelPane.style.pointerEvents = 'none'
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19,
        pane: 'labels',
      }).addTo(map)

      map.on('zoomend', () => setZoom(map!.getZoom()))
      map.on('moveend zoomend', () => setView((v) => v + 1))

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
      monitorsRef.current = null
      windRef.current = null
      firesRef.current = null
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

  // ---- fly to a feature -----------------------------------------------------
  //
  // The card is built here rather than by opening the marker's own popup. The
  // monitor layer redraws on zoom (stations collapse and thin out when zoomed
  // out), so the marker that was under the cursor when the flight started may
  // not exist when it lands. A standalone popup with the same content sidesteps
  // that lifecycle entirely.
  useEffect(() => {
    if (!ready || !focus) return
    let cancelled = false
    let timer = 0

    ;(async () => {
      const L = (await import('leaflet')).default
      const map = mapRef.current
      if (cancelled || !map) return

      const { feature } = focus
      let opened = false
      const open = () => {
        if (cancelled || opened) return
        opened = true
        L.popup({ className: styles.popupWrap, maxWidth: 280, ...POPUP_PAN })
          .setLatLng([feature.lat, feature.lng])
          .setContent(monitorPopup(feature))
          .openOn(map)
      }

      // Never zoom OUT to get there. If someone is already looking closely,
      // yanking them back to zoom 11 loses the context they built.
      const target = Math.max(map.getZoom(), 11)
      map.flyTo([feature.lat, feature.lng], target, { duration: 0.9 })
      // Landing is what normally opens the card. The timer is the guard for the
      // case where the map is already exactly there and never moves, which would
      // otherwise leave a click with nothing to show for it.
      map.once('moveend', open)
      timer = window.setTimeout(open, 1200)
    })()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [focus, ready])

  // ---- monitors -------------------------------------------------------------
  //
  // One radial bloom per reporting station. Hue, size, and falloff carry the
  // reading; the exact number is one click away and the legend holds the scale.
  useEffect(() => {
    const group = monitorsRef.current
    if (!group || !ready) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()
      if (!visibleLayers.includes('monitor')) return

      // Only stations with a reading get drawn. A station with nothing to say
      // is noise on the map; the count of quiet ones is stated in the legend
      // instead, which keeps the network honest without the clutter.
      const monitors = features.filter((f) => f.layer === 'monitor' && f.value != null)

      // Zoomed out, the metro's ~22 stations sit on top of each other and turn
      // into an illegible pile. Only that cluster collapses; every monitor
      // outside the metro is spread out and draws normally at any zoom.
      const collapseMetro = zoom <= 8
      let toDraw = monitors
      if (collapseMetro) {
        const metro = monitors.filter((m) => m.metro)
        toDraw = monitors.filter((m) => !m.metro)
        const live = metro.filter((m) => m.value != null)
        if (live.length) {
          const worst = live.reduce((a, m) => ((m.value ?? 0) > (a.value ?? 0) ? m : a))
          toDraw = [
            ...toDraw,
            {
              ...worst,
              id: 'monitor-metro-summary',
              lat: METRO.center[0],
              lng: METRO.center[1],
              label: 'Portland metro',
              detail: [
                { label: 'Highest AQI', value: String(worst.value) },
                { label: 'At', value: worst.label },
                { label: 'Reporting', value: `${live.length} of ${metro.length} monitors` },
              ],
            },
          ]
        }
      }

      // Zoomed out, dense networks (Puget Sound, Spokane) stack badges on top of
      // each other. Thin to one per grid cell, keeping the HIGHEST reading —
      // for air quality, hiding the worst number is the dangerous direction.
      if (zoom <= 8) {
        // Roughly one badge per 45px of screen, so discs stop colliding
        // instead of stacking into unreadable clumps around Salem and Puget
        // Sound. Widens automatically as you zoom out.
        const cell = 58 / 2 ** zoom
        const best = new Map<string, MapFeature>()
        for (const f of toDraw) {
          const key = `${Math.round(f.lat / cell)}:${Math.round(f.lng / cell)}`
          const cur = best.get(key)
          // Prefer any reading over none, then the higher AQI.
          const better =
            cur == null ||
            (cur.value == null && f.value != null) ||
            (f.value ?? -1) > (cur.value ?? -1)
          if (better) best.set(key, f)
        }
        toDraw = [...best.values()]
      }

      for (const f of toDraw) {
        const marker = L.marker([f.lat, f.lng], {
          icon: L.divIcon({
            className: styles.monitorIcon,
            html: monitorBadge(f),
            iconSize: [bloomSize(f), bloomSize(f)],
            iconAnchor: [bloomSize(f) / 2, bloomSize(f) / 2],
          }),
          // Higher AQI draws above lower, so the reading that matters is never
          // the one underneath.
          zIndexOffset: 400 + Math.min(f.value ?? 0, 400),
          riseOnHover: true,
        })
        marker.bindPopup(monitorPopup(f), {
          closeButton: true,
          className: styles.popupWrap,
          maxWidth: 280,
          // Cards near the top of the frame used to open half off-screen. Leave
          // the map room to pan them clear of the legend and the controls.
          ...POPUP_PAN,
        })
        marker.addTo(group)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [features, visibleLayers, ready, zoom])

  // ---- wind -----------------------------------------------------------------
  //
  // Two grid densities were fetched. Drawing both at every zoom would clot the
  // metro view, so density follows zoom: fine grid close in, coarse grid out.
  useEffect(() => {
    const group = windRef.current
    if (!group || !ready) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()
      if (!visibleLayers.includes('wind')) return

      // Arrows are drawn on a SCREEN-SPACE lattice, not on the raw data grid.
      //
      // The data has two densities (fine over the metro, coarse over the
      // region), and drawing cells directly made the fine patch read as a dense
      // square floating inside a sparse field. Sampling the field onto an even
      // lattice instead gives identical apparent spacing at every zoom, and it
      // is the same structure an animated particle layer would need later.
      const map = mapRef.current
      if (!map) return
      const cells = features.filter((f) => f.layer === 'wind' && f.bearing != null)
      if (!cells.length) return

      // Degrees per ~106px of screen, so spacing is constant to the eye.
      const origin = map.containerPointToLatLng([0, 0])
      const stepPt = map.containerPointToLatLng([106, 106])
      const dLat = Math.abs(origin.lat - stepPt.lat) || 0.05
      const dLng = Math.abs(origin.lng - stepPt.lng) || 0.05

      const b = map.getBounds()
      const [[rs, rw], [rn, re]] = REGION.bounds
      const south = Math.max(b.getSouth(), rs)
      const north = Math.min(b.getNorth(), rn)
      const west = Math.max(b.getWest(), rw)
      const east = Math.min(b.getEast(), re)

      const lattice: [number, number][] = []
      // Snap to a global grid so arrows do not shimmer sideways as you pan.
      const startLat = Math.ceil(south / dLat) * dLat
      const startLng = Math.ceil(west / dLng) * dLng
      for (let lat = startLat; lat <= north; lat += dLat) {
        for (let lng = startLng; lng <= east; lng += dLng) {
          lattice.push([lat, lng])
          if (lattice.length > 900) break
        }
        if (lattice.length > 900) break
      }

      for (const [lat, lng] of lattice) {
        // Nearest sample. 651 cells against ~400 lattice points is trivial work
        // and avoids any interpolation artifacts at the grid seams.
        let best = cells[0]
        let bestD = Infinity
        for (const c of cells) {
          const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
          if (d < bestD) {
            bestD = d
            best = c
          }
        }
        // Too far from any sample means we are off the data extent.
        if (bestD > 0.75) continue
        const f = { ...best, lat, lng, bearing: best.bearing as number }

        const len = arrowLength(f.value)
        // Meteorology names the direction wind comes FROM. The arrow has to
        // point where the smoke is GOING, so rotate 180.
        const heading = (f.bearing + 180) % 360
        const size = len + 8
        const icon = L.divIcon({
          className: styles.windIcon,
          html: arrowSvg(
            len,
            heading,
            size,
            arrowOpacity(f.value) * edgeFade(f.lat, f.lng),
            arrowWidth(f.value),
          ),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        })
        const m = L.marker([f.lat, f.lng], {
          icon,
          interactive: true,
          keyboard: false,
          // Always beneath the monitor badges.
          zIndexOffset: -500,
        })
        m.bindTooltip(f.label, { direction: 'top', className: styles.windTip })
        m.addTo(group)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [features, visibleLayers, ready, zoom, view])

  // The air-quality tint used to be its own layer of wide translucent circles
  // under the markers. It is now baked into each monitor's radial gradient, so
  // there is one mark per station instead of a dot plus a halo behind it.

  // ---- fire perimeters ------------------------------------------------------
  useEffect(() => {
    const group = firesRef.current
    if (!group || !ready) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()
      if (!visibleLayers.includes('perimeter')) return

      for (const s of shapes) {
        if (s.layer !== 'perimeter') continue
        L.geoJSON(s.geojson as never, {
          style: () => ({
            color: '#8e2419',
            weight: 1.4,
            // Solid enough to read as burned ground at a glance, still under
            // the 0.55 ceiling where street context disappears.
            fillOpacity: 0.55,
            fillColor: FIRE,
            opacity: 0.95,
          }),
          onEachFeature: (feat, layer) => {
            const p = feat.properties as { name: string; acres: number | null; contained: number | null }
            layer.bindPopup(firePopup(p), {
              closeButton: true,
              className: styles.popupWrap,
              maxWidth: 260,
              ...POPUP_PAN,
            })
          },
        }).addTo(group)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [shapes, visibleLayers, ready])

  return <div ref={containerRef} className={styles.map} />
}

// ---- helpers --------------------------------------------------------------

/**
 * Autopan margins for every popup on this map.
 *
 * The top strip carries the legend and the fullscreen button, and the bottom
 * carries the zoom control and the attribution, so a popup that merely fits
 * inside the container can still be sitting under furniture. Reserving those
 * bands makes "opened" and "readable" the same thing.
 */
const POPUP_PAN = {
  autoPan: true,
  autoPanPaddingTopLeft: [18, 76] as [number, number],
  autoPanPaddingBottomRight: [18, 46] as [number, number],
}

function inMetro(lat: number, lng: number): boolean {
  const [[s, w], [n, e]] = METRO.bounds
  return lat >= s && lat <= n && lng >= w && lng <= e
}

/** 0 at the region edge, 1 once EDGE_FADE_DEG inside it. Without this the wind
 *  grid ends on a ruled line and reads as a rectangle drawn over the map
 *  rather than as weather. */
function edgeFade(lat: number, lng: number): number {
  const [[s, w], [n, e]] = REGION.bounds
  const d = Math.min(lat - s, n - lat, lng - w, e - lng)
  return Math.max(0, Math.min(1, d / EDGE_FADE_DEG))
}

function arrowSvg(
  len: number,
  heading: number,
  size: number,
  opacity: number,
  width: number,
): string {
  const half = len / 2
  const c = size / 2
  // Head scales with the shaft, or a fat stroke swallows a fixed-size point.
  // A bare chevron, no shaft. Direction is all these need to carry, and the
  // stemless form is far quieter across several hundred marks.
  const w = half * 0.78
  const top = c - half * 0.5
  const bot = c + half * 0.5
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" ` +
    `style="transform:rotate(${heading}deg)" opacity="${opacity.toFixed(2)}">` +
    `<path d="M${(c - w).toFixed(1)} ${bot.toFixed(1)} L${c} ${top.toFixed(1)} ` +
    `L${(c + w).toFixed(1)} ${bot.toFixed(1)}" fill="none" stroke="${WIND}" ` +
    `stroke-width="${(width * 1.15).toFixed(1)}" stroke-linecap="round" ` +
    `stroke-linejoin="round"/>` +
    `</svg>`
  )
}

/** Diameter of the whole bloom, core plus falloff. */
function bloomSize(f: MapFeature): number {
  return Math.round(radiusFor(f) * 2 * 3.1)
}

function rgb(hex: string): string {
  const h = hex.replace('#', '')
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  )
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`
}

/**
 * One continuous bloom, not a solid dot with a separate halo behind it.
 *
 * The reading is carried by hue, size, and falloff together. A single radial
 * gradient means the station reads as an area of air rather than as a pin, and
 * overlapping blooms pool into a field, which is the whole idea of the map.
 * The exact value is one click away and the legend carries the scale.
 *
 * Stale readings stay hollow and ringed so an old value cannot pass for live.
 */
function monitorBadge(f: MapFeature): string {
  const stale = f.staleHours != null
  const size = bloomSize(f)
  const color = colorFor(f)

  if (stale) {
    const d = radiusFor(f) * 2
    return (
      `<span class="${styles.monitorDotStale}" ` +
      `style="width:${d}px;height:${d}px;margin:${(size - d) / 2}px;` +
      `color:${color};border-color:${color}"></span>`
    )
  }

  const c = rgb(color)
  // Solid core out to ~20%, then a long falloff that carries almost to the
  // edge, so neighbouring stations blend into shaded areas rather than dots.
  const fill =
    `radial-gradient(circle,` +
    `rgba(${c},0.95) 0%,` +
    `rgba(${c},0.9) 20%,` +
    `rgba(${c},0.5) 40%,` +
    `rgba(${c},0.24) 58%,` +
    `rgba(${c},0.09) 74%,` +
    `rgba(${c},0) 92%)`
  return `<span class="${styles.monitorDot}" style="width:${size}px;height:${size}px;background:${fill}"></span>`
}

function monitorPopup(f: MapFeature): string {
  const band = bandFor(f.value)
  const rows = (f.detail ?? [])
    .map(
      (d) =>
        `<div class="${styles.popupRow}">` +
        `<span class="${styles.popupRowLabel}">${escapeHtml(d.label)}</span>` +
        `<span class="${styles.popupRowValue}">${escapeHtml(d.value)}</span>` +
        `</div>`,
    )
    .join('')

  const headline =
    f.value == null
      ? `<div class="${styles.popupAqiNone}">Not reporting</div>`
      : `<div class="${styles.popupAqi}" style="color:${colorFor(f)}">` +
        `<span class="${styles.popupAqiNum}">${f.value}</span>` +
        `<span class="${styles.popupAqiLabel}">` +
        `${f.staleHours != null ? 'last known AQI' : 'AQI now'} · ${escapeHtml(band?.label ?? '')}` +
        `</span>` +
        `</div>`

  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupTitle}">${escapeHtml(f.label)}</div>` +
    headline +
    rows +
    `<span class="${styles.popupReal}">verified source · EPA AirNow</span>` +
    `</div>`
  )
}

function firePopup(p: { name: string; acres: number | null; contained: number | null }): string {
  const rows: string[] = []
  if (p.acres != null) {
    rows.push(
      `<div class="${styles.popupRow}"><span class="${styles.popupRowLabel}">Size</span>` +
        `<span class="${styles.popupRowValue}">${p.acres.toLocaleString()} acres</span></div>`,
    )
  }
  // Containment is genuinely absent on some records. Show nothing rather than
  // a fabricated zero, which would read as "not contained at all".
  if (p.contained != null) {
    rows.push(
      `<div class="${styles.popupRow}"><span class="${styles.popupRowLabel}">Contained</span>` +
        `<span class="${styles.popupRowValue}">${p.contained}%</span></div>`,
    )
  }
  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupTitle}">${escapeHtml(p.name)}</div>` +
    rows.join('') +
    `<span class="${styles.popupReal}">verified source · NIFC</span>` +
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
