'use client'

import { useMemo, useState } from 'react'
import styles from '../styles.module.css'
import type { Category, PickedLocation, Screen } from '../types'
import {
  CAMPSITE_POINTER,
  CATEGORIES,
  COMMON_CATEGORIES,
} from '../data/categories'
import { CategoryIcon } from './icons'

export function locationLabel(p: PickedLocation | null): string {
  if (!p) return 'somewhere on the map'
  return p.address ?? `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
}

type Props = {
  screen: Screen
  category: Category | null
  picked: PickedLocation | null
  referenceId: string | null
  onSelectCategory: (c: Category) => void
  onSubmitInline: (note: string, photoName: string | null) => void
  onBack: () => void
  onDone: () => void
  onReportAnother: () => void
}

export default function ReportSheet(props: Props) {
  const { screen } = props
  return (
    <div className={styles.sheet} role="dialog" aria-modal="false">
      <div className={styles.sheetGrip} />
      {screen === 'pick-category' && <CategoryPicker {...props} />}
      {screen === 'report-inline' && <InlineForm {...props} />}
      {screen === 'report-phone' && <PhoneHandoff {...props} />}
      {screen === 'report-external' && <ExternalHandoff {...props} />}
      {screen === 'confirmation' && <Confirmation {...props} />}
    </div>
  )
}

function CategoryPicker({ picked, onSelectCategory }: Props) {
  const [q, setQ] = useState('')
  const [showAll, setShowAll] = useState(false)
  const results = useMemo(() => {
    const query = q.trim().toLowerCase()
    if (query) {
      return CATEGORIES.filter(
        (c) =>
          c.label.toLowerCase().includes(query) ||
          c.blurb.toLowerCase().includes(query),
      )
    }
    return showAll ? CATEGORIES : COMMON_CATEGORIES
  }, [q, showAll])

  return (
    <div className={styles.sheetBody}>
      <h2 className={styles.sheetTitle}>What’s at {locationLabel(picked)}?</h2>
      <input
        className={styles.search}
        placeholder="Search — pothole, light, graffiti…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div className={styles.catGrid}>
        {results.map((c) => (
          <button
            key={c.id}
            type="button"
            className={styles.catChip}
            onClick={() => onSelectCategory(c)}
          >
            <span className={styles.catChipIcon}>
              <CategoryIcon id={c.id} size={22} />
            </span>
            <span className={styles.catChipText}>
              <span className={styles.catChipLabel}>{c.label}</span>
              <span className={styles.catChipBlurb}>{c.blurb}</span>
            </span>
          </button>
        ))}
      </div>

      {!q && !showAll && (
        <button
          type="button"
          className={styles.linkBtn}
          onClick={() => setShowAll(true)}
        >
          More categories ({CATEGORIES.length - COMMON_CATEGORIES.length} more) →
        </button>
      )}

      <a
        className={styles.campsite}
        href={CAMPSITE_POINTER.url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <strong>{CAMPSITE_POINTER.label}</strong> {CAMPSITE_POINTER.detail} →
      </a>
    </div>
  )
}

function InlineForm({ category, picked, onSubmitInline }: Props) {
  const [note, setNote] = useState('')
  const [photoName, setPhotoName] = useState<string | null>(null)
  if (!category) return null

  // Merit gate: a report needs at least a photo OR a short note so the crew has
  // something to act on — keeps it frictionless for good-faith reporters while
  // discouraging empty/accidental submissions.
  const hasNote = note.trim().length >= 8
  const canSubmit = !!photoName || hasNote

  return (
    <div className={styles.sheetBody}>
      <SheetHead category={category} picked={picked} />
      <p className={styles.evidencePrompt}>
        Help the crew act fast — add a photo <em>or</em> a quick note.
      </p>
      <label className={styles.fileBtn}>
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => setPhotoName(e.target.files?.[0]?.name ?? null)}
        />
        {photoName ? `📷 ${photoName}` : '＋ Add a photo'}
      </label>
      <textarea
        className={styles.textarea}
        placeholder="Describe what you see — e.g. “Deep pothole in the bike lane, full of water.”"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={3}
      />
      <button
        type="button"
        className={styles.primaryBtn}
        disabled={!canSubmit}
        onClick={() => onSubmitInline(note, photoName)}
      >
        Submit report
      </button>
      <p className={styles.fineprint}>
        {canSubmit
          ? 'No account needed. We’ll route this to the right city crew.'
          : 'Add a photo or a few words of detail to submit.'}
      </p>
    </div>
  )
}

function PhoneHandoff({ category, picked }: Props) {
  const [copied, setCopied] = useState(false)
  if (!category) return null
  const script =
    `Hi — I'd like to report ${category.label.toLowerCase()} at ` +
    `${locationLabel(picked)}. It's been there and could use attention.`
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(script)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className={styles.sheetBody}>
      <SheetHead category={category} picked={picked} />
      <p className={styles.handoffNote}>
        {category.label} is handled by phone. Here’s exactly what to say — we’ve
        filled it in for you.
      </p>
      <div className={styles.script}>{script}</div>
      <div className={styles.btnRow}>
        <a className={styles.primaryBtn} href={`tel:${category.phone}`}>
          Call {category.phone}
        </a>
        <button type="button" className={styles.secondaryBtn} onClick={copy}>
          {copied ? 'Copied ✓' : 'Copy script'}
        </button>
      </div>
    </div>
  )
}

function ExternalHandoff({ category, picked }: Props) {
  if (!category) return null
  return (
    <div className={styles.sheetBody}>
      <SheetHead category={category} picked={picked} />
      <p className={styles.handoffNote}>
        This one goes to a City of Portland form. Bring what you’ve got — location
        and a photo — and you’ll be done in a couple minutes.
      </p>
      <div className={styles.recap}>
        <div>
          <span>Issue</span>
          {category.label}
        </div>
        <div>
          <span>Where</span>
          {locationLabel(picked)}
        </div>
      </div>
      <a
        className={styles.primaryBtn}
        href={category.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {category.externalLabel ?? 'Continue to city form'} →
      </a>
    </div>
  )
}

function Confirmation({ category, picked, referenceId, onDone, onReportAnother }: Props) {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  return (
    <div className={styles.sheetBody}>
      <div className={styles.confCheck}>✓</div>
      <h2 className={styles.sheetTitle}>Report submitted</h2>
      <p className={styles.confLead}>
        Thanks for flagging {category?.label.toLowerCase()} at{' '}
        {locationLabel(picked)}. You’re the kind of person who makes the city
        better.
      </p>
      <div className={styles.refBox}>
        <span>Reference</span>
        {referenceId}
      </div>
      <p className={styles.fineprint}>
        What happens next: a city crew reviews it, schedules the work, and the pin
        on the map updates as it moves from reported → in progress → fixed.
      </p>
      {subscribed ? (
        <p className={styles.subscribed}>
          ✓ We’ll email you when the status changes.
        </p>
      ) : (
        <form
          className={styles.emailRow}
          onSubmit={(e) => {
            e.preventDefault()
            if (email.trim()) setSubscribed(true)
          }}
        >
          <input
            className={styles.search}
            type="email"
            placeholder="Want status updates? Add email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className={styles.secondaryBtn}>
            Notify me
          </button>
        </form>
      )}
      <div className={styles.btnRow}>
        <button type="button" className={styles.primaryBtn} onClick={onReportAnother}>
          Report another
        </button>
        <button type="button" className={styles.secondaryBtn} onClick={onDone}>
          Back to map
        </button>
      </div>
    </div>
  )
}

function SheetHead({
  category,
  picked,
}: {
  category: Category
  picked: PickedLocation | null
}) {
  return (
    <div className={styles.sheetHead}>
      <span className={styles.sheetHeadIcon}>
        <CategoryIcon id={category.id} size={24} />
      </span>
      <div>
        <div className={styles.sheetTitle}>{category.label}</div>
        <div className={styles.sheetSub}>{locationLabel(picked)}</div>
      </div>
    </div>
  )
}
