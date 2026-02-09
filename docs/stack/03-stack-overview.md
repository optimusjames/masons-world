# Stack Overview

High-level view of the AI experiment stack. Everything is TypeScript, hosted on Vercel, backed by Supabase and Trigger.dev.

## The Stack

```
Vercel (hosting + edge)
  |
  +-- Next.js (App Router)
  |     +-- React (UI)
  |     +-- Tailwind CSS (styling)
  |     +-- shadcn/ui (components)
  |
  +-- Vercel AI SDK (ai orchestration)
  |     +-- @ai-sdk/google    (free tier - public demos)
  |     +-- @ai-sdk/anthropic (paid tier - BYOK)
  |     +-- @ai-sdk/openai    (paid tier - BYOK)
  |
  +-- Upstash Redis (edge rate limiting)

Supabase (backend services)
  |
  +-- Postgres (data + pgvector)
  +-- Auth (user tiers, OAuth)
  +-- Realtime (live updates, presence)
  +-- Edge Functions (webhooks, background)

Trigger.dev (durable compute)
  |
  +-- Background tasks (bypass Vercel 10s timeout)
  +-- Queues + rate limiting (AI API protection)
  +-- Cron jobs (scheduled regeneration)
  +-- Realtime hooks (progress streaming)
```

## Next.js App Structure

```
app/
  layout.tsx                    # Root layout, providers, fonts
  page.tsx                      # Landing / home
  (auth)/
    login/page.tsx
    callback/route.ts           # OAuth callback
  (app)/
    layout.tsx                  # Authenticated layout shell
    dashboard/page.tsx          # Main experiment UI
    settings/page.tsx           # API key management, preferences
  api/
    chat/route.ts               # AI streaming endpoint (Vercel AI SDK)
    generate/route.ts           # Structured generation endpoint
    trigger/route.ts            # Trigger.dev webhook handler

components/
  ui/                           # shadcn/ui primitives (button, card, etc.)
  [experiment]/                 # Experiment-specific components
  provider-select.tsx           # AI provider/model picker
  api-key-input.tsx             # BYOK key entry
  rate-limit-badge.tsx          # Remaining requests display

lib/
  ai.ts                         # AI SDK model config + BYOK resolver
  supabase/
    client.ts                   # Browser client
    server.ts                   # Server client (route handlers)
    middleware.ts               # Auth middleware
  trigger/
    client.ts                   # Trigger.dev client
  rate-limit.ts                 # Upstash rate limiter

trigger/
  tasks/                        # Trigger.dev task definitions
    generate.ts                 # Long-running AI generation
    batch.ts                    # Batch processing
    scheduled.ts                # Cron jobs

config/
  providers.ts                  # Available AI providers + models
  limits.ts                     # Rate limit tiers

middleware.ts                   # Next.js middleware (auth + rate limiting)
trigger.config.ts               # Trigger.dev config
```

## Data Flow

```
User Input
  |
  v
middleware.ts (auth check + rate limit)
  |
  v
API Route (/api/chat or /api/generate)
  |
  +--[simple, <10s]--> Vercel AI SDK --> stream to client
  |
  +--[complex, >10s]--> Trigger.dev task
                           |
                           +--> AI generation (no timeout)
                           +--> Store result in Supabase
                           +--> Notify client via Realtime
```

## AI Provider Resolution

```
Request arrives
  |
  +-- Has BYOK key? --> Use user's key + selected provider
  |
  +-- Authenticated? --> Use app's paid provider (higher limits)
  |
  +-- Anonymous? --> Use free tier (Google Gemini Flash)
```

## Environment Variables

```bash
# AI Providers (server-side only)
GOOGLE_GENERATIVE_AI_API_KEY=   # Free tier fallback
OPENAI_API_KEY=                 # Optional app-level key
ANTHROPIC_API_KEY=              # Optional app-level key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=       # Public (client needs it)
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Public (RLS enforced)
SUPABASE_SERVICE_ROLE_KEY=      # Server-side only

# Trigger.dev
TRIGGER_SECRET_KEY=             # Server-side only

# Upstash
UPSTASH_REDIS_REST_URL=         # Server-side only
UPSTASH_REDIS_REST_TOKEN=       # Server-side only
```

## Services and Free Tier Limits

| Service | Free Tier | Constraint |
|---------|-----------|------------|
| Vercel Hobby | 150k fn invocations/mo | 10s timeout |
| Google Gemini | 250 req/day (Flash) | 10 RPM |
| Supabase Free | 500MB DB, 2GB bandwidth | 50k auth users |
| Trigger.dev Free | 50k runs/mo | 30s max duration |
| Upstash Free | 10k commands/day | 256MB storage |
