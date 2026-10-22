'use client'

// The first thing on the map: where is this trip starting?
//
// Every number on this map is "from somewhere", so the map asks before it
// shows. It does not fire the browser's location prompt on load, though. A
// permission dialog nobody asked for gets denied by reflex, and a denial
// sticks. The prompt appears only after a tap on "Use my location", and a
// visitor who already granted it skips this panel entirely (see RidePdx).

import { useState, type FormEvent } from 'react'
import { LocateFixed, MapPin, MapPinned, Search } from 'lucide-react'
import styles from '../styles.module.css'
import type { LatLng } from './geo'

/** Address lookup bounded to Portland (OSM Nominatim, no key). */
async function geocode(q: string): Promise<LatLng | null> {
  try {
    const url =
      'https://nominatim.openstreetmap.org/search?format=json&limit=1&bounded=1' +
      '&viewbox=-122.84,45.66,-122.46,45.43&q=' +
      encodeURIComponent(q)
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    const data = (await res.json()) as { lat: string; lon: string }[]
    if (!data?.length) return null
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)]
  } catch {
    return null
  }
}

type Props = {
  locating: boolean
  notice: string | null
  onLocate: () => void
  onPick: () => void
  onAddress: (at: LatLng, label: string) => void
  onBrowse: () => void
}

export default function StartPanel({ locating, notice, onLocate, onPick, onAddress, onBrowse }: Props) {
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [miss, setMiss] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setBusy(true)
    setMiss(false)
    const at = await geocode(q)
    setBusy(false)
    if (at) onAddress(at, q)
    else setMiss(true)
  }

  return (
    <div className={styles.startOverlay}>
      <div className={styles.startCard} role="dialog" aria-labelledby="ride-start-title">
        <div className={styles.sheetEyebrow}>Step 1 of 3</div>
        <h2 id="ride-start-title" className={styles.startTitle}>
          Where are you starting?
        </h2>
        <p className={styles.sheetLede}>
          We&rsquo;ll find the closest BIKETOWN bike or scooter, then time the ride to wherever
          you want to go.
        </p>

        <button type="button" className={styles.startOption} data-primary onClick={onLocate} disabled={locating}>
          <span className={styles.startOptionIcon}>
            <LocateFixed size={20} strokeWidth={2.2} />
          </span>
          <span className={styles.rowText}>
            <span className={styles.rowTitle}>{locating ? 'Finding you…' : 'Use my location'}</span>
            <span className={styles.rowSub}>Your browser will ask first</span>
          </span>
        </button>

        <button type="button" className={styles.startOption} onClick={onPick}>
          <span className={styles.startOptionIcon}>
            <MapPinned size={20} strokeWidth={2.2} />
          </span>
          <span className={styles.rowText}>
            <span className={styles.rowTitle}>Pick a spot on the map</span>
            <span className={styles.rowSub}>Drag the map under a pin</span>
          </span>
        </button>

        <form className={styles.startSearch} onSubmit={submit}>
          <Search size={16} strokeWidth={2.2} aria-hidden />
          <input
            type="text"
            inputMode="search"
            placeholder="Or type an address or place"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Starting address"
          />
          <button type="submit" disabled={busy || !query.trim()}>
            {busy ? '…' : 'Go'}
          </button>
        </form>

        {(notice || miss) && (
          <p className={styles.sheetNotice}>
            {miss ? 'Could not find that one in Portland. Try a street address or a place name.' : notice}
          </p>
        )}

        <button type="button" className={styles.startSkip} onClick={onBrowse}>
          Just look around
        </button>
      </div>
    </div>
  )
}

/**
 * The fixed pin at the map's center while picking. The map moves under it, the
 * way ride apps do it, so a tap on a station or a park never gets mistaken for
 * "start here".
 */
export function PickPin() {
  return (
    <div className={styles.pickPin} aria-hidden>
      <MapPin size={44} strokeWidth={1.8} />
      <span className={styles.pickShadow} />
    </div>
  )
}

/** The card that confirms the picked start. */
export function PickCard({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className={styles.sheetBody}>
      <div className={styles.sheetEyebrow}>Step 1 of 3</div>
      <div className={styles.sheetTitle}>Move the map to your start</div>
      <p className={styles.sheetLede}>Drag or tap until the pin sits where you are.</p>
      <div className={styles.sheetActions}>
        <button type="button" className={styles.btnPrimary} onClick={onConfirm}>
          Start here
        </button>
        <button type="button" className={styles.btnGhost} onClick={onCancel}>
          Back
        </button>
      </div>
    </div>
  )
}
