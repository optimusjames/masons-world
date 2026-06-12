'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import styles from './styles.module.css'
import type {
  Category,
  MapPin,
  PickedLocation,
  ReportStatus,
  ReportsData,
  Screen,
} from './types'
import reportsData from './data/reports.json'
import MapView from './components/MapView'
import StatsStrip from './components/StatsStrip'
import Legend from './components/Legend'
import ReportSheet, { locationLabel } from './components/ReportSheet'

const DATA = reportsData as ReportsData
const ALL_STATUSES: ReportStatus[] = ['reported', 'in_progress', 'fixed']
const TODAY = '2026-06-11'

export default function FixItPdx() {
  const [screen, setScreen] = useState<Screen>('map')
  const [pins, setPins] = useState<MapPin[]>(DATA.pins)
  const [picked, setPicked] = useState<PickedLocation | null>(null)
  const [category, setCategory] = useState<Category | null>(null)
  const [referenceId, setReferenceId] = useState<string | null>(null)

  const [visibleStatuses, setVisibleStatuses] = useState<ReportStatus[]>(ALL_STATUSES)
  const [visibleCategory, setVisibleCategory] = useState<Category['id'] | 'all'>('all')
  const [fullscreen, setFullscreen] = useState(false)

  // While in fullscreen takeover, lock background scroll and let Esc exit.
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
    const c: Record<ReportStatus, number> = { reported: 0, in_progress: 0, fixed: 0 }
    for (const p of pins) c[p.status]++
    return c
  }, [pins])

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18`,
        { headers: { Accept: 'application/json' } },
      )
      if (!res.ok) return
      const data = (await res.json()) as { address?: Record<string, string> }
      const a = data.address ?? {}
      const street = [a.house_number, a.road].filter(Boolean).join(' ')
      const label = street || a.neighbourhood || a.suburb
      if (label) {
        setPicked((cur) => (cur && cur.lat === lat && cur.lng === lng ? { ...cur, address: label } : cur))
      }
    } catch {
      // best-effort — coordinates remain the label
    }
  }, [])

  const handlePick = useCallback(
    (lat: number, lng: number) => {
      if (screen !== 'pick-location') return
      setPicked({ lat, lng })
      void reverseGeocode(lat, lng)
    },
    [screen, reverseGeocode],
  )

  const useMyLocation = useCallback(() => {
    if (!('geolocation' in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => handlePick(pos.coords.latitude, pos.coords.longitude),
      () => {
        /* denied — user can still tap the map */
      },
      { enableHighAccuracy: true, timeout: 8000 },
    )
  }, [handlePick])

  const startReport = useCallback(() => {
    setPicked(null)
    setCategory(null)
    setReferenceId(null)
    setScreen('pick-location')
  }, [])

  const selectCategory = useCallback((c: Category) => {
    setCategory(c)
    setScreen(
      c.handling === 'phone'
        ? 'report-phone'
        : c.handling === 'external'
          ? 'report-external'
          : 'report-inline',
    )
  }, [])

  const submitInline = useCallback(
    (note: string, _photoName: string | null) => {
      if (!picked || !category) return
      const ref = `FIX-2026-${Math.floor(10000 + Math.random() * 89999)}`
      const newPin: MapPin = {
        id: `user-${Date.now()}`,
        category: category.id,
        status: 'reported',
        lat: picked.lat,
        lng: picked.lng,
        reportedDate: TODAY,
        note: note.trim() || `Reported ${category.label.toLowerCase()}.`,
        real: false,
      }
      setPins((prev) => [...prev, newPin])
      setReferenceId(ref)
      setScreen('confirmation')
    },
    [picked, category],
  )

  const exitFlow = useCallback(() => {
    setScreen('map')
    setPicked(null)
    setCategory(null)
  }, [])

  const sheetScreen =
    screen === 'pick-category' ||
    screen === 'report-inline' ||
    screen === 'report-phone' ||
    screen === 'report-external' ||
    screen === 'confirmation'

  return (
    <div className={`${styles.app} ${fullscreen ? styles.appFullscreen : ''}`}>
      <MapView
        pins={pins}
        visibleStatuses={visibleStatuses}
        visibleCategory={visibleCategory}
        mode={screen === 'pick-location' ? 'pick' : 'browse'}
        picked={picked}
        onPick={handlePick}
      />

      {/* Top brand + stats */}
      <div className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandFix}>Fix It</span>
          <span className={styles.brandPdx}>PDX</span>
        </div>
        <div className={styles.topRight}>
          <StatsStrip reported={DATA.stats.reportedThisMonth} fixed={DATA.stats.fixedThisMonth} />
          {screen === 'map' && (
            <button
              type="button"
              className={styles.fsBtn}
              onClick={() => setFullscreen((v) => !v)}
              aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
            >
              {fullscreen ? '✕' : '⤢'}
            </button>
          )}
        </div>
      </div>

      {/* Browse mode controls */}
      {screen === 'map' && (
        <>
          <Legend
            visibleStatuses={visibleStatuses}
            onToggleStatus={(s) =>
              setVisibleStatuses((cur) =>
                cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
              )
            }
            visibleCategory={visibleCategory}
            onCategoryChange={setVisibleCategory}
            counts={counts}
          />
          <button type="button" className={styles.reportCta} onClick={startReport}>
            ＋ Report something
          </button>
        </>
      )}

      {/* Location picker */}
      {screen === 'pick-location' && (
        <>
          <button type="button" className={styles.closeBtn} onClick={exitFlow} aria-label="Cancel">
            ✕
          </button>

          {/* Prominent tap-the-map prompt (until a location is picked) */}
          {!picked && (
            <div className={styles.pickHint}>
              <span className={styles.pickHintIcon} aria-hidden>
                <span className={styles.pickHintPin} />
              </span>
              <div className={styles.pickHintTitle}>Tap the map where the issue is</div>
              <div className={styles.pickHintSub}>Drop a pin anywhere — you can drag it to adjust</div>
              <button type="button" className={styles.pickHintLink} onClick={useMyLocation}>
                or use my current location
              </button>
            </div>
          )}

          {/* Confirm bar (after a location is picked) */}
          {picked && (
            <div className={styles.locBar}>
              <div className={styles.locTitle}>Pin dropped — drag it to fine-tune</div>
              <div className={styles.locAddr}>{locationLabel(picked)}</div>
              <div className={styles.btnRow}>
                <button type="button" className={styles.secondaryBtn} onClick={useMyLocation}>
                  Use my location
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setScreen('pick-category')}
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Report sheet (category → handling → confirmation) */}
      {sheetScreen && (
        <>
          <div className={styles.scrim} onClick={screen === 'confirmation' ? undefined : exitFlow} />
          {screen !== 'confirmation' && (
            <button type="button" className={styles.sheetClose} onClick={exitFlow} aria-label="Close">
              ✕
            </button>
          )}
          <ReportSheet
            screen={screen}
            category={category}
            picked={picked}
            referenceId={referenceId}
            onSelectCategory={selectCategory}
            onSubmitInline={submitInline}
            onBack={() => setScreen('pick-location')}
            onDone={exitFlow}
            onReportAnother={startReport}
          />
        </>
      )}
    </div>
  )
}
