import type { Metadata } from 'next'
import { experimentMetadata } from '@/lib/experiments/metadata'
import YogaBreathing from './YogaBreathing'

export const metadata: Metadata = experimentMetadata('yoga-breathing')

export default function Page() {
  return <YogaBreathing />
}
