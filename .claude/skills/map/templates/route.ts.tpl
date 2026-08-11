// Live-data proxy for {{TITLE}}.
//
// Exists for one reason: the API key stays on the server. Never call a keyed
// endpoint from the browser, and never inline a key with NEXT_PUBLIC_.
//
// Route: /api/{{slug}}

import { NextResponse } from 'next/server'
import type { MapData } from '@/app/design-experiments/(experiments)/{{slug}}/types'
import snapshot from '@/app/design-experiments/(experiments)/{{slug}}/data/{{output}}.json'

// Match the source's real cadence. Polling faster than the data updates just
// burns quota.
export const revalidate = {{seconds}}

const ENDPOINT = '{{upstream url}}'

export async function GET() {
  const key = process.env.{{VAR_NAME}}

  // No key configured: serve the committed snapshot rather than an error, so
  // the map still works for anyone who clones this repo.
  if (!key) {
    return NextResponse.json({ ...(snapshot as MapData), live: false, reason: 'no-key' })
  }

  try {
    const res = await fetch(`${ENDPOINT}&API_KEY=${key}`, {
      next: { revalidate },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`upstream ${res.status}`)
    const raw = await res.json()

    // TODO: normalize into MapData, same shape the build script produces.
    const data: MapData = {
      features: [],
      generatedAt: new Date().toISOString(),
    }
    void raw

    return NextResponse.json({ ...data, live: true })
  } catch {
    // Fall back to the snapshot. A stale map that says it is stale beats a
    // blank one.
    return NextResponse.json({ ...(snapshot as MapData), live: false, reason: 'fetch-failed' })
  }
}
