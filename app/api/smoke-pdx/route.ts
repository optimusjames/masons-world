// Refresh endpoint for Smoke PDX.
//
// The page already server-renders live data, so this route exists for the
// Refresh button alone. All the fetching and fallback logic lives in
// data/live.ts, shared with the page so both build the payload the same way.

import { NextResponse } from 'next/server'
import { getLiveMapData } from '@/app/design-experiments/(experiments)/smoke-pdx/data/live'

// Must be a literal: Next statically analyzes segment config and rejects an
// imported constant. Keep in sync with REVALIDATE in data/live.ts.
export const revalidate = 900

export async function GET() {
  return NextResponse.json(await getLiveMapData())
}
