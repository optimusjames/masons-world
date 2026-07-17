'use client'

import { type FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import styles from './styles.module.css'
import MapView from './components/MapView'
import LayerToggles from './components/LayerToggles'
import ReliefCard from './components/ReliefCard'
import type {
  LayerId,
  CanopyGrid,
  FountainsCollection,
  CoolingCollection,
  Spot,
  ActiveSpot,
  PointFeature,
  FountainProps,
  CoolingProps,
} from './types'
import canopyRaw from './data/canopyGrid.json'
import fountainsRaw from './data/fountains.json'
import coolingRaw from './data/coolingSpots.json'

const canopy = canopyRaw as unknown as CanopyGrid
const fountains = fountainsRaw as unknown as FountainsCollection
const cooling = coolingRaw as unknown as CoolingCollection

const ALL_LAYERS: LayerId[] = ['canopy', 'fountains', 'cooling']
const OPTIONS_PER_TYPE = 3
const WATER = '#2b8fd0'
const COOL = '#6366f1'

// Haversine distance in meters between two [lat, lon] points.
function distMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function walkMin(m: number): number {
  return Math.max(1, Math.round(m / 80))
}

function nearestFountains(origin: [number, number], n: number): Spot[] {
  return (fountains.features as PointFeature<FountainProps>[])
    .map((f) => {
      const [lon, lat] = f.geometry.coordinates
      return {
        label: f.properties.name || (f.properties.bubbler ? 'Benson Bubbler' : 'Drinking fountain'),
        sub: f.properties.bubbler ? 'Benson Bubbler' : 'Public water',
        coord: [lat, lon] as [number, number],
        distM: distMeters(origin, [lat, lon]),
      }
    })
    .sort((a, b) => a.distM - b.distM)
    .slice(0, n)
}

function nearestCooling(origin: [number, number], n: number): Spot[] {
  return (cooling.features as PointFeature<CoolingProps>[])
    .map((c) => {
      const [lon, lat] = c.geometry.coordinates
      return {
        label: c.properties.name,
        sub: c.properties.kind === 'library' ? 'Library' : 'Community center',
        coord: [lat, lon] as [number, number],
        distM: distMeters(origin, [lat, lon]),
      }
    })
    .sort((a, b) => a.distM - b.distM)
    .slice(0, n)
}

// Geocode an address within the Portland area (OSM Nominatim, no key).
async function geocode(q: string): Promise<[number, number] | null> {
  try {
    const url =
      'https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1' +
      '&viewbox=-122.84,45.66,-122.46,45.43&q=' +
      encodeURIComponent(q)
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as { lat: string; lon: string }[]
    if (!data?.length) return null
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch {
    return null
  }
}

function LocateIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.4" />
      <line x1="12" y1="2.5" x2="12" y2="5.8" />
      <line x1="12" y1="18.2" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5.8" y2="12" />
      <line x1="18.2" y1="12" x2="21.5" y2="12" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  )
}

export default function CoolPdx() {
  const [visibleLayers, setVisibleLayers] = useState<LayerId[]>(ALL_LAYERS)
  const [origin, setOrigin] = useState<[number, number] | null>(null)
  const [originLabel, setOriginLabel] = useState('')
  const [selFountain, setSelFountain] = useState(0)
  const [selCooling, setSelCooling] = useState(0)
  const [locating, setLocating] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressBusy, setAddressBusy] = useState(false)

  // Fullscreen takeover: lock background scroll, Esc exits.
  useEffect(() => {
    if (!fullscreen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [fullscreen])

  const result = useMemo(() => {
    if (!origin) return null
    return {
      origin,
      originLabel,
      fountains: nearestFountains(origin, OPTIONS_PER_TYPE),
      cooling: nearestCooling(origin, OPTIONS_PER_TYPE),
    }
  }, [origin, originLabel])

  const setOriginAt = useCallback((coord: [number, number], label: string) => {
    setOrigin(coord)
    setOriginLabel(label)
    setSelFountain(0)
    setSelCooling(0)
    setNotice(null)
    setAddressQuery('')
  }, [])

  const findRelief = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setNotice('Location isn’t available here — tap the map or search an address instead.')
      return
    }
    setLocating(true)
    setNotice(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOriginAt([pos.coords.latitude, pos.coords.longitude], 'your location')
        setLocating(false)
      },
      () => {
        setNotice('Location’s off — tap anywhere on the map, or search an address, to find relief near that spot.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [setOriginAt])

  const onAddressSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()
      const q = addressQuery.trim()
      if (!q) return
      setAddressBusy(true)
      const coord = await geocode(q)
      setAddressBusy(false)
      if (coord) setOriginAt(coord, q)
      else setNotice('Couldn’t find that one near Portland — try a street address or place name.')
    },
    [addressQuery, setOriginAt],
  )

  const toggleLayer = useCallback((id: LayerId) => {
    setVisibleLayers((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]))
  }, [])

  const closeRelief = useCallback(() => {
    setOrigin(null)
    setOriginLabel('')
  }, [])

  const activeSpots = useMemo<ActiveSpot[]>(() => {
    if (!result) return []
    const out: ActiveSpot[] = []
    const f = result.fountains[selFountain]
    if (f) out.push({ key: 'fountain', coord: f.coord, color: WATER, minWalk: walkMin(f.distM) })
    const c = result.cooling[selCooling]
    if (c) out.push({ key: 'cooling', coord: c.coord, color: COOL, minWalk: walkMin(c.distM) })
    return out
  }, [result, selFountain, selCooling])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>Portland, OR · Heat relief</div>
        <h1 className={styles.title}>Cool PDX</h1>
        <p className={styles.subtitle}>
          On a hot day, find the nearest shade, water, and cool air — and see at a glance
          which parts of the city are shaded and which bake.
        </p>
      </header>

      <div className={`${styles.mapWrapper} ${fullscreen ? styles.mapWrapperFullscreen : ''}`}>
        <MapView
          visibleLayers={visibleLayers}
          canopy={canopy}
          fountains={fountains}
          cooling={cooling}
          origin={origin}
          activeSpots={activeSpots}
          onPickOrigin={(coord) => setOriginAt(coord, 'this spot')}
        />

        <form className={styles.searchForm} onSubmit={onAddressSubmit}>
          <span className={styles.searchIcon}>
            <SearchIcon />
          </span>
          <input
            className={styles.searchInput}
            type="text"
            value={addressQuery}
            onChange={(e) => setAddressQuery(e.target.value)}
            placeholder="Search an address or place"
            aria-label="Search an address or place in Portland"
          />
          {addressBusy && <span className={styles.searchBusy}>…</span>}
        </form>

        <div className={styles.mapControls}>
          <button
            type="button"
            className={styles.fsBtn}
            onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          >
            {fullscreen ? '✕' : '⤢'}
          </button>
        </div>

        <LayerToggles visibleLayers={visibleLayers} onToggle={toggleLayer} />

        {!result && (
          <div className={styles.heroWrap}>
            <button
              type="button"
              className={styles.locateHero}
              onClick={findRelief}
              disabled={locating}
            >
              <LocateIcon />
              {locating ? 'Finding nearby relief…' : 'Find relief near me'}
            </button>
            <div className={styles.heroHint}>or tap the map to check anywhere</div>
          </div>
        )}

        {result && (
          <ReliefCard
            result={result}
            selFountain={selFountain}
            selCooling={selCooling}
            onSelect={(kind, idx) => (kind === 'fountain' ? setSelFountain(idx) : setSelCooling(idx))}
            onClose={closeRelief}
          />
        )}
      </div>

      {notice && (
        <p className={styles.reliefEmpty} style={{ marginTop: 10 }}>
          {notice}
        </p>
      )}

      <div className={styles.context}>
        <div className={styles.contextBlock}>
          <h2>Why this map</h2>
          <p>
            Portland’s 2021 heat dome killed 69 people in Multnomah County. Heat is the city’s
            deadliest climate event, and it lands hardest where there’s the least tree cover.
          </p>
        </div>
        <div className={styles.contextBlock}>
          <h2>The shade gap</h2>
          <p>
            The green gradient is real street-tree density — 253,951 trees from the city’s
            inventory. Leafy westside and old neighborhoods stay cool; much of the eastside
            has far less canopy and bakes in the sun.
          </p>
        </div>
        <div className={styles.contextBlock}>
          <h2>Finding relief</h2>
          <p>
            Use your location, tap the map, or search an address — then pick from the nearest
            drinking fountains (blue) and air-conditioned libraries and community centers (indigo).
            During declared heat emergencies, Multnomah County also opens dedicated cooling shelters —{' '}
            <a href="https://www.multco.us/em/help-staying-cool" target="_blank" rel="noopener noreferrer">
              see the county list
            </a>
            .
          </p>
        </div>
      </div>

      <p className={styles.source}>
        Tree canopy: City of Portland Street Tree Inventory (binned to a density grid). Drinking
        fountains, libraries, and community centers: OpenStreetMap. Walking routes: OSRM /
        OpenStreetMap. A design experiment — verify hours and availability before relying on any
        single location.
      </p>
    </div>
  )
}
