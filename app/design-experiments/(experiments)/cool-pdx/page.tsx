import type { Metadata } from 'next'
import 'leaflet/dist/leaflet.css'
import { experimentMetadata } from '@/lib/experiments/metadata'
import CoolPdx from './CoolPdx'

export const metadata: Metadata = experimentMetadata('cool-pdx')

export default function Page() {
  return <CoolPdx />
}
