import path from 'path'
import Link from 'next/link'
import { Permanent_Marker } from 'next/font/google'
import { ChevronLeft } from 'lucide-react'
import { getAllNotes } from './loadNotes'
import StickyNoteStack from './components/StickyNoteStack'
import styles from './styles.module.css'

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-marker',
})

export const metadata = {
  title: 'Sticky Notes',
  description: 'Interactive sticky note stack with click-to-read overlay',
}

export default function StickyNotesExperiment() {
  const notes = getAllNotes(path.join(process.cwd(), 'app/design-experiments/sticky-notes/data'))

  return (
    <div className={`${styles.page} ${permanentMarker.variable}`}>
      <div className={styles.backRow}>
        <Link href="/design-experiments" className={styles.backLink}>
          <ChevronLeft size={14} />
          Back
        </Link>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>Sticky Notes</h1>
        <p className={styles.description}>
          A stack of post-it notes. Click to open the lightbox, then click near
          the card to flip through. Click left to go back, far away to close.
          Content is loaded from markdown files -- the consumer decides where the
          notes directory lives.
        </p>
      </div>

      <div className={styles.showcase}>
        <StickyNoteStack notes={notes} />
      </div>

      <div className={styles.details}>
        <h2 className={styles.sectionTitle}>Color Variants</h2>
        <div className={styles.swatches}>
          <div className={styles.swatch} style={{ background: '#f5e960', borderColor: '#e0d44e' }}>warm</div>
          <div className={styles.swatch} style={{ background: '#a8d8ea', borderColor: '#94c4d6' }}>cool</div>
          <div className={styles.swatch} style={{ background: '#f5c6d0', borderColor: '#e0b2bc' }}>neutral</div>
        </div>

        <h2 className={styles.sectionTitle}>Usage</h2>
        <pre className={styles.codeBlock}>{`import { getAllNotes, StickyNoteStack } from '@/app/design-experiments/sticky-notes'

const notes = getAllNotes('/path/to/your/notes')

<StickyNoteStack notes={notes} />`}</pre>

        <h2 className={styles.sectionTitle}>Content Format</h2>
        <pre className={styles.codeBlock}>{`---
date: 2026-02-18
color: warm  # warm | cool | neutral
---
Note content with **bold** and *italic* support.`}</pre>
      </div>
    </div>
  )
}
