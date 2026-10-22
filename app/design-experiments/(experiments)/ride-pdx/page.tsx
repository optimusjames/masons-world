import type { Metadata } from 'next'
// Leaflet's stylesheet is imported from the page (a server component), not from
// MapView, or the tiles render unstyled on first paint.
import 'leaflet/dist/leaflet.css'
import { experimentMetadata } from '@/lib/experiments/metadata'
import RidePdx from './RidePdx'
import { getLiveBikes } from './data/live'

export const metadata: Metadata = experimentMetadata('ride-pdx')

// The map opens on where the bikes are now, not where they were at build time.
// ISR, so one feed pull per window is shared by every visitor.
//
// Must be a literal: Next statically analyzes segment config and rejects an
// imported constant. Keep in sync with REVALIDATE in data/live.ts.
export const revalidate = 60

export default async function Page() {
  return <RidePdx initialBikes={await getLiveBikes()} />
}
