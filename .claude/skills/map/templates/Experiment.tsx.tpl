'use client'

import { useEffect, useMemo, useState } from 'react'
import styles from './styles.module.css'
import MapView from './components/MapView'
import Legend from './components/Legend'
import { MAP_CONFIG } from './map.config'
import type { LayerId, MapData } from './types'
import data from './data/{{data}}.json'

const mapData = data as MapData

export default function {{ComponentName}}() {
  const [visibleLayers, setVisibleLayers] = useState<LayerId[]>(
    MAP_CONFIG.layers.filter((l) => l.defaultOn).map((l) => l.id),
  )
  const [fullscreen, setFullscreen] = useState(false)

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

  const counts = useMemo(() => {
    const out: Record<LayerId, number> = {}
    for (const layer of MAP_CONFIG.layers) out[layer.id] = 0
    for (const f of mapData.features) out[f.layer] = (out[f.layer] ?? 0) + 1
    return out
  }, [])

  function toggleLayer(id: LayerId) {
    setVisibleLayers((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id],
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.eyebrow}>{MAP_CONFIG.place.name}</div>
        <h1 className={styles.title}>{MAP_CONFIG.title}</h1>
        <p className={styles.subtitle}>{MAP_CONFIG.question}</p>
      </header>

      <div className={`${styles.mapWrapper} ${fullscreen ? styles.mapWrapperFullscreen : ''}`}>
        <MapView
          features={mapData.features}
          shapes={mapData.shapes}
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
          asOf={mapData.generatedAt}
        />
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
              {s.recordCount.toLocaleString()} records · verified {s.verifiedOn}
            </span>
          </div>
        ))}
      </footer>
    </div>
  )
}
