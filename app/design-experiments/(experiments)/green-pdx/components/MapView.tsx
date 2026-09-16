'use client'

// All Leaflet lives in this file. Nothing else in the experiment imports it.
// Leaflet touches `window` at module scope, so every reference is behind a
// dynamic import inside an effect. Importing it at the top breaks the build.

import { useEffect, useRef, useState } from 'react'
import type { Map as LeafletMap, LayerGroup } from 'leaflet'
import { addBasemap, addLabelsOverlay } from '@/lib/basemap'
import styles from '../styles.module.css'
import { MAP_CONFIG } from '../map.config'
import { PAN_BOUNDS, PLACE } from '../data/place'
import type { LayerId, MapFeature, MapFocus, ShapeFeature, ShapeLayer } from '../types'
import {
  acresLabel,
  FILL_OPACITY,
  GARDEN,
  gardenRadius,
  LAYER_COLOR,
  NEIGHBORHOOD,
  NATURAL_EDGE,
  PARK_EDGE,
  showsPlotBadge,
  STROKE_DASH,
} from './scale'

/**
 * Where a reader goes to actually do something about what they just found.
 *
 * Both verified returning 200 on 2026-09-15. The city's data has no plot
 * availability and no per-garden contact, so the map does not claim to know
 * whether a plot is free — it points at the program that does. Guessing at a
 * deeper link was tried and rejected: /parks/community-gardens/get-plot is a
 * 404.
 */
const GARDEN_PROGRAM = 'https://www.portland.gov/parks/community-gardens'
const PARKS_VOLUNTEER = 'https://www.portland.gov/parks/volunteer'
const PARK_FINDER = 'https://www.portland.gov/parks/find-park'
const NATURAL_AREAS = 'https://www.portland.gov/parks/natural-areas'
const CIVIC_LIFE = 'https://www.portland.gov/civic'

type Props = {
  features: MapFeature[]
  shapes: ShapeLayer[]
  visibleLayers: LayerId[]
  /** Bumped by the parent on fullscreen toggle so the map re-measures. */
  resizeKey?: unknown
  /** Set by the parent to fly somewhere and open its card. */
  focus?: MapFocus | null
  /** Bumped by the parent to return to the opening view. */
  resetKey?: number
  /** Told whether the map is sitting on its opening view, so the parent can
   *  offer the way back only when there is somewhere to come back from. */
  onHomeChange?: (atHome: boolean) => void
}

/** Polygon layers, bottom to top. Neighborhood lines sit under the fills so a
 *  boundary never draws across the middle of a park. */
const SHAPE_ORDER: LayerId[] = ['neighborhood', 'park', 'natural']

export default function MapView({
  features,
  shapes,
  visibleLayers,
  resizeKey,
  focus,
  resetKey = 0,
  onHomeChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const shapesRef = useRef<LayerGroup | null>(null)
  const gardensRef = useRef<LayerGroup | null>(null)
  const onHomeRef = useRef(onHomeChange)
  onHomeRef.current = onHomeChange
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
        // The data stops at the city limits; the camera gets a padded box so a
        // park on the boundary can still be centered.
        maxBounds: PAN_BOUNDS,
        maxBoundsViscosity: 0.6,
        zoomControl: false,
        attributionControl: false,
        // Nearly a thousand polygons. Canvas is not optional.
        preferCanvas: true,
      })

      L.control.zoom({ position: 'bottomright' }).addTo(map)

      // The basemap credit travels with the tiles and always shows. The data
      // sources are wrapped so CSS can drop them on a phone, where the
      // provenance footer below the map says the same thing at more length.
      const sourceCredits = MAP_CONFIG.sources
        .map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`)
        .join(' · ')
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution(
          `${MAP_CONFIG.basemap.attribution}` +
            `<span class="greenAttrSources"> · ${sourceCredits}</span>`,
        )
        .addTo(map)

      // Another await, so the component can unmount mid-flight; bail before
      // touching a map the cleanup has already removed.
      await addBasemap(map, { theme: MAP_CONFIG.basemap.theme })
      if (!mounted) return

      shapesRef.current = L.layerGroup().addTo(map)
      gardensRef.current = L.layerGroup().addTo(map)

      // Place names on their own pane, BELOW the garden markers.
      //
      // The fills cover the basemap, so labels baked into the tiles stop being
      // readable and need their own pane on top of the tint. But garden markers
      // print a plot count, and a street name landing on a number would hide
      // data. 450 puts names above the polygon pane (400) and below the marker
      // pane (600), which is the rule for markers that carry a value.
      map.createPane('labels')
      const labelPane = map.getPane('labels')!
      labelPane.style.zIndex = '450'
      labelPane.style.pointerEvents = 'none'
      await addLabelsOverlay(map, { theme: MAP_CONFIG.basemap.theme, pane: 'labels' })
      if (!mounted) return

      // "Home" is a small circle around the opening view, not an exact match:
      // Leaflet's animations land a few metres off, and a control that flickers
      // back because of rounding is worse than no control.
      const reportHome = () => {
        const m = mapRef.current
        if (!m) return
        onHomeRef.current?.(
          m.getZoom() === PLACE.zoom && m.getCenter().distanceTo(L.latLng(PLACE.center)) < 600,
        )
      }
      map.on('moveend zoomend', reportHome)
      reportHome()

      mapRef.current = map
      map.invalidateSize()
      setReady(true)

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
      shapesRef.current = null
      gardensRef.current = null
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

  // ---- polygons -------------------------------------------------------------
  useEffect(() => {
    const group = shapesRef.current
    if (!group || !ready) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()

      for (const layer of SHAPE_ORDER) {
        if (!visibleLayers.includes(layer)) continue
        const shape = shapes.find((s) => s.layer === layer)
        if (!shape) continue

        const isHood = layer === 'neighborhood'
        L.geoJSON(shape.geojson as never, {
          // Boundaries stay clickable, which is safe only because they have no
          // fill: with `fill: false` the hit target is the hairline itself, so
          // a click inside a neighborhood still reaches the park underneath and
          // only a deliberate click on the line opens the boundary.
          interactive: true,
          style: () =>
            isHood
              ? {
                  color: NEIGHBORHOOD,
                  weight: 0.8,
                  opacity: 0.4,
                  dashArray: '3 4',
                  fill: false,
                }
              : {
                  // A darker step of the same hue, because the fills are pale
                  // enough to stack and a pale fill on a pale basemap has no
                  // edge of its own.
                  color: layer === 'park' ? PARK_EDGE : NATURAL_EDGE,
                  weight: layer === 'park' ? 1.3 : 1,
                  opacity: layer === 'park' ? 0.9 : 0.75,
                  // Line style separates the two greens by a channel that
                  // survives colorblindness and grayscale both: parks solid and
                  // municipal, natural area parcels dashed like the inventory
                  // lines they are.
                  dashArray: STROKE_DASH[layer],
                  fillColor: LAYER_COLOR[layer],
                  // Under the 0.55 ceiling, because these two layers
                  // legitimately overlap and have to stay readable stacked.
                  fillOpacity: FILL_OPACITY[layer] ?? 0.4,
                },
          onEachFeature: (feat, lyr) => {
            const f = feat as ShapeFeature
            lyr.bindPopup(isHood ? hoodPopup(f) : shapePopup(f, layer), {
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

  // ---- community gardens ----------------------------------------------------
  //
  // Points rather than polygons: the median garden is a fraction of an acre and
  // would be smaller than the dot marking it. The plot count rides inside the
  // marker where there is room for it, because that number is the whole reason
  // a garden is interesting.
  useEffect(() => {
    const group = gardensRef.current
    if (!group || !ready) return
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled) return
      group.clearLayers()
      if (!visibleLayers.includes('garden')) return

      for (const f of features) {
        if (f.layer !== 'garden') continue
        const r = gardenRadius(f.value)
        const size = r * 2
        const marker = L.marker([f.lat, f.lng], {
          icon: L.divIcon({
            className: styles.gardenIcon,
            html: gardenMark(f),
            iconSize: [size, size],
            iconAnchor: [r, r],
          }),
          // Bigger gardens draw on top, so the one with 90 plots is never
          // hidden under the one with 6.
          zIndexOffset: 400 + Math.min(f.value ?? 0, 200),
          riseOnHover: true,
        })
        marker.bindPopup(gardenPopup(f), {
          closeButton: true,
          className: styles.popupWrap,
          maxWidth: 250,
          ...POPUP_PAN,
        })
        marker.addTo(group)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [features, visibleLayers, ready])

  // ---- fly to something -----------------------------------------------------
  useEffect(() => {
    if (!ready || !focus) return
    let cancelled = false
    let timer = 0

    ;(async () => {
      const L = (await import('leaflet')).default
      const map = mapRef.current
      if (cancelled || !map) return

      if (focus.kind === 'city') {
        map.closePopup()
        map.flyTo(PLACE.center, PLACE.zoom, { duration: 0.9 })
        return
      }

      let opened = false
      const openCard = (at: [number, number], html: string, width = 260) => {
        if (cancelled || opened) return
        opened = true
        L.popup({ className: styles.popupWrap, maxWidth: width, ...POPUP_PAN })
          .setLatLng(at)
          .setContent(html)
          .openOn(map)
      }

      // Landing is what normally opens the card. The timer covers the case
      // where the map is already there and never moves, which would otherwise
      // leave a click with nothing to show for it.
      const land = (fn: () => void) => {
        map.once('moveend', fn)
        timer = window.setTimeout(fn, 1400)
      }

      if (focus.kind === 'garden') {
        const at: [number, number] = [focus.feature.lat, focus.feature.lng]
        map.flyTo(at, Math.max(map.getZoom(), 15), { duration: 0.9 })
        land(() => openCard(at, gardenPopup(focus.feature), 250))
        return
      }

      const box = coordBounds(focus.feature.geometry.coordinates)
      if (!box) return
      const center: [number, number] = [
        (box[0][0] + box[1][0]) / 2,
        (box[0][1] + box[1][1]) / 2,
      ]
      map.flyToBounds(L.latLngBounds(box), {
        paddingTopLeft: [40, 90],
        paddingBottomRight: [40, 60],
        maxZoom: 15,
        duration: 0.9,
      })
      land(() => openCard(center, shapePopup(focus.feature, focus.layer)))
    })()

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [focus, ready])

  // ---- back to the opening view ---------------------------------------------
  useEffect(() => {
    if (!ready || !resetKey) return
    const map = mapRef.current
    if (!map) return
    map.closePopup()
    map.flyTo(PLACE.center, PLACE.zoom, { duration: 0.8 })
  }, [resetKey, ready])

  return <div ref={containerRef} className={styles.map} />
}

// ---- helpers --------------------------------------------------------------

/**
 * Autopan margins for every popup on this map.
 *
 * The top strip carries the legend and the controls, the bottom carries the
 * zoom buttons and the attribution, so a popup that merely fits inside the
 * container can still open under furniture.
 */
const POPUP_PAN = {
  autoPan: true,
  autoPanPaddingTopLeft: [18, 76] as [number, number],
  autoPanPaddingBottomRight: [18, 46] as [number, number],
}

/**
 * The garden marker.
 *
 * Above 20 plots the count prints inside the dot; below that it would have to
 * shrink past legibility, so the dot stays plain and the number lives in the
 * popup. Either way the size carries the plot count, which is the second
 * channel the palette's contrast warning obliges.
 */
function gardenMark(f: MapFeature): string {
  const r = gardenRadius(f.value)
  const size = r * 2
  if (showsPlotBadge(f.value)) {
    return (
      `<span class="${styles.gardenBadge}" ` +
      `style="width:${size}px;height:${size}px;background:${GARDEN}">` +
      `${f.value}</span>`
    )
  }
  // Too small for a number, so it gets the sprout instead. A plain dot said
  // "something is here"; this says what kind of something, which is the whole
  // job of a marker on a map with three layers.
  return (
    `<span class="${styles.gardenDot}" ` +
    `style="width:${size}px;height:${size}px;background:${GARDEN}">` +
    `<svg viewBox="0 0 12 12" aria-hidden><path d="M6 10V5.4" ` +
    `stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>` +
    `<path d="M6 5.6C6 4 4.9 2.9 3.3 2.9c0 1.6 1.1 2.7 2.7 2.7z" fill="#fff"/>` +
    `<path d="M6 5.2c0-1.4 1-2.4 2.4-2.4 0 1.4-1 2.4-2.4 2.4z" fill="#fff" ` +
    `opacity="0.8"/></svg>` +
    `</span>`
  )
}

function gardenPopup(f: MapFeature): string {
  const rows = (f.detail ?? [])
    .map(
      (d) =>
        `<div class="${styles.popupRow}">` +
        `<span class="${styles.popupRowLabel}">${escapeHtml(d.label)}</span>` +
        `<span class="${styles.popupRowValue}">${escapeHtml(d.value)}</span>` +
        `</div>`,
    )
    .join('')

  // The data has plot counts but no availability and no per-garden contact, so
  // the map sends people to the program that has both rather than implying it
  // knows whether a plot is free this season.
  const cta =
    `<a class="${styles.popupCta}" href="${GARDEN_PROGRAM}" target="_blank" rel="noopener">` +
    `How to request a plot <span aria-hidden>→</span></a>`

  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupHead}">` +
    `<span class="${styles.popupDot}" style="background:${GARDEN}"></span>` +
    `<span class="${styles.popupKind}">Community garden</span>` +
    `</div>` +
    `<div class="${styles.popupTitle}">${escapeHtml(f.label)}</div>` +
    rows +
    cta +
    `<span class="${styles.popupReal}">verified source · Portland Parks &amp; Rec</span>` +
    `</div>`
  )
}

function shapePopup(feat: ShapeFeature, layer: LayerId): string {
  const p = feat.properties
  const rows: string[] = []

  const row = (label: string, value: string) =>
    `<div class="${styles.popupRow}">` +
    `<span class="${styles.popupRowLabel}">${escapeHtml(label)}</span>` +
    `<span class="${styles.popupRowValue}">${escapeHtml(value)}</span>` +
    `</div>`

  if (layer === 'park') {
    const acres = acresLabel(p.acres)
    // A park with no acreage in the source gets no size row rather than a zero.
    if (acres) rows.push(row('Size', acres))
  } else {
    if (p.manager) rows.push(row('Managed by', p.manager))
    if (p.owner) rows.push(row('Owner', p.owner))
    if (p.unit) rows.push(row('Unit', p.unit))
  }

  // The inventory has no name for 25 of its parcels. Saying so is better than
  // borrowing the name of whatever it sits next to.
  const unnamed =
    layer === 'natural' && p.named === false
      ? `<div class="${styles.popupNote}">This parcel has no name in the city's inventory.</div>`
      : ''

  // Two ways out: learn more about this kind of place, or go do something in
  // one. Neither link is per-feature, because the city does not publish a page
  // per park in any form we can construct a URL for, and a guessed URL that
  // 404s is worse than an honest one that lands on the finder.
  const cta =
    `<span class="${styles.popupCtaRow}">` +
    `<a class="${styles.popupCta}" href="${layer === 'park' ? PARK_FINDER : NATURAL_AREAS}" ` +
    `target="_blank" rel="noopener">` +
    `${layer === 'park' ? 'Look this park up' : 'About natural areas'} ` +
    `<span aria-hidden>→</span></a>` +
    `<a class="${styles.popupCtaQuiet}" href="${PARKS_VOLUNTEER}" target="_blank" rel="noopener">` +
    `${layer === 'park' ? 'Volunteer' : 'Help restore'}</a>` +
    `</span>`

  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupHead}">` +
    `<span class="${styles.popupDot}" style="background:${LAYER_COLOR[layer]}"></span>` +
    `<span class="${styles.popupKind}">${layer === 'park' ? 'Park' : 'Natural area'}</span>` +
    `</div>` +
    `<div class="${styles.popupTitle}">${escapeHtml(p.name)}</div>` +
    rows.join('') +
    unnamed +
    cta +
    `<span class="${styles.popupReal}">verified source · Portland Parks &amp; Rec</span>` +
    `</div>`
  )
}

/**
 * The neighborhood boundary popup.
 *
 * Reachable only by clicking the hairline itself, which is why the layer can
 * be interactive without stealing clicks from the parks inside it. It answers
 * the question the line raises — what is this place called, and who organizes
 * here — and points at the city's civic life office, which is where a
 * neighborhood association is actually found.
 */
function hoodPopup(feat: ShapeFeature): string {
  const p = feat.properties
  const rows = p.coalition
    ? `<div class="${styles.popupRow}">` +
      `<span class="${styles.popupRowLabel}">Coalition</span>` +
      `<span class="${styles.popupRowValue}">${escapeHtml(p.coalition)}</span>` +
      `</div>`
    : ''

  return (
    `<div class="${styles.popup}">` +
    `<div class="${styles.popupHead}">` +
    `<span class="${styles.popupDot}" style="background:${NEIGHBORHOOD}"></span>` +
    `<span class="${styles.popupKind}">Neighborhood</span>` +
    `</div>` +
    `<div class="${styles.popupTitle}">${escapeHtml(p.name)}</div>` +
    rows +
    `<a class="${styles.popupCta}" href="${CIVIC_LIFE}" target="_blank" rel="noopener">` +
    `Find your neighborhood association <span aria-hidden>→</span></a>` +
    `<span class="${styles.popupReal}">verified source · City of Portland</span>` +
    `</div>`
  )
}

/**
 * The bounding box of any GeoJSON coordinate nest, polygon or multipolygon.
 * The geometry is typed loosely because it arrives from ArcGIS, so this walks
 * it with runtime checks rather than trusting a cast.
 */
function coordBounds(coords: unknown): [[number, number], [number, number]] | null {
  let s = 90
  let w = 180
  let n = -90
  let e = -180
  const walk = (c: unknown) => {
    if (!Array.isArray(c)) return
    if (typeof c[0] === 'number' && typeof c[1] === 'number') {
      const [lng, lat] = c as [number, number]
      if (lat < s) s = lat
      if (lat > n) n = lat
      if (lng < w) w = lng
      if (lng > e) e = lng
      return
    }
    for (const child of c) walk(child)
  }
  walk(coords)
  return n >= s && e >= w ? [[s, w], [n, e]] : null
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
