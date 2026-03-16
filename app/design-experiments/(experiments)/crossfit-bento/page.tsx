import type { Metadata } from 'next'
import { experimentMetadata } from '@/lib/experiments/metadata'
import CrossfitBento from './CrossfitBento'

export const metadata: Metadata = experimentMetadata('crossfit-bento')

export default function Page() {
  return <CrossfitBento />
}
