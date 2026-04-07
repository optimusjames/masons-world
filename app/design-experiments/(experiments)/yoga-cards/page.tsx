import type { Metadata } from 'next'
import { Suspense } from 'react'
import { experimentMetadata } from '@/lib/experiments/metadata'
import YogaCards from './YogaCards'

export const metadata: Metadata = experimentMetadata('yoga-cards')

export default function Page() {
  return (
    <Suspense>
      <YogaCards />
    </Suspense>
  )
}
