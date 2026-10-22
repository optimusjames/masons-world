'use client'

// The card at the bottom of the map. One question per screen, the way Fix It
// PDX does it, so nobody has to read two lists to take one step:
//
//   ride     how do you want to ride? (closest bike, scooter, or either)
//   dest     where to? (a category, then its nearest few, timed from the ride)
//   trip     the trip: walk, then ride, against walking the whole way
//   browse   no start: tap a pin to see what it is
//
// Every time shown here is either routed by OSRM or prefixed with "~", which
// means a straight-line estimate because the router did not answer.

import type { ReactNode } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BatteryMedium,
  Bike,
  ChevronRight,
  Footprints,
  Navigation2,
  RotateCcw,
  Shuffle,
  X,
  type LucideIcon,
} from 'lucide-react'
import styles from '../styles.module.css'
import type { BikeData, Place, PlaceCategory, Station, Target, Vehicle } from '../types'
import type { RideChoice, Timed } from '../hooks/useTrip'
import { directionsUrl, estimateMinutes, fmtMiles, type LatLng, type Leg } from './geo'
import { CATEGORIES, CATEGORY, VEHICLE } from './scale'
import { nearestDock, type Ride } from './trip'

const mins = (n: number | null | undefined, routed = true) =>
  n == null ? '…' : `${routed ? '' : '~'}${n} min`

export function fmtClock(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// ---- shared pieces -------------------------------------------------------------

function StepHead({
  step,
  title,
  onBack,
  backLabel = 'Back',
}: {
  step: string
  title: string
  onBack?: () => void
  backLabel?: string
}) {
  return (
    <div className={styles.stepHead}>
      {onBack && (
        <button type="button" className={styles.backBtn} onClick={onBack} aria-label={backLabel}>
          <ArrowLeft size={18} strokeWidth={2.4} />
        </button>
      )}
      <div>
        <div className={styles.sheetEyebrow}>{step}</div>
        <div className={styles.sheetTitle}>{title}</div>
      </div>
    </div>
  )
}

function rideIcon(kind: Ride['kind']): LucideIcon {
  return kind === 'station' ? Bike : VEHICLE[kind].Icon
}

function rideTitle(r: Ride): string {
  if (r.kind === 'station') return r.name ?? 'BIKETOWN station'
  return `${VEHICLE[r.kind].label} on the street`
}

function rideSub(r: Ride): string {
  if (r.kind === 'station') return `Station · ${r.count} ${r.count === 1 ? 'bike' : 'bikes'} ready`
  return r.rangeMi ? `${Math.round(r.rangeMi)} mi of charge` : 'Parked nearby'
}

function Hint({ children }: { children: ReactNode }) {
  return <p className={styles.sheetFoot}>{children}</p>
}

// ---- step 2: how do you want to ride ------------------------------------------

const CHOICES: { id: RideChoice; label: string; Icon: LucideIcon }[] = [
  { id: 'bike', label: 'Bike', Icon: Bike },
  { id: 'scooter', label: 'Scooter', Icon: VEHICLE.s.Icon },
  { id: 'any', label: 'Whichever’s closest', Icon: Shuffle },
]

export function RideStep({
  options,
  originLabel,
  onChoose,
  onBack,
}: {
  options: Partial<Record<RideChoice, Timed<Ride>>>
  originLabel: string | null
  onChoose: (choice: RideChoice, ride: Ride) => void
  onBack: () => void
}) {
  return (
    <div className={styles.sheetBody}>
      <StepHead step={`Step 2 of 3 · from ${originLabel ?? 'here'}`} title="How do you want to ride?" onBack={onBack} backLabel="Change start" />
      <div className={styles.choiceList}>
        {CHOICES.map(({ id, label, Icon }) => {
          const opt = options[id]
          return (
            <button
              key={id}
              type="button"
              className={styles.choice}
              data-choice={id}
              disabled={!opt}
              onClick={() => opt && onChoose(id, opt.item)}
            >
              <span className={styles.choiceIcon} data-choice={id}>
                <Icon size={22} strokeWidth={2.2} />
              </span>
              <span className={styles.rowText}>
                <span className={styles.rowTitle}>{label}</span>
                <span className={styles.rowSub}>
                  {opt ? (id === 'any' ? rideTitle(opt.item) : rideSub(opt.item)) : 'None free right now'}
                </span>
              </span>
              {opt && (
                <span className={styles.rowTime}>
                  <Footprints size={14} strokeWidth={2.4} /> {mins(opt.minutes, opt.routed)}
                </span>
              )}
              <ChevronRight size={18} className={styles.chev} aria-hidden />
            </button>
          )
        })}
      </div>
      <Hint>Or tap any bike, scooter, or station on the map.</Hint>
    </div>
  )
}

// ---- step 3: where to -----------------------------------------------------------

export function DestStep({
  ride,
  walkLeg,
  category,
  options,
  onCategory,
  onChoose,
  onBack,
}: {
  ride: Ride
  walkLeg: Leg | null
  category: PlaceCategory | null
  options: Timed<Place>[]
  onCategory: (c: PlaceCategory) => void
  onChoose: (p: Place) => void
  onBack: () => void
}) {
  const RideIcon = rideIcon(ride.kind)
  return (
    <div className={styles.sheetBody}>
      <StepHead step="Step 3 of 3" title="Where to?" onBack={onBack} backLabel="Choose a different ride" />

      <button type="button" className={styles.rideSummary} onClick={onBack}>
        <span className={styles.rowIcon} data-kind={ride.kind}>
          <RideIcon size={16} strokeWidth={2.4} />
        </span>
        <span className={styles.rowText}>
          <span className={styles.rowTitle}>{rideTitle(ride)}</span>
          <span className={styles.rowSub}>
            {walkLeg ? `${mins(walkLeg.minutes, walkLeg.routed)} walk to get it` : 'Routing the walk…'}
          </span>
        </span>
        <span className={styles.linkBtn}>Change</span>
      </button>

      <div className={styles.catGrid} role="radiogroup" aria-label="Kind of place">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={category === c.id}
            className={styles.catTile}
            data-on={category === c.id}
            onClick={() => onCategory(c.id)}
          >
            <span className={styles.catIcon} style={{ background: c.tint }}>
              <c.Icon size={20} strokeWidth={2.2} />
            </span>
            {c.plural}
          </button>
        ))}
      </div>

      {category && (
        <ul className={styles.rowList}>
          {options.map(({ item, minutes, routed }) => (
            <li key={item.id}>
              <button type="button" className={styles.row} onClick={() => onChoose(item)}>
                <span className={styles.rowText}>
                  <span className={styles.rowTitle}>{item.name}</span>
                  <span className={styles.rowSub}>{placeSub(item, false)}</span>
                </span>
                <span className={styles.rowTime}>
                  <RideIcon size={14} strokeWidth={2.4} /> {mins(minutes, routed)}
                </span>
                <ChevronRight size={18} className={styles.chev} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {category && <Hint>Ride times start at your {ride.kind === 's' ? 'scooter' : 'bike'}. Or tap any pin on the map.</Hint>}
    </div>
  )
}

// ---- the trip ---------------------------------------------------------------------

function placeSub(p: Place, withCategory = true): string {
  return [
    withCategory ? CATEGORY[p.cat].label : null,
    p.brand,
    p.acres != null ? `${p.acres} acres` : null,
    p.addr,
  ]
    .filter(Boolean)
    .join(' · ') || CATEGORY[p.cat].label
}

function PlaceHead({ place }: { place: Place }) {
  const { Icon, tint } = CATEGORY[place.cat]
  return (
    <div className={styles.head}>
      <span className={styles.headIcon} style={{ background: tint }}>
        <Icon size={26} strokeWidth={2.1} />
      </span>
      <span className={styles.rowText}>
        <span className={styles.headTitle}>{place.name}</span>
        <span className={styles.headSub}>{placeSub(place)}</span>
      </span>
    </div>
  )
}

export function TripStep({
  place,
  ride,
  origin,
  walkLeg,
  rideLeg,
  walkAll,
  bikes,
  onBack,
  onRestart,
}: {
  place: Place
  ride: Ride
  origin: LatLng
  walkLeg: Leg | null
  rideLeg: Leg | null
  walkAll: { minutes: number; routed: boolean } | null
  bikes: BikeData
  onBack: () => void
  onRestart: () => void
}) {
  const at: LatLng = [place.lat, place.lng]
  const RideIcon = rideIcon(ride.kind)
  const total = walkLeg && rideLeg ? walkLeg.minutes + rideLeg.minutes : null
  const routed = Boolean(walkLeg?.routed && rideLeg?.routed)
  const walkFaster = total != null && walkAll != null && walkAll.minutes <= total
  // Bikes go back to a station; scooters park at any rack in the service area.
  const dock = ride.kind === 's' ? null : nearestDock(bikes.stations, at)

  return (
    <div className={styles.sheetBody}>
      <StepHead step="Your trip" title="" onBack={onBack} backLabel="Choose a different place" />
      <PlaceHead place={place} />

      {total == null ? (
        <div className={styles.trip} data-loading>
          Routing your trip…
        </div>
      ) : (
        <div className={styles.trip}>
          <div className={styles.tripLine}>
            <span className={styles.tripPill} data-mode="foot">
              <Footprints size={15} strokeWidth={2.4} /> {mins(walkLeg!.minutes, walkLeg!.routed)}
            </span>
            <ArrowRight size={15} className={styles.tripArrow} aria-hidden />
            <span className={styles.tripPill} data-mode={ride.kind === 's' ? 'scooter' : 'bike'}>
              <RideIcon size={15} strokeWidth={2.4} /> {mins(rideLeg!.minutes, rideLeg!.routed)}
            </span>
            <span className={styles.tripTotal}>
              {routed ? '' : '~'}
              {total}
              <small> min</small>
            </span>
          </div>
          <p className={styles.tripCaption}>
            Walk to {ride.name ?? `the ${VEHICLE[ride.kind as 'e' | 's'].label.toLowerCase()} parked nearby`}, then
            ride {fmtMiles(rideLeg!.meters)}.
          </p>
          {walkAll && (
            <div className={styles.walkAll}>
              <span className={styles.inlineIcon}>
                <Footprints size={14} strokeWidth={2.4} /> Or walk the whole way
              </span>
              <span className={styles.rowTime}>
                {mins(walkAll.minutes, walkAll.routed)}
                {walkFaster && <span className={styles.fasterTag}>faster</span>}
              </span>
            </div>
          )}
        </div>
      )}

      {place.hours && (
        <div className={styles.factRow}>
          <span>Hours</span>
          <span className={styles.mono}>{place.hours}</span>
        </div>
      )}
      {dock && (
        <div className={styles.factRow}>
          <span>Dock at</span>
          <span>
            {dock.name} · {dock.docks} open · ~{estimateMinutes(at, [dock.lat, dock.lng], 'foot')} min walk
          </span>
        </div>
      )}

      <div className={styles.sheetActions}>
        <a
          className={styles.btnPrimary}
          href={directionsUrl(ride.at, 'foot', origin)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation2 size={16} strokeWidth={2.4} /> Go to the {ride.kind === 's' ? 'scooter' : 'bike'}
        </a>
        <a
          className={styles.btnGhost}
          href={directionsUrl(at, 'bike', ride.at)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <RideIcon size={16} strokeWidth={2.4} /> Ride route
        </a>
      </div>
      <div className={styles.tripFooter}>
        <span className={styles.provenanceInline}>
          {place.src === 'ppr' ? 'Portland Parks & Recreation' : 'OpenStreetMap'} · OSRM routing
        </span>
        <button type="button" className={styles.linkBtn} onClick={onRestart}>
          <RotateCcw size={13} strokeWidth={2.4} /> New trip
        </button>
      </div>
    </div>
  )
}

// ---- browse: no start, just looking ------------------------------------------------

export function BrowseStep({
  selected,
  bikes,
  onPlan,
  onClose,
}: {
  selected: Target | null
  bikes: BikeData
  onPlan: () => void
  onClose: () => void
}) {
  if (!selected) {
    return (
      <div className={styles.sheetBody}>
        <div className={styles.sheetTop}>
          <div>
            <div className={styles.sheetTitleSm}>Tap any pin for details</div>
            <div className={styles.rowSub}>Or plan a trip from where you are</div>
          </div>
          <button type="button" className={styles.btnSmall} onClick={onPlan}>
            Plan a trip
          </button>
        </div>
      </div>
    )
  }
  return (
    <div className={styles.sheetBody}>
      <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <X size={16} strokeWidth={2.4} />
      </button>
      {selected.kind === 'place' ? (
        <>
          <PlaceHead place={selected.place} />
          {selected.place.hours && (
            <div className={styles.factRow}>
              <span>Hours</span>
              <span className={styles.mono}>{selected.place.hours}</span>
            </div>
          )}
        </>
      ) : selected.kind === 'station' ? (
        <StationInfo station={selected.station} bikes={bikes} />
      ) : (
        <VehicleInfo vehicle={selected.vehicle} />
      )}
      <div className={styles.sheetActions}>
        <button type="button" className={styles.btnPrimary} onClick={onPlan}>
          Plan a trip
        </button>
      </div>
      <div className={styles.provenance}>
        {selected.kind === 'place'
          ? selected.place.src === 'ppr'
            ? 'Portland Parks & Recreation'
            : 'OpenStreetMap'
          : `${bikes.live ? 'Live BIKETOWN feed' : 'BIKETOWN snapshot'} · ${fmtClock(bikes.asOf)}`}
      </div>
    </div>
  )
}

function StationInfo({ station, bikes }: { station: Station; bikes: BikeData }) {
  // The selection holds the station as it was when tapped. Read the counts from
  // the latest feed, so a card left open does not go stale.
  const s = bikes.stations.find((x) => x.id === station.id) ?? station
  const ok = s.renting && s.bikes > 0
  return (
    <>
      <div className={styles.head}>
        <span className={styles.headIcon} data-tone={ok ? 'bike' : 'empty'}>
          <Bike size={26} strokeWidth={2.1} />
        </span>
        <span className={styles.rowText}>
          <span className={styles.headTitle}>{s.name}</span>
          <span className={styles.headSub}>
            BIKETOWN station · {s.renting ? `${s.docks} docks open` : 'Not renting right now'}
          </span>
        </span>
      </div>
      <div className={styles.statGrid}>
        <Stat n={s.bikes} label={s.bikes === 1 ? 'bike ready' : 'bikes ready'} />
        <Stat n={s.ebikes} label="electric" />
        <Stat n={s.scooters} label="scooters" />
      </div>
    </>
  )
}

function VehicleInfo({ vehicle: v }: { vehicle: Vehicle }) {
  const meta = VEHICLE[v[2]]
  return (
    <>
      <div className={styles.head}>
        <span className={styles.headIcon} data-tone={v[2] === 's' ? 'scooter' : 'bike'}>
          <meta.Icon size={26} strokeWidth={2.1} />
        </span>
        <span className={styles.rowText}>
          <span className={styles.headTitle}>BIKETOWN {meta.label.toLowerCase()}</span>
          <span className={styles.headSub}>Parked on the street, ready to rent</span>
        </span>
      </div>
      {v[3] != null && (
        <div className={styles.factRow}>
          <span className={styles.inlineIcon}>
            <BatteryMedium size={15} strokeWidth={2.2} /> Charge
          </span>
          <span>About {Math.round(v[3])} mi of range</span>
        </div>
      )}
    </>
  )
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className={styles.stat}>
      <span className={styles.statN}>{n}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
