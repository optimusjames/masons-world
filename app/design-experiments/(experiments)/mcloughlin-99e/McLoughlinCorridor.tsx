'use client'

import { useCallback, useState } from 'react'
import styles from './styles.module.css'
import NarrativePanel from './components/NarrativePanel'
import MapView from './components/MapView'
import LayerToggle, { type LayerOption } from './components/LayerToggle'
import Legend from './components/Legend'
import { headline } from './data/narrative'
import type {
  LayerId,
  HighCrashStreetsCollection,
  HighCrashIntersectionsCollection,
} from './types'
import streetsRaw from './data/highCrashStreets.json'
import intersectionsRaw from './data/highCrashIntersections.json'

const highCrashStreets = streetsRaw as unknown as HighCrashStreetsCollection
const highCrashIntersections = intersectionsRaw as unknown as HighCrashIntersectionsCollection

const LAYER_OPTIONS: LayerOption[] = [
  { id: 'corridor', label: 'McLoughlin corridor', color: '#e8b04e', shape: 'line' },
  { id: 'speedZone', label: '40 mph zone', color: 'rgba(232, 176, 78, 0.45)', shape: 'lineSoft' },
  { id: 'highCrashStreets', label: 'High Crash Network', color: '#ec4899', shape: 'lineDashed' },
  { id: 'highCrashIntersections', label: 'High Crash intersections', color: '#ef4444', shape: 'dot' },
]

export default function McLoughlinCorridor() {
  const [visible, setVisible] = useState<LayerId[]>([
    'corridor',
    'speedZone',
    'highCrashStreets',
    'highCrashIntersections',
  ])

  const toggle = useCallback((id: LayerId) => {
    setVisible((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    )
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.headline}>
        <div className={styles.eyebrow}>Portland GIS · Design Experiment v1</div>
        <h1 className={styles.title}>{headline.title}</h1>
        <p className={styles.subtitle}>{headline.subtitle}</p>
      </header>

      <div className={styles.mapColumn}>
        <div className={styles.controls}>
          <LayerToggle layers={LAYER_OPTIONS} visible={visible} onToggle={toggle} />
        </div>

        <div className={styles.mapWrapper}>
          <MapView
            visibleLayers={visible}
            highCrashStreets={highCrashStreets}
            highCrashIntersections={highCrashIntersections}
          />
        </div>

        <Legend />
      </div>

      <NarrativePanel />
    </div>
  )
}
