'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './styles.module.css'
import MapView from './components/MapView'
import Legend from './components/Legend'
import { MAP_CONFIG } from './map.config'
import { acresLabel, GARDEN, NATURAL, PARK } from './components/scale'
import type { LayerId, MapData, MapFeature, MapFocus, ShapeFeature } from './types'
import raw from './data/green.json'

const mapData = raw as unknown as MapData

export default function GreenPdx() {
  const [visibleLayers, setVisibleLayers] = useState<LayerId[]>(
    MAP_CONFIG.layers.filter((l) => l.defaultOn).map((l) => l.id),
  )
  const [fullscreen, setFullscreen] = useState(false)
  const [focus, setFocus] = useState<MapFocus | null>(null)
  const [resetKey, setResetKey] = useState(0)
  const [atHome, setAtHome] = useState(true)
  const [showList, setShowList] = useState(false)

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

  const counts = useMemo<Record<LayerId, number>>(
    () => ({
      park: mapData.counts.parks,
      natural: mapData.counts.naturalAreas,
      garden: mapData.counts.gardens,
      neighborhood: mapData.counts.neighborhoods,
    }),
    [],
  )

  /**
   * Places worth going to look at, derived rather than curated.
   *
   * The map already holds everything needed to answer "where is the
   * interesting part", and a reader looking at the whole city has no way to
   * find it by panning. Each entry names its own number, so the list is worth
   * reading even if nothing gets clicked.
   */
  const highlights = useMemo(() => {
    const out: { key: string; label: string; detail: string; focus: () => MapFocus }[] = []

    const parks = mapData.shapes.find((s) => s.layer === 'park')?.geojson.features ?? []
    const biggest = parks.reduce<ShapeFeature | null>(
      (acc, f) => (acc == null || (f.properties.acres ?? 0) > (acc.properties.acres ?? 0) ? f : acc),
      null,
    )
    if (biggest) {
      out.push({
        key: 'biggest-park',
        label: 'Largest park',
        detail: `${biggest.properties.name} · ${acresLabel(biggest.properties.acres) ?? ''}`,
        focus: () => ({ kind: 'shape', layer: 'park', feature: biggest, nonce: Date.now() }),
      })
    }

    const gardens = mapData.features.filter((f) => f.layer === 'garden')
    const mostPlots = gardens.reduce<MapFeature | null>(
      (acc, f) => (acc == null || (f.value ?? 0) > (acc.value ?? 0) ? f : acc),
      null,
    )
    if (mostPlots?.value) {
      out.push({
        key: 'most-plots',
        label: 'Biggest community garden',
        detail: `${mostPlots.label} · ${mostPlots.value} plots`,
        focus: () => ({ kind: 'garden', feature: mostPlots, nonce: Date.now() }),
      })
    }

    out.push({
      key: 'city',
      label: 'The whole city',
      detail: `${mapData.counts.parks} parks · ${mapData.counts.gardens} gardens`,
      focus: () => ({ kind: 'city', nonce: Date.now() }),
    })

    return out
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>{MAP_CONFIG.place.name}</div>
        <h1 className={styles.title}>Green PDX</h1>
        <p className={styles.subtitle}>{MAP_CONFIG.question}</p>
      </header>

      {/* Three numbers, then the sentence that connects them. Parks are the
          headline because the acreage is genuinely surprising. */}
      <div className={styles.reading}>
        {/* Gardens lead. The acreage is the bigger number, but this map is
            about community green space, and a garden plot is the one thing on
            it a person can actually go get. */}
        <div className={styles.readingStats}>
          <div className={styles.statRow} style={{ ['--band' as string]: GARDEN }}>
            <span className={styles.statNum}>
              {mapData.counts.gardenPlots.toLocaleString()}
            </span>
            <span className={styles.statText}>
              <span className={styles.statScope}>Garden plots</span>
              <span className={styles.statWhere}>
                across {mapData.counts.gardens} community gardens
              </span>
            </span>
          </div>

          <div className={styles.statRow} style={{ ['--band' as string]: PARK }}>
            <span className={styles.statNum}>
              {mapData.counts.parkAcres.toLocaleString()}
            </span>
            <span className={styles.statText}>
              <span className={styles.statScope}>Acres of parkland</span>
              <span className={styles.statWhere}>
                across {mapData.counts.parks} parks
              </span>
            </span>
          </div>

          <div className={styles.statRow} style={{ ['--band' as string]: NATURAL }}>
            <span className={styles.statNum}>{mapData.counts.naturalAreas}</span>
            <span className={styles.statText}>
              <span className={styles.statScope}>Natural area parcels</span>
              <span className={styles.statWhere}>wetlands, woods, and creek land</span>
            </span>
          </div>
        </div>

        <div className={styles.readingText}>
          <p className={styles.readingSentence}>
            Portlanders grow food on{' '}
            <strong>{mapData.counts.gardenPlots.toLocaleString()}</strong> plots across{' '}
            {mapData.counts.gardens} community gardens, inside a city that also manages{' '}
            <strong>{mapData.counts.parkAcres.toLocaleString()}</strong> acres of
            parkland and <strong>{mapData.counts.naturalAreas}</strong> natural area
            parcels. Parks and natural areas overlap where the city manages both, so the
            two greens stack rather than tile.
          </p>

          {/* The unnamed parcels used to sit in a stat tile, where a number
              about the data was pretending to be a number about Portland. It
              is a note about the source, so it reads as one — and it says the
              record has no name rather than claiming the land has none, since
              a NULL field does not tell us which. */}
          <p className={styles.readingNote}>
            <strong>
              {mapData.counts.naturalAreas - mapData.counts.naturalAreasNamed}
            </strong>{' '}
            of those parcels carry no name in the city&rsquo;s inventory. They are drawn
            like the rest and labelled &ldquo;Unnamed natural area&rdquo;, rather than
            borrowing a name from whatever they sit beside.
          </p>
        </div>
      </div>

      <div className={`${styles.mapWrapper} ${fullscreen ? styles.mapWrapperFullscreen : ''}`}>
        <MapView
          features={mapData.features}
          shapes={mapData.shapes}
          visibleLayers={visibleLayers}
          resizeKey={fullscreen}
          focus={focus}
          resetKey={resetKey}
          onHomeChange={setAtHome}
        />

        <div className={styles.mapControls}>
          <button
            type="button"
            className={`${styles.mapBtn} ${showList ? styles.mapBtnOn : ''}`}
            onClick={() => setShowList((v) => !v)}
            aria-expanded={showList}
            title="Jump to the notable places on this map"
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

          {/* Somewhere to land after zooming into a garden. Stays out of the
              way until the view has actually moved. */}
          <button
            type="button"
            className={`${styles.mapBtn} ${styles.mapBtnIconOnly} ${
              atHome ? styles.mapBtnGone : ''
            }`}
            onClick={() => {
              setResetKey((k) => k + 1)
              setShowList(false)
            }}
            aria-label="Back to the whole city"
            title="Back to the whole city"
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
                <path d="M9 3v6H3M21 9h-6V3M15 21v-6h6M3 15h6v6" />
              ) : (
                <path d="M3 9V3h6M21 9V3h-6M3 15v6h6M21 15v6h-6" />
              )}
            </svg>
            <span className={styles.mapBtnLabel}>{fullscreen ? 'Exit' : 'Fullscreen'}</span>
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

        <Legend
          visibleLayers={visibleLayers}
          onToggleLayer={toggleLayer}
          counts={counts}
          asOf={mapData.generatedAt}
        />
      </div>

      {/* Provenance belongs on the page, not only in SOURCES.md. */}
      <footer className={styles.sources}>
        <div className={styles.sourcesHead}>
          All {(
            mapData.counts.parks +
            mapData.counts.naturalAreas +
            mapData.counts.gardens +
            mapData.counts.neighborhoods
          ).toLocaleString()}{' '}
          shapes on this map come from City of Portland services, fetched and counted
          on {MAP_CONFIG.sources[0].verifiedOn}. Boundaries are generalized to about
          10m for the browser, so they show where a place is, not where its property
          line runs.{' '}
          {/* One sentence, because the popups already name each garden's
              operator. The reasoning behind what is and is not attributed here
              belongs in SOURCES.md, not on the page: the reader did not ask. */}
          {mapData.counts.gardensCommunity} of the gardens are run by neighborhood
          groups and nonprofits rather than the city, and are marked with who runs
          them.
        </div>
        {MAP_CONFIG.sources.map((s) => (
          <div key={s.id} className={styles.sourceRow}>
            <span className={styles.sourceTier} data-tier={s.tier}>
              {s.tier}
            </span>
            <a href={s.url} target="_blank" rel="noopener noreferrer">
              {s.name}
            </a>
            <span className={styles.sourceMeta}>
              {s.recordCount.toLocaleString()} records
            </span>
          </div>
        ))}
      </footer>
    </div>
  )
}
