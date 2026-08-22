// Refresh endpoint for Smoke PDX.
//
// The page already server-renders live data, so this route exists for the
// Refresh button alone. All the fetching and fallback logic lives in
// data/live.ts, shared with the page so both build the payload the same way.

import { NextResponse } from 'next/server'
import { getLiveMapData } from '@/app/design-experiments/(experiments)/smoke-pdx/data/live'

// Never cached at the route level.
//
// This used to carry `revalidate = 900`, which meant a press returned whatever
// response Next had frozen, timestamp and all. The button looked broken because
// it was: it could not report anything the cache did not already hold. Caching
// belongs on the upstream fetches inside data/live.ts, where it protects the
// public file servers without also freezing the answer we hand back.
export const dynamic = 'force-dynamic'

/**
 * Floor on how often `?force=1` may skip the upstream cache, shared across every
 * visitor. AirNow publishes hourly, so a real re-fetch more than once a minute
 * cannot find anything new and only costs the file server 16 requests.
 */
const FORCE_FLOOR_MS = 60_000
let lastForcedAt = 0

export async function GET(request: Request) {
  const asked = new URL(request.url).searchParams.has('force')
  const force = asked && Date.now() - lastForcedAt > FORCE_FLOOR_MS
  if (force) lastForcedAt = Date.now()

  return NextResponse.json(await getLiveMapData({ force }), {
    headers: { 'cache-control': 'no-store' },
  })
}
