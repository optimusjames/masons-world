'use client'

import { useCallback, useEffect } from 'react'
import styles from './styles.module.css'
import MapView from './components/MapView'
import Legend from './components/Legend'
import StoryCard from './components/StoryCard'
import ChapterIndicator from './components/ChapterIndicator'
import { useActiveChapter } from './hooks/useActiveChapter'
import { useElementHeightVar } from './hooks/useElementHeightVar'
import { headline } from './data/narrative'
import { chapters, CHAPTER_LAYERS } from './data/chapters'
import type {
  HighCrashStreetsCollection,
  HighCrashIntersectionsCollection,
  PedCrashesCollection,
  FatalCrashesCollection,
  SidewalksCollection,
  ParksCollection,
  SchoolsCollection,
  MaxLineCollection,
  SpringwaterCollection,
} from './types'
import streetsRaw from './data/highCrashStreets.json'
import intersectionsRaw from './data/highCrashIntersections.json'
import pedCrashesRaw from './data/pedCrashes.json'
import fatalCrashesRaw from './data/fatalCrashes.json'
import sidewalksRaw from './data/sidewalks.json'
import parksRaw from './data/parks.json'
import schoolsRaw from './data/schools.json'
import maxOrangeRaw from './data/maxOrange.json'
import springwaterRaw from './data/springwater.json'

const highCrashStreets = streetsRaw as unknown as HighCrashStreetsCollection
const highCrashIntersections = intersectionsRaw as unknown as HighCrashIntersectionsCollection
const pedCrashes = pedCrashesRaw as unknown as PedCrashesCollection
const fatalCrashes = fatalCrashesRaw as unknown as FatalCrashesCollection
const sidewalks = sidewalksRaw as unknown as SidewalksCollection
const parks = parksRaw as unknown as ParksCollection
const schools = schoolsRaw as unknown as SchoolsCollection
const maxOrange = maxOrangeRaw as unknown as MaxLineCollection
const springwater = springwaterRaw as unknown as SpringwaterCollection

export default function McLoughlinCorridor() {
  const { activeIndex, registerCard } = useActiveChapter(chapters.length)
  const stickyRef = useElementHeightVar('--sticky-height')
  const visibleLayers = CHAPTER_LAYERS[activeIndex] ?? CHAPTER_LAYERS[0]
  const activeBounds = chapters[activeIndex].bounds

  useEffect(() => {
    const html = document.documentElement
    const prevBehavior = html.style.scrollBehavior
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduced) html.style.scrollBehavior = 'smooth'
    return () => {
      html.style.scrollBehavior = prevBehavior
    }
  }, [])

  const scrollToChapter = useCallback((index: number) => {
    if (typeof document === 'undefined') return
    const el = document.querySelector<HTMLElement>(`[data-chapter-index="${index}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.headline}>
        <div className={styles.eyebrow}>SE McLoughlin Blvd · Portland, OR · 2018–2026</div>
        <h1 className={styles.title}>{headline.title}</h1>
        <p className={styles.subtitle}>{headline.subtitle}</p>
      </header>

      <div className={styles.grid}>
        <div className={styles.stickyMap} ref={stickyRef}>
          <div className={styles.mapWrapper}>
            <MapView
              visibleLayers={visibleLayers}
              activeBounds={activeBounds}
              highCrashStreets={highCrashStreets}
              highCrashIntersections={highCrashIntersections}
              pedCrashes={pedCrashes}
              fatalCrashes={fatalCrashes}
              sidewalks={sidewalks}
              parks={parks}
              schools={schools}
              maxOrange={maxOrange}
              springwater={springwater}
            />
            <ChapterIndicator
              chapters={chapters}
              activeIndex={activeIndex}
              onSelect={scrollToChapter}
            />
          </div>
          <Legend visibleLayers={visibleLayers} />
        </div>

        <div className={styles.storyColumn}>
          {chapters.map((c) => (
            <StoryCard
              key={c.id}
              chapter={c}
              isActive={c.index === activeIndex}
              registerRef={registerCard(c.index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
