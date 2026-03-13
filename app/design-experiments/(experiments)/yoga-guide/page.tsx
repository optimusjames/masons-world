import type { Metadata } from 'next'
import { experimentMetadata } from '@/lib/experiments/metadata'
import YogaGuide from './YogaGuide'

export const metadata: Metadata = experimentMetadata('yoga-guide')

export default function Page() {
  return <YogaGuide />
}
