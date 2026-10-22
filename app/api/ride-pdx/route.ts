// Refresh endpoint for Ride PDX.
//
// The page already server-renders live data, so this route exists for the
// Refresh button and the once-a-minute poll. All fetching and fallback logic
// lives in data/live.ts, shared with the page.

import { NextResponse } from 'next/server'
import { getLiveBikes } from '@/app/design-experiments/(experiments)/ride-pdx/data/live'

// Caching lives on the upstream fetches in data/live.ts, not here, so a press
// of Refresh can never be answered by a frozen response.
export const dynamic = 'force-dynamic'

/**
 * Floor on how often `?force=1` may skip the upstream cache, shared across
 * every visitor. The feed's ttl is 60s, so a re-fetch more often than that
 * cannot find anything new.
 */
const FORCE_FLOOR_MS = 30_000
let lastForcedAt = 0

export async function GET(request: Request) {
  const asked = new URL(request.url).searchParams.has('force')
  const force = asked && Date.now() - lastForcedAt > FORCE_FLOOR_MS
  if (force) lastForcedAt = Date.now()

  return NextResponse.json(await getLiveBikes({ force }), {
    headers: { 'cache-control': 'no-store' },
  })
}
