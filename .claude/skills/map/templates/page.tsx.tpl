import type { Metadata } from 'next'
// Leaflet's stylesheet must be imported from the page (a server component),
// not from MapView, or the tiles render unstyled on first paint.
import 'leaflet/dist/leaflet.css'
import { experimentMetadata } from '@/lib/experiments/metadata'
import {{ComponentName}} from './{{ComponentName}}'

export const metadata: Metadata = experimentMetadata('{{SLUG}}')

export default function Page() {
  return <{{ComponentName}} />
}
