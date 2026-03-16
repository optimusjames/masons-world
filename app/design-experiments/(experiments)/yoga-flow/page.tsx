import type { Metadata } from 'next'
import { experimentMetadata } from '@/lib/experiments/metadata'
import YogaFlow from './YogaFlow'

export const metadata: Metadata = experimentMetadata('yoga-flow')

export default function Page() {
  return <YogaFlow />
}
