export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

import { experimentOgImage } from '@/lib/og/experimentOgImage'
export default function OgImage() { return experimentOgImage('mcloughlin-99e') }
