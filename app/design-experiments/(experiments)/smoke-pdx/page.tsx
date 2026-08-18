import type { Metadata } from 'next'
// Leaflet's stylesheet is imported from the page (a server component), not from
// MapView, or the tiles render unstyled on first paint.
import 'leaflet/dist/leaflet.css'
import { experimentMetadata } from '@/lib/experiments/metadata'
import SmokePdx from './SmokePdx'
import { getLiveMapData } from './data/live'

export const metadata: Metadata = experimentMetadata('smoke-pdx')

// The map opens on current readings, not on whatever was true the day we built
// it. This is ISR, so the work happens once per window and is shared across
// visitors rather than firing a fetch on every load.
//
// Must be a literal: Next statically analyzes segment config and rejects an
// imported constant. Keep in sync with REVALIDATE in data/live.ts.
export const revalidate = 900

export default async function Page() {
  return <SmokePdx initialData={await getLiveMapData()} />
}
