import type { Metadata } from 'next'
// Leaflet's stylesheet is imported from the page (a server component), not from
// MapView, or the tiles render unstyled on first paint.
import 'leaflet/dist/leaflet.css'
import { experimentMetadata } from '@/lib/experiments/metadata'
import SmokePdx from './SmokePdx'

export const metadata: Metadata = experimentMetadata('smoke-pdx')

export default function Page() {
  return <SmokePdx />
}
