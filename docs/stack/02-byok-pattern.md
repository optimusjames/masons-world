---
description: Supporting free tier and bring-your-own-key in public AI experiments
---

# BYOK Pattern (Bring Your Own Key)

Pattern for supporting both a free tier and bring-your-own-key in public AI experiments. BYOK users provide their own API key and use their own quota. Use-at-your-own-risk.

## How It Works

Three tiers of AI access:

1. **Anonymous / Free** -- Google Gemini Flash, rate-limited (10 req/day per IP)
2. **Authenticated** -- Same free provider, higher limits (20 req/day)
3. **BYOK** -- User provides their own API key, uses their own quota

## Key Storage

BYOK keys stored in **localStorage** (client-side only). Keys are sent per-request in the request body to the API route, which proxies to the AI provider. Keys never touch the database.

**Why localStorage:**
- Keys stay on the user's device
- No server-side storage liability
- Survives page refreshes
- User can clear anytime
- Acceptable for a use-at-your-own-risk experiment

**Why NOT cookies/database:**
- Cookies send keys on every request (unnecessary exposure)
- Storing user API keys in your database creates liability
- This is an experiment, not a key management service

## Client-Side Implementation

```typescript
// lib/api-keys.ts
const STORAGE_KEY = 'ai-experiment-keys'

type StoredKeys = {
  provider: 'openai' | 'anthropic' | 'google'
  apiKey: string
}

export function getStoredKey(): StoredKeys | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setStoredKey(provider: string, apiKey: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ provider, apiKey }))
}

export function clearStoredKey() {
  localStorage.removeItem(STORAGE_KEY)
}
```

## Settings UI

Simple form in a settings page or modal:

```typescript
// components/api-key-input.tsx
'use client'
import { useState } from 'react'
import { getStoredKey, setStoredKey, clearStoredKey } from '@/lib/api-keys'

export function ApiKeySettings() {
  const stored = getStoredKey()
  const [provider, setProvider] = useState(stored?.provider ?? 'openai')
  const [key, setKey] = useState(stored?.apiKey ?? '')

  return (
    <div>
      <p>Bring your own API key for unlimited usage.</p>
      <p>Keys are stored in your browser only. Use at your own risk.</p>

      <select value={provider} onChange={e => setProvider(e.target.value)}>
        <option value="openai">OpenAI</option>
        <option value="anthropic">Anthropic</option>
        <option value="google">Google Gemini</option>
      </select>

      <input
        type="password"
        value={key}
        onChange={e => setKey(e.target.value)}
        placeholder="sk-... or your API key"
      />

      <button onClick={() => setStoredKey(provider, key)}>Save</button>
      <button onClick={() => { clearStoredKey(); setKey('') }}>Clear</button>

      {stored && <p>Using: {stored.provider} key</p>}
    </div>
  )
}
```

## Server-Side: Proxying BYOK Keys

The API route receives the key in the request body, creates a provider instance with it, and proxies the request. The key is never logged or stored server-side.

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

function resolveModel(byok?: { provider: string; apiKey: string }) {
  if (byok?.apiKey) {
    switch (byok.provider) {
      case 'openai':
        return createOpenAI({ apiKey: byok.apiKey })('gpt-4o')
      case 'anthropic':
        return createAnthropic({ apiKey: byok.apiKey })('claude-sonnet-4-5-20250929')
      case 'google':
        return createGoogleGenerativeAI({ apiKey: byok.apiKey })('gemini-2.5-flash')
    }
  }

  // Default: free tier (app's Gemini key)
  return createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!
  })('gemini-2.5-flash')
}

export async function POST(req: Request) {
  const { messages, byok } = await req.json()

  const model = resolveModel(byok)

  const result = await streamText({ model, messages })
  return result.toDataStreamResponse()
}
```

## Client-Side: Sending Keys Per-Request

```typescript
'use client'
import { useChat } from '@ai-sdk/react'
import { getStoredKey } from '@/lib/api-keys'

export function Chat() {
  const stored = getStoredKey()

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    body: {
      byok: stored ?? undefined,
    },
  })

  // ... render chat UI
}
```

## Rate Limiting with BYOK

BYOK users bypass the app's rate limits (they're paying with their own key). Only rate-limit free tier users.

```typescript
const { byok } = await req.json()

if (!byok?.apiKey) {
  const { success } = await rateLimit.limit(ip)
  if (!success) return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

## Security Considerations

**What's safe:**
- Keys in localStorage are same-origin only (no cross-site access)
- Keys sent over HTTPS to your API route
- API route proxies to provider and discards key
- No server-side logging of keys

**What's NOT safe (and that's ok for an experiment):**
- Browser extensions can read localStorage
- XSS vulnerability would expose keys
- No key validation before storage
- No encryption at rest in the browser

**Mitigations to consider later:**
- Validate key format before saving (starts with `sk-`, etc.)
- Test key with a lightweight API call before saving
- Show a clear disclaimer about risks

## UI States

```
No key stored:
  [Free Tier] Using Google Gemini (10 requests/day remaining)
  [Add your own key for unlimited usage]

Key stored:
  [BYOK] Using OpenAI (your key) -- unlimited
  [Change key] [Remove key]

Rate limited (free tier):
  [Rate limit reached] Try again tomorrow, or add your own API key
```
