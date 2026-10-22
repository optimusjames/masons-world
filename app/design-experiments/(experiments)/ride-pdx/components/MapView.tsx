'use client'

// All Leaflet lives in this file. Nothing else in the experiment imports it.
//
// Leaflet touches `window` at module scope, so every reference to it is behind
// a dynamic import inside an effect. Importing it at the top of the file will
// break the production build.
//
// Three kinds of marks, three strategies:
//   vehicles  ~1,500 canvas dots; from street level in, the ones on screen
//             become DOM chips with a bike or scooter icon
//   stations  308 DOM badges with the bike count printed on them
//   places    ~1,000 icon pins, culled to the viewport on every move, so only
//             what is on screen exists as DOM

import { useEffect, useRef, useState, type MutableRefObject } from 'react'
import type { Map as LeafletMap, LayerGroup, Marker, Renderer } from 'leaflet'
import styles from '../styles.module.css'
import { addBasemap } from '@/lib/basemap'
import { MAP_CONFIG } from '../map.config'
import { PLACE } from '../data/place'
import type { BikeData, LayerId, Place, PlaceCategory, Target } from '../types'
import type { LatLng, Leg } from './geo'
import { placeGlyph, stationGlyph, vehicleGlyph } from './icons'
import {
  BIKETOWN,
  CATEGORY,
  PLACE_MIN_ZOOM,
  SCOOTER,
  VEHICLE,
  VEHICLE_ICON_ZOOM,
} from './scale'

/** A ring drawn around something the current step is about. */
export interface Ring {
  at: LatLng
  /** chosen = the ride or place picked; option = a candidate the step offers */
  tone: 'chosen' | 'option'
}

/** What the parent may ask of the map directly, for the start picker. */
export interface MapApi {
  center: () => LatLng
  panTo: (at: LatLng) => void
}

type Props = {
  bikes: BikeData
  places: Place[]
  visibleLayers: LayerId[]
  categories: PlaceCategory[]
  origin: LatLng | null
  rings: Ring[]
  legs: Leg[]
  /**
   * Points the current step is about. The map frames them whenever this
   * changes, so it must be memoized by the parent: a new array every render
   * would re-frame the map every render.
   */
  frame: LatLng[]
  onSelect: (target: Target) => void
  onMapClick: (at: LatLng) => void
  /** Bumped by the parent on fullscreen toggle so the map re-measures. */
  resizeKey?: unknown
  /** Space in px kept clear for the trip sheet when framing a route. */
  framePad: { left: number; bottom: number }
  apiRef: MutableRefObject<MapApi | null>
}

type L = typeof import('leaflet')

export default function MapView({
  bikes,
  places,
  visibleLayers,
  categories,
  origin,
  rings,
  legs,
  frame,
  onSelect,
  onMapClick,
  resizeKey,
  framePad,
  apiRef,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const LRef = useRef<L | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const canvasRef = useRef<Renderer | null>(null)
  const vehiclesRef = useRef<LayerGroup | null>(null)
  const stationsRef = useRef<LayerGroup | null>(null)
  const placesRef = useRef<LayerGroup | null>(null)
  const routeRef = useRef<LayerGroup | null>(null)
  const overlayRef = useRef<LayerGroup | null>(null)
  const placeMarkers = useRef(new Map<string, Marker>())
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const onMapClickRef = useRef(onMapClick)
  onMapClickRef.current = onMapClick
  const [ready, setReady] = useState(false)
  // Bumped on moveend so viewport-culled layers re-cull.
  const [viewTick, setViewTick] = useState(0)
  const [zoom, setZoom] = useState(PLACE.zoom)

  // ---- init (once) ----------------------------------------------------------
  useEffect(() => {
    let mounted = true
    let map: LeafletMap | null = null
    let resizeObserver: ResizeObserver | null = null

    ;(async () => {
      const L = (await import('leaflet')).default
      if (!mounted || !containerRef.current) return
      LRef.current = L

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
        ...MAP_CONFIG.sources.map(
          (s) => `<a href="${s.url}" target="_blank" rel="noopener">${s.name}</a>`,
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

      // Routes sit under every marker so a pin is never hidden by its own path.
      map.createPane('routes').style.zIndex = '420'

      canvasRef.current = L.canvas({ padding: 0.3 })
      routeRef.current = L.layerGroup().addTo(map)
      vehiclesRef.current = L.layerGroup().addTo(map)
      placesRef.current = L.layerGroup().addTo(map)
      stationsRef.current = L.layerGroup().addTo(map)
      overlayRef.current = L.layerGroup().addTo(map)

      const syncZoom = () => {
        const z = map!.getZoom()
        if (containerRef.current) containerRef.current.dataset.zoom = String(z)
        setZoom(z)
      }
      syncZoom()
      map.on('zoomend', syncZoom)
      map.on('moveend', () => setViewTick((t) => t + 1))
      map.on('click', (e) => onMapClickRef.current([e.latlng.lat, e.latlng.lng]))

      mapRef.current = map
      apiRef.current = {
        center: () => {
          const c = map!.getCenter()
          return [c.lat, c.lng]
        },
        panTo: (at) => map!.panTo(at, { animate: true, duration: 0.4 }),
      }
      map.invalidateSize()
      setReady(true)

      // Without this the map renders as grey tiles inside a flex layout.
      if ('ResizeObserver' in window) {
        resizeObserver = new ResizeObserver(() => mapRef.current?.invalidateSize())
        resizeObserver.observe(containerRef.current)
      }
    })()

    const markers = placeMarkers.current
    return () => {
      mounted = false
      resizeObserver?.disconnect()
      map?.remove()
      markers.clear()
      apiRef.current = null
      mapRef.current = null
      LRef.current = null
      vehiclesRef.current = null
      stationsRef.current = null
      placesRef.current = null
      routeRef.current = null
      overlayRef.current = null
    }
  }, [apiRef])

  // Fullscreen changes the container size outside React's knowledge, so the
  // parent bumps resizeKey and Leaflet re-measures.
  useEffect(() => {
    if (!ready) return
    const id = window.setTimeout(() => mapRef.current?.invalidateSize(), 60)
    return () => window.clearTimeout(id)
  }, [resizeKey, ready])

  // ---- free-floating vehicles ------------------------------------------------
  // Dots at city scale; icon chips at street scale, where a dot no longer says
  // enough and the number on screen is small enough for DOM.
  const iconMode = zoom >= VEHICLE_ICON_ZOOM
  // The viewport only matters in icon mode. At city scale every dot is drawn,
  // so panning must not rebuild 1,500 of them.
  const vehicleViewKey = iconMode ? viewTick : -1
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    const group = vehiclesRef.current
    if (!ready || !L || !map || !group) return
    group.clearLayers()
    const showE = visibleLayers.includes('ebike')
    const showS = visibleLayers.includes('scooter')
    const view = iconMode ? map.getBounds().pad(0.2) : null

    for (const v of bikes.vehicles) {
      if (v[2] === 'e' ? !showE : !showS) continue
      const select = () => onSelectRef.current({ kind: 'vehicle', vehicle: v })

      if (view) {
        if (!view.contains([v[0], v[1]])) continue
        L.marker([v[0], v[1]], {
          icon: L.divIcon({
            className: styles.vehicleIcon,
            html: `<div class="${styles.vehicleChip}" data-kind="${v[2]}" aria-hidden="true">${vehicleGlyph(v[2])}</div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13],
          }),
          title: VEHICLE[v[2]].label,
          keyboard: true,
        })
          .on('click', select)
          .on('add', (e) => labelIcon(e.target, `BIKETOWN ${VEHICLE[v[2]].label.toLowerCase()}`))
          .addTo(group)
        continue
      }

      L.circleMarker([v[0], v[1]], {
        renderer: canvasRef.current ?? undefined,
        radius: 4.5,
        fillColor: v[2] === 'e' ? BIKETOWN : SCOOTER,
        fillOpacity: 0.95,
        color: '#ffffff',
        weight: 1.5,
        // Otherwise the click also reaches the map and clears the selection.
        bubblingMouseEvents: false,
      })
        .on('click', select)
        .addTo(group)
    }
  }, [bikes, visibleLayers, ready, iconMode, vehicleViewKey])

  // ---- stations (badges with the count printed) ----------------------------
  useEffect(() => {
    const L = LRef.current
    const group = stationsRef.current
    if (!ready || !L || !group) return
    group.clearLayers()
    if (!visibleLayers.includes('station')) return
    const glyph = stationGlyph()
    for (const s of bikes.stations) {
      const state = !s.renting ? 'off' : s.bikes === 0 ? 'empty' : 'ok'
      const icon = L.divIcon({
        className: styles.stationIcon,
        html:
          `<div class="${styles.stationPin}" data-state="${state}" aria-hidden="true">` +
          `<span class="${styles.stationGlyph}">${glyph}</span>` +
          `<span class="${styles.stationCount}">${s.bikes}</span>` +
          `</div>`,
        iconSize: [40, 48],
        iconAnchor: [20, 46],
      })
      L.marker([s.lat, s.lng], {
        icon,
        // Stations with bikes ride above empty ones where badges overlap.
        zIndexOffset: state === 'ok' ? 200 + s.bikes : 0,
        keyboard: true,
        title: `${s.name}: ${s.bikes} bikes`,
      })
        .on('click', () => onSelectRef.current({ kind: 'station', station: s }))
        .on('add', (e) => labelIcon(e.target, `${s.name}, ${s.bikes} ${s.bikes === 1 ? 'bike' : 'bikes'} ready`))
        .addTo(group)
    }
  }, [bikes, visibleLayers, ready])

  // ---- places (icon pins, viewport-culled) ---------------------------------
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    const group = placesRef.current
    if (!ready || !L || !map || !group) return

    const cache = placeMarkers.current
    const want = new Set<string>()
    if (visibleLayers.includes('place') && map.getZoom() >= PLACE_MIN_ZOOM) {
      const view = map.getBounds().pad(0.15)
      const cats = new Set(categories)
      for (const p of places) {
        if (cats.has(p.cat) && view.contains([p.lat, p.lng])) want.add(p.id)
      }
    }

    // Diff, so panning does not rebuild hundreds of DOM nodes.
    for (const [id, m] of cache) {
      if (!want.has(id)) {
        group.removeLayer(m)
        cache.delete(id)
      }
    }
    for (const p of places) {
      if (!want.has(p.id) || cache.has(p.id)) continue
      const icon = L.divIcon({
        className: styles.placeIcon,
        html:
          `<div class="${styles.placePin}" data-cat="${p.cat}" aria-hidden="true" ` +
          `style="--tint:${CATEGORY[p.cat].tint}">${placeGlyph(p.cat)}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      })
      const m = L.marker([p.lat, p.lng], { icon, title: p.name, keyboard: true })
        .on('click', () => onSelectRef.current({ kind: 'place', place: p }))
        .on('add', (e) => labelIcon(e.target, `${p.name}, ${CATEGORY[p.cat].label.toLowerCase()}`))
        .addTo(group)
      cache.set(p.id, m)
    }
  }, [places, categories, visibleLayers, viewTick, ready])

  // ---- you, the selection ring, and the route ------------------------------
  useEffect(() => {
    const L = LRef.current
    const overlay = overlayRef.current
    const routes = routeRef.current
    if (!ready || !L || !overlay || !routes) return
    overlay.clearLayers()
    routes.clearLayers()

    if (origin) {
      L.marker(origin, {
        icon: L.divIcon({
          className: styles.youIcon,
          html: `<div class="${styles.youDot}"></div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        interactive: false,
        zIndexOffset: 2000,
      }).addTo(overlay)
    }

    for (const r of rings) {
      L.marker(r.at, {
        icon: L.divIcon({
          className: styles.selIcon,
          html: `<div class="${styles.selRing}" data-tone="${r.tone}"></div>`,
          iconSize: [52, 52],
          iconAnchor: [26, 26],
        }),
        interactive: false,
        zIndexOffset: -100,
      }).addTo(overlay)
    }

    for (const leg of legs) {
      const ride = leg.mode === 'bike'
      // A white casing under every leg keeps it readable over any street color.
      L.polyline(leg.path, {
        pane: 'routes',
        color: '#ffffff',
        weight: ride ? 9 : 7,
        opacity: 0.9,
        interactive: false,
      }).addTo(routes)
      L.polyline(leg.path, {
        pane: 'routes',
        color: ride ? BIKETOWN : '#2a2320',
        weight: ride ? 5 : 3.5,
        opacity: 0.95,
        dashArray: ride ? undefined : '1 8',
        lineCap: 'round',
        interactive: false,
      }).addTo(routes)
    }
  }, [origin, rings, legs, ready])

  // Frame what the current step is about, leaving room for the sheet. One
  // point is a place to stand, so zoom to street level instead of fitting.
  useEffect(() => {
    const L = LRef.current
    const map = mapRef.current
    if (!ready || !L || !map || !frame.length) return
    if (frame.length === 1) {
      map.flyTo(frame[0], Math.max(map.getZoom(), 16), { duration: 0.8 })
      return
    }
    map.flyToBounds(L.latLngBounds(frame), {
      paddingTopLeft: [framePad.left, 80],
      paddingBottomRight: [60, framePad.bottom],
      maxZoom: 17,
      duration: 0.8,
    })
    // Framing follows the step, not the sheet: re-fitting every time the sheet
    // resizes would yank the map while someone is panning it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frame, ready])

  return <div ref={containerRef} className={styles.map} />
}

/**
 * Give a divIcon marker an accessible name. Leaflet names it by its content,
 * which for a station badge is just a number, so a screen reader heard "5,
 * button" for every station. The badge content is aria-hidden and this label
 * says what it is.
 */
function labelIcon(marker: Marker, label: string) {
  marker.getElement()?.setAttribute('aria-label', label)
}
