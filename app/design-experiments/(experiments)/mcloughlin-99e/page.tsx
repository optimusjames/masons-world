import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import { experimentMetadata } from '@/lib/experiments/metadata'
import McLoughlinCorridor from './McLoughlinCorridor'

export const metadata: Metadata = experimentMetadata('mcloughlin-99e')

export default function Page() {
  return <McLoughlinCorridor />
}
