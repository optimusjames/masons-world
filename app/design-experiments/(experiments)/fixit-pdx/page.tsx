import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import { experimentMetadata } from '@/lib/experiments/metadata'
import FixItPdx from './FixItPdx'

export const metadata: Metadata = experimentMetadata('fixit-pdx')

export default function Page() {
  return <FixItPdx />
}
