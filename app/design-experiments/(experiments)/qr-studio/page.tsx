import type { Metadata } from 'next'
import { experimentMetadata } from '@/lib/experiments/metadata'
import QrStudio from './QrStudio'

export const metadata: Metadata = experimentMetadata('qr-studio')

export default function Page() {
  return <QrStudio />
}
