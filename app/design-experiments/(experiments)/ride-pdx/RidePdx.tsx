'use client'

// Ride PDX is a short conversation, one question per screen:
//
//   start     where are you?            (StartPanel over a dimmed map)
//   picking   drag the map under a pin  (only if they chose to pick)
//   ride      bike, scooter, or either?
//   dest      where to?
//   trip      walk, then ride, and how long
//   browse    "just look around": no start, tap pins, toggle layers in the key
//
// The step decides what the map shows. Choosing a ride hides the places,
// choosing a category shows only that category, and choosing a bike hides the
// scooters. That is what keeps the map readable without a row of filters.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LocateFixed, Maximize2, Minimize2 } from 'lucide-react'
import MapHero from '@/app/design-experiments/components/MapHero'
import styles from './styles.module.css'
import MapView, { type MapApi, type Ring } from './components/MapView'
import Legend from './components/Legend'
import { BrowseStep, DestStep, RideStep, TripStep } from './components/FlowSheet'
import StartPanel, { PickCard, PickPin } from './components/StartPanel'
import { MAP_CONFIG } from './map.config'
import { PLACE } from './data/place'
import { distMeters, type LatLng, type Leg } from './components/geo'
import { CATEGORIES, DEFAULT_CATEGORIES } from './components/scale'
import { rideFromTarget, type Ride } from './components/trip'
import {
  useDestOptions,
  useLeg,
  useRideOptions,
  useWalkAll,
  type RideChoice,
} from './hooks/useTrip'
import type { BikeData, LayerId, Place, PlaceCategory, Target } from './types'
import placesRaw from './data/places.json'

const places = (placesRaw as { places: Place[] }).places

/** The feed's ttl. Polling faster cannot find anything new. */
const POLL_MS = 60_000

/** Past this from downtown, a shared location is not a useful start for a Portland ride. */
const FAR_METERS = 30_000

type Step = 'start' | 'picking' | 'ride' | 'dest' | 'trip' | 'browse'

const ALL_VEHICLES: LayerId[] = ['station', 'ebike', 'scooter']
const VEHICLES_FOR: Record<RideChoice, LayerId[]> = {
  bike: ['station', 'ebike'],
  scooter: ['scooter'],
  any: ALL_VEHICLES,
}

export default function RidePdx({ initialBikes }: { initialBikes: BikeData }) {
  const [bikes, setBikes] = useState(initialBikes)
  const [refreshing, setRefreshing] = useState(false)
  const [step, setStep] = useState<Step>('start')
  const [origin, setOrigin] = useState<LatLng | null>(null)
  const [originLabel, setOriginLabel] = useState<string | null>(null)
  const [choice, setChoice] = useState<RideChoice>('any')
  const [ride, setRide] = useState<Ride | null>(null)
  const [category, setCategory] = useState<PlaceCategory | null>(null)
  const [dest, setDest] = useState<Place | null>(null)
  const [browseSel, setBrowseSel] = useState<Target | null>(null)
  const [browseLayers, setBrowseLayers] = useState<LayerId[]>([...ALL_VEHICLES, 'place'])
  const [browseCats, setBrowseCats] = useState<PlaceCategory[]>(DEFAULT_CATEGORIES)
  const [locating, setLocating] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const mapApi = useRef<MapApi | null>(null)

  const destAt: LatLng | null = dest ? [dest.lat, dest.lng] : null
  const rideOptions = useRideOptions(origin, bikes)
  const walkLeg = useLeg(origin, ride?.at ?? null, 'foot')
  const destOptions = useDestOptions(ride?.at ?? null, places, category)
  const rideLeg = useLeg(ride?.at ?? null, destAt, 'bike')
  const walkAll = useWalkAll(origin, destAt)

  // ---- live bikes -------------------------------------------------------------
  const refresh = useCallback(async (force = false) => {
    setRefreshing(true)
    try {
      const res = await fetch(`/api/ride-pdx${force ? '?force=1' : ''}`)
      if (res.ok) setBikes((await res.json()) as BikeData)
    } catch {
      // Keep what we have. The key still shows its age.
    } finally {
      setRefreshing(false)
    }
  }, [])

  // ISR serves the last built page first and rebuilds behind it, so the first
  // visitor after a quiet stretch can land on bikes from hours ago. If what
  // arrived is older than two feed windows, fetch fresh right away.
  useEffect(() => {
    if (Date.now() - new Date(initialBikes.asOf).getTime() > 2 * POLL_MS) refresh()
  }, [initialBikes, refresh])

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh()
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [refresh])

  // ---- fullscreen takeover: lock background scroll, Esc exits -------------
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

  // ---- step 1: where are you ----------------------------------------------------
  const startAt = useCallback((at: LatLng, label: string) => {
    setOrigin(at)
    setOriginLabel(label)
    setRide(null)
    setDest(null)
    setNotice(null)
    setStep('ride')
  }, [])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setNotice('Location is not available in this browser. Pick a spot on the map instead.')
      setStep('start')
      return
    }
    setLocating(true)
    setNotice(null)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const here: LatLng = [pos.coords.latitude, pos.coords.longitude]
        if (distMeters(here, PLACE.center) > FAR_METERS) {
          setNotice('You look to be outside Portland. Pick a spot on the map or type an address instead.')
          setStep('start')
          return
        }
        startAt(here, 'your location')
      },
      () => {
        setLocating(false)
        setNotice('Location is off. Pick a spot on the map or type an address instead.')
        setStep('start')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [startAt])

  // Someone who already granted location skips step 1: we go straight to
  // finding them. Only an existing grant does this; we never prompt on load.
  useEffect(() => {
    let cancelled = false
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((p) => {
        if (!cancelled && p.state === 'granted') locate()
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [locate])

  const confirmPick = useCallback(() => {
    const at = mapApi.current?.center()
    if (at) startAt(at, 'the spot you picked')
  }, [startAt])

  // ---- steps 2 and 3 --------------------------------------------------------------
  const chooseRide = useCallback((c: RideChoice, r: Ride) => {
    setChoice(c)
    setRide(r)
    setStep((s) => (s === 'ride' ? 'dest' : s))
  }, [])

  const chooseDest = useCallback((p: Place) => {
    setCategory(p.cat)
    setDest(p)
    setStep('trip')
  }, [])

  const restart = useCallback(() => {
    setRide(null)
    setDest(null)
    setCategory(null)
    setStep('ride')
  }, [])

  // A tap on the map answers whatever the current step is asking.
  const onSelect = useCallback(
    (t: Target) => {
      if (step === 'browse') {
        setBrowseSel(t)
        return
      }
      if (step === 'ride' || step === 'dest' || step === 'trip') {
        if (t.kind === 'place') {
          if (step !== 'ride') chooseDest(t.place)
          return
        }
        const r = rideFromTarget(t, origin)
        if (!r) {
          setNotice('That station has nothing to rent right now.')
          return
        }
        setNotice(null)
        chooseRide(r.kind === 's' ? 'scooter' : choice === 'scooter' ? 'bike' : choice, r)
      }
    },
    [step, origin, choice, chooseDest, chooseRide],
  )

  const onMapClick = useCallback(
    (at: LatLng) => {
      // While picking, a tap moves the map to the tap so the pin lands there.
      if (step === 'picking') mapApi.current?.panTo(at)
      else if (step === 'browse') setBrowseSel(null)
    },
    [step],
  )

  // ---- what the map shows for this step -------------------------------------------
  const inTrip = step === 'dest' || step === 'trip'
  // Once a ride is chosen, show only its kind: someone on an e-bike has no use
  // for a thousand scooters, even if they asked for "whichever's closest".
  const rideVehicles = ride ? VEHICLES_FOR[ride.kind === 's' ? 'scooter' : 'bike'] : VEHICLES_FOR[choice]
  const visibleLayers: LayerId[] =
    step === 'browse'
      ? browseLayers
      : inTrip
        ? [...rideVehicles, ...(category ? (['place'] as LayerId[]) : [])]
        : ALL_VEHICLES
  const visibleCats = step === 'browse' ? browseCats : inTrip && category ? [category] : []

  const legs = useMemo<Leg[]>(() => {
    if (step === 'dest') return walkLeg ? [walkLeg] : []
    if (step === 'trip') return [walkLeg, rideLeg].filter((l): l is Leg => Boolean(l))
    return []
  }, [step, walkLeg, rideLeg])

  const rings = useMemo<Ring[]>(() => {
    if (step === 'browse' && browseSel) {
      const t = browseSel
      const at: LatLng =
        t.kind === 'place'
          ? [t.place.lat, t.place.lng]
          : t.kind === 'station'
            ? [t.station.lat, t.station.lng]
            : [t.vehicle[0], t.vehicle[1]]
      return [{ at, tone: 'chosen' }]
    }
    if (step === 'ride') {
      const seen = new Set<string>()
      return Object.values(rideOptions)
        .map((o) => o!.item.at)
        .filter((at) => !seen.has(at.join()) && seen.add(at.join()))
        .map((at) => ({ at, tone: 'option' as const }))
    }
    const out: Ring[] = []
    if (inTrip && ride) out.push({ at: ride.at, tone: 'chosen' })
    if (step === 'trip' && destAt) out.push({ at: destAt, tone: 'chosen' })
    return out
    // destAt is derived from dest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, browseSel, rideOptions, ride, dest, inTrip])

  // The points each step is about. Keyed by their coordinates, so routed
  // minutes arriving (new objects, same places) do not re-frame the map.
  const framePoints: LatLng[] = (() => {
    if (step === 'ride' && origin)
      return [origin, ...Object.values(rideOptions).map((o) => o!.item.at)]
    if (step === 'dest' && origin && ride)
      return category
        ? [ride.at, ...destOptions.map((o) => [o.item.lat, o.item.lng] as LatLng)]
        : [origin, ride.at]
    if (step === 'trip' && origin && ride && destAt) return [origin, ride.at, destAt]
    return []
  })()
  const frameKey = framePoints.map((p) => p.join()).sort().join('|')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const frame = useMemo(() => framePoints, [frameKey])

  // ---- browse toggles ---------------------------------------------------------------
  const toggleLayer = (id: LayerId) =>
    setBrowseLayers((prev) => (prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]))
  const toggleCategory = (id: PlaceCategory) => {
    if (!browseLayers.includes('place')) toggleLayer('place')
    setBrowseCats((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : CATEGORIES.map((c) => c.id).filter((c) => c === id || prev.includes(c)),
    )
  }

  // ---- keep framed points clear of the sheet --------------------------------------
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [framePad, setFramePad] = useState({ left: 40, bottom: 40 })
  useEffect(() => {
    const wrap = wrapRef.current
    const sheet = wrap?.querySelector<HTMLElement>('[data-sheet]')
    if (!wrap || !sheet || !('ResizeObserver' in window)) return
    const measure = () => {
      const docked = sheet.offsetWidth > wrap.offsetWidth * 0.6
      setFramePad(
        docked
          ? { left: 40, bottom: sheet.offsetHeight + 30 }
          : { left: sheet.offsetWidth + 40, bottom: 40 },
      )
    }
    const ro = new ResizeObserver(measure)
    ro.observe(sheet)
    ro.observe(wrap)
    return () => ro.disconnect()
  }, [])

  return (
    <div className={styles.page}>
      <MapHero place={MAP_CONFIG.place.name} title={MAP_CONFIG.title} dek={MAP_CONFIG.dek} />

      <div
        ref={wrapRef}
        className={`${styles.mapWrapper} ${fullscreen ? styles.mapWrapperFullscreen : ''}`}
        data-step={step}
      >
        <MapView
          bikes={bikes}
          places={places}
          visibleLayers={visibleLayers}
          categories={visibleCats}
          origin={origin}
          rings={rings}
          legs={legs}
          frame={frame}
          onSelect={onSelect}
          onMapClick={onMapClick}
          resizeKey={fullscreen}
          framePad={framePad}
          apiRef={mapApi}
        />

        <div className={styles.mapControls}>
          <button
            type="button"
            className={styles.fsBtn}
            onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            type="button"
            className={styles.fsBtn}
            onClick={locate}
            disabled={locating}
            aria-label="Start from my location"
            title="Start from my location"
          >
            <LocateFixed size={17} />
          </button>
        </div>

        <Legend
          bikes={bikes}
          refreshing={refreshing}
          onRefresh={() => refresh(true)}
          toggles={
            step === 'browse'
              ? {
                  layers: browseLayers,
                  categories: browseCats,
                  onLayer: toggleLayer,
                  onCategory: toggleCategory,
                }
              : undefined
          }
        />

        {step === 'picking' && <PickPin />}

        <div data-sheet className={styles.sheetSlot} hidden={step === 'start'}>
          <section className={styles.sheet} aria-live="polite">
            {step === 'picking' && <PickCard onConfirm={confirmPick} onCancel={() => setStep('start')} />}
            {step === 'ride' && (
              <RideStep
                options={rideOptions}
                originLabel={originLabel}
                onChoose={chooseRide}
                onBack={() => setStep('start')}
              />
            )}
            {step === 'dest' && ride && (
              <DestStep
                ride={ride}
                walkLeg={walkLeg}
                category={category}
                options={destOptions}
                onCategory={setCategory}
                onChoose={chooseDest}
                onBack={() => setStep('ride')}
              />
            )}
            {step === 'trip' && ride && dest && origin && (
              <TripStep
                place={dest}
                ride={ride}
                origin={origin}
                walkLeg={walkLeg}
                rideLeg={rideLeg}
                walkAll={walkAll}
                bikes={bikes}
                onBack={() => {
                  setDest(null)
                  setStep('dest')
                }}
                onRestart={restart}
              />
            )}
            {step === 'browse' && (
              <BrowseStep
                selected={browseSel}
                bikes={bikes}
                onPlan={() => {
                  setBrowseSel(null)
                  setStep('start')
                }}
                onClose={() => setBrowseSel(null)}
              />
            )}
            {notice && step !== 'start' && step !== 'browse' && (
              <p className={styles.sheetNoticeBar}>{notice}</p>
            )}
          </section>
        </div>

        {step === 'start' && (
          <StartPanel
            locating={locating}
            notice={notice}
            onLocate={locate}
            onPick={() => {
              setNotice(null)
              setStep('picking')
            }}
            onAddress={startAt}
            onBrowse={() => setStep('browse')}
          />
        )}
      </div>

      {/* Provenance belongs on the page, not only in SOURCES.md. */}
      <footer className={styles.sources}>
        {MAP_CONFIG.sources.map((s) => (
          <div key={s.id} className={styles.sourceRow}>
            <span className={styles.sourceTier} data-tier={s.tier}>
              {s.tier}
            </span>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
            <span className={styles.sourceMeta}>
              {s.recordCount > 0 ? `${s.recordCount.toLocaleString()} records · ` : ''}
              verified {s.verifiedOn}
            </span>
          </div>
        ))}
      </footer>
    </div>
  )
}
