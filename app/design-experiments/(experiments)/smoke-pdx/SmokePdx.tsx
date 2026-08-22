'use client'

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import styles from './styles.module.css'
import MapView from './components/MapView'
import Legend from './components/Legend'
import { MAP_CONFIG } from './map.config'
import { METRO, REGION } from './data/place'
import { bandFor, bearingLabel } from './components/scale'
import type { LayerId, MapData, MapFeature, MapFocus } from './types'

/** Monitors carry a `metro` flag from the build; wind cells do not, so the
 *  headline has to test them against the same box. */
function inMetro(lat: number, lng: number): boolean {
  const [[s, w], [n, e]] = METRO.bounds
  return lat >= s && lat <= n && lng >= w && lng <= e
}

/** Miles between two points. Good enough at this scale, and it keeps a
 *  dependency out of the bundle for one formula. */
function milesBetween(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[0] - a[0])
  const dLng = toRad(b[1] - a[1])
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2
  return 3958.8 * 2 * Math.asin(Math.sqrt(h))
}

// The page server-renders this from data/live.ts, so the first paint is already
// current. Refresh re-fetches on demand for anyone watching the map change.
export default function SmokePdx({ initialData }: { initialData: MapData }) {
  const [data, setData] = useState<MapData>(initialData)
  const [refreshing, setRefreshing] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [visibleLayers, setVisibleLayers] = useState<LayerId[]>(
    MAP_CONFIG.layers.filter((l) => l.defaultOn).map((l) => l.id),
  )

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

  // Clicking the headline flies the map to the station behind it. The nonce is
  // what makes a second click on the same station work: the object identity has
  // to change or the effect downstream never re-runs.
  const [focus, setFocus] = useState<MapFocus | null>(null)
  const focusMonitor = useCallback((feature: MapFeature) => {
    setFocus({ kind: 'monitor', feature, nonce: Date.now() })
  }, [])

  // ---- where you actually are ----------------------------------------------
  const [here, setHere] = useState<[number, number] | null>(null)
  const [locating, setLocating] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [resetKey, setResetKey] = useState(0)

  const [atHome, setAtHome] = useState(true)
  const [showList, setShowList] = useState(false)

  const resetView = useCallback(() => {
    setResetKey((k) => k + 1)
    setNotice(null)
    setShowList(false)
  }, [])

  /**
   * Answer "what am I breathing" for the reader's own spot.
   *
   * There is no monitor at your address, so the honest answer is the nearest one
   * that is reporting, with the distance stated. A reading from 30 miles away is
   * still useful; a reading from 30 miles away presented as yours is not.
   */
  const checkMyAir = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setShowList(false)
      setNotice('This browser will not share a location. Click any monitor instead.')
      return
    }
    setLocating(true)
    setNotice(null)
    // Both panels anchor to the same corner, so only one of them is ever up.
    setShowList(false)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        const spot: [number, number] = [pos.coords.latitude, pos.coords.longitude]
        const [[rs, rw], [rn, re]] = REGION.bounds

        // Out of area is a real answer, not an error. Say where the map does
        // reach, then put them back on the view they arrived at.
        if (spot[0] < rs || spot[0] > rn || spot[1] < rw || spot[1] > re) {
          setHere(null)
          setNotice(
            'You are outside the area this map covers. Back to the Portland metro.',
          )
          setResetKey((k) => k + 1)
          return
        }

        const reporting = data.features.filter(
          (f) => f.layer === 'monitor' && f.value != null,
        )
        if (!reporting.length) {
          setNotice('No monitor is reporting a reading right now.')
          return
        }

        let nearest = reporting[0]
        let miles = Infinity
        for (const f of reporting) {
          const d = milesBetween(spot, [f.lat, f.lng])
          if (d < miles) {
            miles = d
            nearest = f
          }
        }

        setHere(spot)
        setNotice(null)
        setFocus({
          kind: 'monitor',
          nonce: Date.now(),
          from: spot,
          feature: {
            ...nearest,
            detail: [
              { label: 'From you', value: `${miles.toFixed(1)} mi` },
              ...(nearest.detail ?? []),
            ],
          },
        })
      },
      (err) => {
        setLocating(false)
        setNotice(
          err.code === err.PERMISSION_DENIED
            ? 'Location is off for this site. Click any monitor to read it directly.'
            : 'Could not get a location just now. Click any monitor to read it directly.',
        )
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    )
  }, [data.features])

  // Notices state a result, then get out of the way.
  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 8000)
    return () => clearTimeout(t)
  }, [notice])

  const toggleLayer = useCallback((id: LayerId) => {
    setVisibleLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )
  }, [])

  // What the last press actually found. Monitors publish hourly, so a press
  // often correctly finds nothing new. Saying so is the difference between a
  // button that looks broken and one that answers the question.
  const [checked, setChecked] = useState<'new' | 'current' | 'failed' | null>(null)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      // `force` asks the server to skip its upstream cache for the monitors.
      // Without it the button can only ever hand back what was already cached,
      // which is what made it look like nothing happened.
      const res = await fetch('/api/smoke-pdx?force=1', { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const next = (await res.json()) as MapData
      // Compare the hour the readings are FOR, not when the payload was built.
      // The build time moves on every request, so comparing it would call every
      // press "new" and the word would stop meaning anything.
      const before = data.observedAt ?? data.generatedAt
      const after = next.observedAt ?? next.generatedAt
      setChecked(after === before ? 'current' : 'new')
      setData(next)
    } catch {
      // Keep showing what we have. The legend already says how old it is.
      setChecked('failed')
    } finally {
      setRefreshing(false)
    }
  }, [data.observedAt, data.generatedAt])

  // Let the result stand long enough to read, then fall back to plain age.
  useEffect(() => {
    if (!checked) return
    const t = setTimeout(() => setChecked(null), 6000)
    return () => clearTimeout(t)
  }, [checked])

  const counts = useMemo<Record<LayerId, number>>(
    () => ({
      monitor: data.features.filter((f) => f.layer === 'monitor').length,
      wind: data.features.filter((f) => f.layer === 'wind').length,
      perimeter: data.shapes.find((s) => s.layer === 'perimeter')?.geojson.features.length ?? 0,
    }),
    [data],
  )

  // The whole point of putting three layers together: one sentence that reads
  // fires -> wind -> what actually arrived.
  const reading = useMemo(() => {
    // Two scopes, because they answer two different questions and a reader
    // deserves both. Portland says what you are breathing; the Northwest says
    // what is out there, which on a bad day is the more alarming number and the
    // reason the metro one is about to move.
    //
    // Stale readings are excluded from both. A monitor whose last word was four
    // hours ago is drawn hollow on the map and cannot be the current highest of
    // anything. Counting the same way we pick means the label and the number can
    // never disagree.
    const fresh = data.features.filter(
      (f) => f.layer === 'monitor' && f.value != null && f.staleHours == null,
    )
    const highest = (list: MapFeature[]) =>
      list.reduce<MapFeature | null>(
        (acc, f) => (acc == null || (f.value ?? 0) > (acc.value ?? 0) ? f : acc),
        null,
      )
    const metroFresh = fresh.filter((f) => f.metro)
    const worst = highest(metroFresh)
    const nwWorst = highest(fresh)

    // Average the wind as a vector, so opposing arrows cancel instead of
    // averaging into a meaningless middle bearing.
    //
    // Scoped to the metro cells, which it was not before. The grid spans the
    // whole Northwest, so averaging all 651 of them produced a Pacific
    // Northwest average and printed it directly under a Portland-only AQI. Two
    // different places, one sentence. Regional cells are the fallback only if
    // the metro grid comes back empty, and the wording says so.
    const allWinds = data.features.filter((f) => f.layer === 'wind' && f.bearing != null)
    const metroWinds = allWinds.filter((f) => inMetro(f.lat, f.lng))
    const winds = metroWinds.length ? metroWinds : allWinds
    const windScope = metroWinds.length ? 'metro' : 'region'
    let dir: string | null = null
    let speed: number | null = null
    if (winds.length) {
      let x = 0
      let y = 0
      for (const w of winds) {
        const rad = ((w.bearing as number) * Math.PI) / 180
        x += Math.sin(rad)
        y += Math.cos(rad)
      }
      dir = bearingLabel((Math.atan2(x, y) * 180) / Math.PI)
      speed = Math.round(winds.reduce((s, w) => s + (w.value ?? 0), 0) / winds.length)
    }

    const fires = data.shapes.find((s) => s.layer === 'perimeter')?.geojson.features ?? []
    const biggest = fires.reduce<(typeof fires)[number] | null>(
      (acc, f) =>
        acc == null || (f.properties.acres ?? 0) > (acc.properties.acres ?? 0) ? f : acc,
      null,
    )

    return {
      worst,
      metroCount: metroFresh.length,
      nwWorst,
      nwCount: fresh.length,
      dir,
      speed,
      windScope,
      fireCount: fires.length,
      biggest,
    }
  }, [data])

  const band = bandFor(reading.worst?.value ?? null)
  const nwBand = bandFor(reading.nwWorst?.value ?? null)

  /**
   * Places on this map worth going to look at, derived rather than curated.
   *
   * The map already holds everything needed to answer "where is the interesting
   * part", and a reader zoomed out to the whole region has no way to find it
   * by panning. Each entry states its own number, so the list is worth reading
   * even if nothing gets clicked.
   */
  const highlights = useMemo(() => {
    const out: { key: string; label: string; detail: string; focus: () => MapFocus }[] = []

    const monitors = data.features.filter(
      (f) => f.layer === 'monitor' && f.value != null && f.staleHours == null,
    )
    const worst = monitors.reduce<MapFeature | null>(
      (acc, f) => (acc == null || (f.value ?? 0) > (acc.value ?? 0) ? f : acc),
      null,
    )
    if (worst) {
      out.push({
        key: 'worst',
        label: 'Worst air right now',
        detail: `AQI ${worst.value} · ${worst.label}`,
        focus: () => ({ kind: 'monitor', feature: worst, nonce: Date.now() }),
      })
    }

    const fires = data.shapes.find((s) => s.layer === 'perimeter')?.geojson.features ?? []
    const biggest = fires.reduce<(typeof fires)[number] | null>(
      (acc, f) =>
        acc == null || (f.properties.acres ?? 0) > (acc.properties.acres ?? 0) ? f : acc,
      null,
    )
    if (biggest?.properties.acres != null) {
      out.push({
        key: 'fire',
        label: 'Biggest active fire',
        detail: `${biggest.properties.acres.toLocaleString()} acres · ${biggest.properties.name}`,
        focus: () => ({ kind: 'fire', feature: biggest, nonce: Date.now() }),
      })
    }

    // The fastest cell in the grid is almost always out over the Pacific, which
    // is true, unsurprising, and lands the reader on blank ocean with nothing to
    // look at. Only consider wind near a station that is actually reporting, so
    // wherever it goes has other data around it.
    const NEAR_MI = 45
    let windiest: MapFeature | null = null
    let windNear: string | null = null
    for (const w of data.features) {
      if (w.layer !== 'wind' || w.value == null || w.bearing == null) continue
      if (windiest && (w.value ?? 0) <= (windiest.value ?? 0)) continue
      let nearest: MapFeature | null = null
      let best = Infinity
      for (const m of monitors) {
        const d = milesBetween([w.lat, w.lng], [m.lat, m.lng])
        if (d < best) {
          best = d
          nearest = m
        }
      }
      if (!nearest || best > NEAR_MI) continue
      windiest = w
      windNear = nearest.label
    }
    if (windiest?.bearing != null) {
      out.push({
        key: 'wind',
        label: 'Strongest wind',
        detail:
          `${Math.round(windiest.value ?? 0)} mph out of the ${bearingLabel(windiest.bearing)}` +
          (windNear ? ` · near ${windNear}` : ''),
        focus: () => ({ kind: 'wind', feature: windiest as MapFeature, nonce: Date.now() }),
      })
    }

    // The view that started this: fires with a whole field of readings pooled
    // around them, which is the argument the map is making.
    out.push({
      key: 'region',
      label: 'The big picture',
      detail: `${fires.length} fires · ${data.counts.monitorsReporting} monitors reporting`,
      focus: () => ({ kind: 'region', nonce: Date.now() }),
    })

    return out
  }, [data])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>{MAP_CONFIG.place.name}</div>
        <h1 className={styles.title}>Smoke PDX</h1>
        <p className={styles.subtitle}>{MAP_CONFIG.question}</p>
      </header>

      {/* Fires make it, wind moves it, monitors measure what arrived. */}
      <div className={styles.reading}>
        {/* Two scopes stacked, Portland first because it is the subject. Each
            row is its own target: clicking one flies to the station behind that
            number, which is the only sensible meaning of a click here. */}
        <div className={styles.readingStats}>
          {/* One band color per panel, handed to CSS as a variable so the tint,
              the rule, and the ink can all be derived from it rather than set
              in three places. */}
          <button
            type="button"
            className={styles.statRow}
            style={{ '--band': band?.color ?? '#9a8d83' } as CSSProperties}
            onClick={reading.worst ? () => focusMonitor(reading.worst as MapFeature) : undefined}
            disabled={!reading.worst}
          >
            <span className={styles.statNum}>{reading.worst?.value ?? '—'}</span>
            <span className={styles.statText}>
              {/* The superlative belongs up here, not in the small print under
                  the number. "Pacific Northwest / 162 / Unhealthy" reads as a
                  claim about the whole region; "Highest in the Northwest" reads
                  as what it is, one station. */}
              <span className={styles.statScope}>Highest in Portland metro</span>
              <span className={styles.statCategory}>{band?.label ?? 'No reading'}</span>
              <span className={styles.statWhere}>
                {reading.worst
                  ? `${reading.worst.label} · ${reading.metroCount} stations reporting`
                  : 'No metro monitor has a current reading'}
                {reading.worst && <span className={styles.statGo}>show on map</span>}
              </span>
            </span>
          </button>

          <button
            type="button"
            className={`${styles.statRow} ${styles.statRowSecondary}`}
            style={{ '--band': nwBand?.color ?? '#9a8d83' } as CSSProperties}
            onClick={reading.nwWorst ? () => focusMonitor(reading.nwWorst as MapFeature) : undefined}
            disabled={!reading.nwWorst}
          >
            <span className={styles.statNum}>{reading.nwWorst?.value ?? '—'}</span>
            <span className={styles.statText}>
              <span className={styles.statScope}>Highest in the Northwest</span>
              <span className={styles.statCategory}>{nwBand?.label ?? 'No reading'}</span>
              <span className={styles.statWhere}>
                {reading.nwWorst
                  ? `${reading.nwWorst.label} · ${reading.nwCount} stations reporting`
                  : 'No monitor has a current reading'}
                {reading.nwWorst && <span className={styles.statGo}>show on map</span>}
              </span>
            </span>
          </button>
        </div>

        <p className={styles.readingSentence}>
          {reading.fireCount > 0 ? (
            <>
              <strong>{reading.fireCount}</strong> active fires are burning across the
              Northwest
              {reading.biggest?.properties.acres != null && (
                <>
                  , the largest at{' '}
                  <strong>{reading.biggest.properties.acres.toLocaleString()}</strong> acres
                </>
              )}
              .{' '}
            </>
          ) : (
            <>No active fire perimeters in range right now. </>
          )}
          {reading.dir ? (
            <>
              {reading.windScope === 'metro' ? 'Over the metro, wind' : 'Across the region, wind'}{' '}
              is out of the <strong>{reading.dir}</strong> at about{' '}
              <strong>{reading.speed} mph</strong>.
            </>
          ) : (
            <>No wind reading this hour.</>
          )}
          {!reading.worst && ' No monitor in the metro has a valid reading this hour.'}
        </p>
      </div>

      <div className={`${styles.mapWrapper} ${fullscreen ? styles.mapWrapperFullscreen : ''}`}>
        <MapView
          features={data.features}
          shapes={data.shapes}
          visibleLayers={visibleLayers}
          resizeKey={fullscreen}
          focus={focus}
          here={here}
          resetKey={resetKey}
          onHomeChange={setAtHome}
        />
        <div className={styles.mapControls}>
          {/* Four derived places worth looking at, folded away until asked for.
              Collapsed it is one pill; open it is a short list that names its
              own numbers. */}
          <button
            type="button"
            className={`${styles.mapBtn} ${showList ? styles.mapBtnOn : ''}`}
            onClick={() => setShowList((v) => !v)}
            aria-expanded={showList}
            title="Jump to the notable readings on this map"
          >
            <svg
              className={styles.mapBtnIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M15.5 8.5 13.6 13.6 8.5 15.5l1.9-5.1z" />
            </svg>
            <span className={styles.mapBtnLabel}>Highlights</span>
          </button>

          {/* The question the map exists to answer, asked about you. */}
          <button
            type="button"
            className={styles.mapBtn}
            onClick={checkMyAir}
            disabled={locating}
            title="Find the nearest reporting monitor to where you are"
          >
            <svg
              className={styles.mapBtnIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="3.2" />
              <circle cx="12" cy="12" r="8" opacity="0.55" />
              <path d="M12 1.5v2.6M12 19.9v2.6M22.5 12h-2.6M4.1 12H1.5" />
            </svg>
            <span className={styles.mapBtnLabel}>
              {locating ? 'Locating…' : 'My air'}
            </span>
          </button>

          {/* Somewhere to land after panning out to Idaho. No label, and it
              stays out of the way until the view has actually moved, which is
              the only time it means anything. */}
          <button
            type="button"
            className={`${styles.mapBtn} ${styles.mapBtnIconOnly} ${
              atHome ? styles.mapBtnGone : ''
            }`}
            onClick={resetView}
            aria-label="Back to the Portland metro view"
            title="Back to the Portland metro view"
            tabIndex={atHome ? -1 : 0}
            aria-hidden={atHome}
          >
            <svg
              className={styles.mapBtnIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3.5 10.5 12 3.5l8.5 7" />
              <path d="M5.5 9.6V20h13V9.6" />
            </svg>
          </button>

          <button
            type="button"
            className={styles.mapBtn}
            onClick={() => setFullscreen((v) => !v)}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
          >
            {/* Drawn rather than typed. The ⤢ glyph rendered small and thin, and
                its weight changed with the font, so the one control that opens
                the map up was the least visible thing on it. */}
            <svg
              className={styles.mapBtnIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {fullscreen ? (
                <>
                  <path d="M9 3v6H3M21 9h-6V3M15 21v-6h6M3 15h6v6" />
                </>
              ) : (
                <>
                  <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
                </>
              )}
            </svg>
            <span className={styles.mapBtnLabel}>
              {fullscreen ? 'Exit' : 'Fullscreen'}
            </span>
          </button>
        </div>
        {showList && (
          <div className={styles.highlights}>
            {highlights.map((h) => (
              <button
                key={h.key}
                type="button"
                className={styles.highlightRow}
                onClick={() => {
                  setFocus(h.focus())
                  setShowList(false)
                }}
              >
                <span className={styles.highlightLabel}>{h.label}</span>
                <span className={styles.highlightDetail}>{h.detail}</span>
              </button>
            ))}
          </div>
        )}

        {notice && (
          <div className={styles.mapNotice} role="status">
            {notice}
          </div>
        )}

        <Legend
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayer}
          counts={counts}
          reporting={data.counts.monitorsReporting}
          asOf={data.generatedAt}
          observedAt={data.observedAt}
          live={data.live}
          refreshing={refreshing}
          checked={checked}
          onRefresh={refresh}
        />
      </div>

      {/* Provenance belongs on the page, not only in SOURCES.md. */}
      <footer className={styles.sources}>
        <div className={styles.sourcesHead}>
          Every layer is fetched and counted live, all three from public sources that
          need no API key. {data.counts.monitorsReporting} of {data.counts.monitors}{' '}
          monitors had a valid NowCast across {data.counts.hourlyFilesUsed} hourly files.
          The soft color pools are a visual aid drawn around real monitors, not a modeled
          smoke surface.
        </div>
        {MAP_CONFIG.sources.map((s) => (
          <div key={s.id} className={styles.sourceRow}>
            <span className={styles.sourceTier} data-tier={s.tier}>
              {s.tier}
            </span>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
            <span className={styles.sourceMeta}>updates {s.cadence}</span>
          </div>
        ))}
      </footer>
    </div>
  )
}
