'use client'

import { useCallback, useEffect, useState } from 'react'
import styles from './styles.module.css'
import MapView from './components/MapView'
import LayerToggles from './components/LayerToggles'
import Legend from './components/Legend'
import ReliefCard from './components/ReliefCard'
import type {
  LayerId,
  CanopyGrid,
  FountainsCollection,
  CoolingCollection,
  NearestResult,
  NearestSpot,
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

function LocateIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3.4" />
      <line x1="12" y1="2.5" x2="12" y2="5.8" />
      <line x1="12" y1="18.2" x2="12" y2="21.5" />
      <line x1="2.5" y1="12" x2="5.8" y2="12" />
      <line x1="18.2" y1="12" x2="21.5" y2="12" />
    </svg>
  )
}

// Haversine distance in meters between two [lat, lon] points.
function distMeters(a: [number, number], b: [number, number]): number {
  const R = 6371000
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLon = toRad(b[1] - a[1])
  const lat1 = toRad(a[0])
  const lat2 = toRad(b[0])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function nearestFountain(user: [number, number]): NearestSpot | null {
  let best: NearestSpot | null = null
  for (const f of fountains.features as PointFeature<FountainProps>[]) {
    const [lon, lat] = f.geometry.coordinates
    const d = distMeters(user, [lat, lon])
    if (!best || d < best.distM) {
      best = {
        label: f.properties.name || (f.properties.bubbler ? 'Benson Bubbler' : 'Drinking fountain'),
        sub: f.properties.bubbler ? 'Benson Bubbler' : 'Public water',
        coord: [lat, lon],
        distM: d,
      }
    }
  }
  return best
}

function nearestCooling(user: [number, number]): NearestSpot | null {
  let best: NearestSpot | null = null
  for (const c of cooling.features as PointFeature<CoolingProps>[]) {
    const [lon, lat] = c.geometry.coordinates
    const d = distMeters(user, [lat, lon])
    if (!best || d < best.distM) {
      best = {
        label: c.properties.name,
        sub: c.properties.kind === 'library' ? 'Library' : 'Community center',
        coord: [lat, lon],
        distM: d,
      }
    }
  }
  return best
}

export default function CoolPdx() {
  const [visibleLayers, setVisibleLayers] = useState<LayerId[]>(ALL_LAYERS)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
  const [nearest, setNearest] = useState<NearestResult | null>(null)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)

  // While in fullscreen takeover, lock background scroll and let Esc exit.
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

  const toggleLayer = useCallback((id: LayerId) => {
    setVisibleLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )
  }, [])

  const findRelief = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoError('Location not available on this device.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const user: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        setUserLocation(user)
        setNearest({
          user,
          fountain: nearestFountain(user),
          cooling: nearestCooling(user),
        })
        setLocating(false)
      },
      () => {
        setGeoError('Couldn’t get your location — pan the map to explore instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [])

  const closeRelief = useCallback(() => {
    setUserLocation(null)
    setNearest(null)
  }, [])

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
          userLocation={userLocation}
          nearest={nearest}
        />
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
        {!nearest && (
          <button
            type="button"
            className={styles.locateHero}
            onClick={findRelief}
            disabled={locating}
          >
            <LocateIcon />
            {locating ? 'Finding nearby relief…' : 'Find relief near me'}
          </button>
        )}
        {nearest && <ReliefCard nearest={nearest} onClose={closeRelief} />}
      </div>

      <Legend />

      {geoError && <p className={styles.reliefEmpty} style={{ marginTop: 10 }}>{geoError}</p>}

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
            Blue dots are drinking fountains; indigo are libraries and community centers — public,
            air-conditioned, open to all. During declared heat emergencies, Multnomah County also
            opens dedicated cooling shelters —{' '}
            <a
              href="https://www.multco.us/em/help-staying-cool"
              target="_blank"
              rel="noopener noreferrer"
            >
              see the county list
            </a>
            .
          </p>
        </div>
      </div>

      <p className={styles.source}>
        Tree canopy: City of Portland Street Tree Inventory (binned to a density grid). Drinking
        fountains, libraries, and community centers: OpenStreetMap. A design experiment — verify
        hours and availability before relying on any single location.
      </p>
    </div>
  )
}
