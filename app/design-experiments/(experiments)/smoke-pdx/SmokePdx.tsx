'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './styles.module.css'
import MapView from './components/MapView'
import Legend from './components/Legend'
import { MAP_CONFIG } from './map.config'
import { bandFor } from './components/scale'
import type { LayerId, MapData } from './types'

const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']

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

  const toggleLayer = useCallback((id: LayerId) => {
    setVisibleLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )
  }, [])

  // What the last press actually found. The server caches for 15 minutes, so a
  // press often correctly returns the same payload. Saying so is the difference
  // between a button that looks broken and one that answers the question.
  const [checked, setChecked] = useState<'new' | 'current' | 'failed' | null>(null)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await fetch('/api/smoke-pdx', { cache: 'no-store' })
      if (!res.ok) throw new Error(String(res.status))
      const next = (await res.json()) as MapData
      setChecked(next.generatedAt === data.generatedAt ? 'current' : 'new')
      setData(next)
    } catch {
      // Keep showing what we have. The legend already says how old it is.
      setChecked('failed')
    } finally {
      setRefreshing(false)
    }
  }, [data.generatedAt])

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
    // Headline stays metro-only. A hazardous reading next to a fire in Idaho is
    // real and on the map, but it is not what Portland is breathing.
    const monitors = data.features.filter(
      (f) => f.layer === 'monitor' && f.metro && f.value != null,
    )
    const worst = monitors.reduce<(typeof monitors)[number] | null>(
      (acc, f) => (acc == null || (f.value ?? 0) > (acc.value ?? 0) ? f : acc),
      null,
    )

    // Average the metro wind cells as a vector, so opposing arrows cancel
    // instead of averaging into a meaningless middle bearing.
    const winds = data.features.filter((f) => f.layer === 'wind' && f.bearing != null)
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
      const deg = ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360
      dir = COMPASS[Math.round(deg / 22.5) % 16]
      speed = Math.round(winds.reduce((s, w) => s + (w.value ?? 0), 0) / winds.length)
    }

    const fires = data.shapes.find((s) => s.layer === 'perimeter')?.geojson.features ?? []
    const biggest = fires.reduce<(typeof fires)[number] | null>(
      (acc, f) =>
        acc == null || (f.properties.acres ?? 0) > (acc.properties.acres ?? 0) ? f : acc,
      null,
    )

    return { worst, dir, speed, fireCount: fires.length, biggest }
  }, [data])

  const band = bandFor(reading.worst?.value ?? null)

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>{MAP_CONFIG.place.name}</div>
        <h1 className={styles.title}>Smoke PDX</h1>
        <p className={styles.subtitle}>{MAP_CONFIG.question}</p>
      </header>

      {/* Fires make it, wind moves it, monitors measure what arrived. */}
      <div className={styles.reading}>
        <div className={styles.readingStat}>
          <span className={styles.readingNum} style={{ color: band?.color }}>
            {reading.worst?.value ?? '—'}
          </span>
          <span className={styles.readingLabelGroup}>
            <span className={styles.readingCategory} style={{ color: band?.color }}>
              {band?.label ?? 'No reading'}
            </span>
            {/* Neutral framing. "Worst" editorializes, and on a clean day it
                reads as alarm about a number that is fine. State what the
                number is and let it speak. */}
            <span className={styles.readingLabel}>
              Highest of {data.counts.metroReporting} reporting metro monitors
            </span>
          </span>
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
          {reading.dir && (
            <>
              Wind is out of the <strong>{reading.dir}</strong> at about{' '}
              <strong>{reading.speed} mph</strong>.{' '}
            </>
          )}
          {reading.worst
            ? `The highest metro reading is at ${reading.worst.label}.`
            : 'No monitor in the metro has a valid reading this hour.'}
        </p>
      </div>

      <div className={`${styles.mapWrapper} ${fullscreen ? styles.mapWrapperFullscreen : ''}`}>
        <MapView
          features={data.features}
          shapes={data.shapes}
          visibleLayers={visibleLayers}
          resizeKey={fullscreen}
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
        <Legend
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayer}
          counts={counts}
          reporting={data.counts.monitorsReporting}
          asOf={data.generatedAt}
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
