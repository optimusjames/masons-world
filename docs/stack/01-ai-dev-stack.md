# AI Development Stack (2026)

A practical reference for building AI-powered web applications and public experiments. Covers the core framework, AI providers, background jobs, and cost control.

## Fixed Stack Components

### Core Framework
- **TypeScript** - Type safety across the entire stack
- **React** - UI framework
- **Next.js** - App Router (Next.js 13+) for React Server Components, streaming, and route handlers
- **Tailwind CSS** - Utility-first styling

### Infrastructure
- **Vercel** - Hosting, edge functions, automatic deployments
- **Trigger.dev** - Background jobs, long-running AI workflows, task orchestration
- **Supabase** - Postgres database, realtime subscriptions, auth, edge functions

---

## Vercel AI SDK: The Orchestration Layer

The **Vercel AI SDK** (currently v6 / AI SDK 6) is the central abstraction layer that unifies AI providers, streaming, and UI patterns. It provides a consistent interface across OpenAI, Anthropic, Google, and 30+ other providers.

### Core Packages

```bash
# Core SDK and React hooks
npm install ai @ai-sdk/react

# AI Provider adapters (install as needed)
npm install @ai-sdk/openai
npm install @ai-sdk/anthropic
npm install @ai-sdk/google
```

### Key Features (AI SDK 6)

1. **Provider abstraction** - Switch AI models with one line of code
2. **Streaming by default** - Built-in support for SSE streaming
3. **React hooks** - `useChat`, `useCompletion`, `useObject`, `useAssistant`
4. **Tool calling** - Type-safe function calling with strict mode
5. **Structured outputs** - `Output.object()` for validated JSON generation
6. **Agent abstraction** - `ToolLoopAgent` for multi-step agentic workflows

### Integration Pattern: Next.js App Router

**Backend (Route Handler):**

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
  })

  return result.toDataStreamResponse()
}
```

**Frontend (React Component):**

```typescript
'use client'
import { useChat } from '@ai-sdk/react'

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>{m.content}</div>
      ))}
      <form onSubmit={handleSubmit}>
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  )
}
```

The SDK handles streaming, error recovery, and UI state automatically.

---

## AI Providers: Tiered Approach

### Free Tier (Public Demos)

**Google Gemini API**

- **Models:**
  - `gemini-2.5-flash`: 10 RPM, 250 RPD, 250k TPM
  - `gemini-2.5-pro`: 5 RPM, 100 RPD, 250k TPM
  - `flash-lite`: 15 RPM, 1000 RPD, 250k TPM

- **Context:** 1 million tokens across all models
- **Cost:** Free (no credit card required)
- **Limits:** Per-project quotas reset daily at midnight Pacific
- **Recent changes:** Google reduced free tier limits by 50-80% in December 2025

**Use case:** Anonymous users, rate-limited public demos, proof-of-concept projects

### Paid Tier (Production / Serious Work)

**Anthropic Claude API**

Current pricing (February 2026):

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window |
|-------|---------------------|----------------------|----------------|
| Claude Haiku 4.5 | $1.00 | $5.00 | 200k |
| Claude Sonnet 4.5 | $3.00 | $15.00 | 200k |
| Claude Opus 4.6 | $5.00 | $25.00 | 1M |

- **Fast mode:** Available for Opus 4.6 at $30/$150 per MTok (2.5x faster output)
- **Prompt caching:** 90% cost savings on repeated context
- **Batch API:** 50% discount for async processing

**OpenAI API**

Current pricing (2026):

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window |
|-------|---------------------|----------------------|----------------|
| GPT-4o | $2.50 | $10.00 | 128k |
| GPT-4o-mini | $0.15 | $0.60 | 128k |
| GPT-4.1 | $2.00 | $8.00 | 1M |

- **Cached input:** 50% off at $1.25/MTok
- **Batch API:** 50% discount for both input/output

**Use case:** Authenticated users, projects with budget, high-quality generation. See the BYOK pattern doc for bring-your-own-key implementation.

### Integration with Vercel AI SDK

```typescript
import { anthropic } from '@ai-sdk/anthropic'
import { google } from '@ai-sdk/google'

// Free tier for anonymous users
const model = user.isAuthenticated
  ? anthropic('claude-sonnet-4.5')
  : google('gemini-2.5-flash')
```

---

## Trigger.dev: Background Jobs and AI Orchestration

Trigger.dev handles long-running AI tasks that exceed Vercel's 10-second serverless timeout. It provides durable execution, automatic retries, and observability.

### Why Trigger.dev for AI?

1. **No timeouts** - Run AI workflows for hours/days (Vercel max: 10s hobby, 300s pro)
2. **Automatic retries** - Built-in retry logic with exponential backoff
3. **Rate limit handling** - Queue management and backoff for API limits
4. **Checkpoint-resume** - Execution pauses during AI API calls (pay only for active compute)
5. **Observability** - Built-in logging, tracing, and progress tracking
6. **Realtime API** - React hooks to stream task progress to frontend

### Core Patterns for AI Workflows

#### 1. Simple AI Task (Long Generation)

```typescript
// trigger/generate-dashboard.ts
import { task } from '@trigger.dev/sdk'
import { generateText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'

export const generateDashboard = task({
  id: 'generate-dashboard',
  run: async (payload: { prompt: string }) => {
    const { text } = await generateText({
      model: anthropic('claude-opus-4.6'),
      prompt: payload.prompt,
      experimental_telemetry: true,
    })

    return { dashboard: JSON.parse(text) }
  },
})
```

#### 2. Multi-Step AI Workflow (Coordinator Pattern)

```typescript
import { task, batch } from '@trigger.dev/sdk'

export const generateComplexDashboard = task({
  id: 'generate-complex-dashboard',
  run: async (payload: { prompt: string }) => {
    // Step 1: Generate dashboard structure
    const structure = await generateStructure.trigger({ prompt: payload.prompt })

    // Step 2: Generate each widget in parallel with rate limiting
    const widgets = await batch.triggerByTaskAndWait(
      'generate-widget',
      structure.widgets.map(w => ({ widget: w })),
      { concurrencyLimit: 5 }
    )

    // Step 3: Validate and combine
    return { dashboard: combineWidgets(widgets) }
  },
})
```

#### 3. Rate-Limited Batch Processing

```typescript
export const processBatch = task({
  id: 'process-batch',
  queue: {
    name: 'ai-requests',
    concurrencyLimit: 5,
  },
  retry: {
    maxAttempts: 3,
    byStatus: {
      '429': {
        strategy: 'headers',
        resetHeader: 'x-ratelimit-reset',
      },
    },
  },
  run: async (payload) => {
    // AI generation with automatic retry on rate limits
  },
})
```

### Triggering from Next.js

```typescript
// app/api/generate/route.ts
import { tasks } from '@trigger.dev/sdk/v3'
import type { generateDashboard } from '@/trigger/generate-dashboard'

export async function POST(req: Request) {
  const { prompt } = await req.json()

  const handle = await tasks.trigger<typeof generateDashboard>(
    'generate-dashboard',
    { prompt }
  )

  return Response.json({ runId: handle.id })
}
```

### Realtime Progress Updates (React Hook)

```typescript
'use client'
import { useRealtimeRun } from '@trigger.dev/react-hooks'

export function DashboardGenerator({ runId }: { runId: string }) {
  const { run, error } = useRealtimeRun(runId)

  if (run?.status === 'EXECUTING') {
    return <div>Generating: {run.output?.progress}%</div>
  }

  if (run?.status === 'COMPLETED') {
    return <Dashboard data={run.output} />
  }

  return <div>Loading...</div>
}
```

---

## Supabase: Database, Realtime, Auth, Edge Functions

Supabase provides the backend infrastructure for AI-powered apps.

### Postgres Database

Store AI-generated content, user data, and conversation history:

```sql
create table dashboards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  spec jsonb not null,
  embedding vector(1536),
  created_at timestamptz default now()
);

-- Vector similarity search
create index on dashboards using hnsw (embedding vector_cosine_ops);
```

Use `pgvector` for semantic search over generated content.

### Realtime Subscriptions

Stream live updates to collaborative features or AI generation progress:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(url, key)

supabase
  .channel('dashboards')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'dashboards' },
    (payload) => {
      console.log('Dashboard updated:', payload.new)
    }
  )
  .subscribe()
```

### Supabase Auth

User authentication for rate limit tiers:

```typescript
// app/api/chat/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  const rateLimit = user ? authenticatedLimit : anonymousLimit
}
```

**Auth providers:** Email, OAuth (Google, GitHub, etc.), magic links, phone (SMS)

### When to Use Supabase Edge Functions vs Vercel

- **Supabase:** When you need direct Postgres access, RLS enforcement, or global distribution
- **Vercel:** When you need seamless Next.js integration and Vercel AI SDK streaming

Both can coexist.

---

## Rate Limiting and Cost Control

### Edge Rate Limiting with Upstash Redis

```bash
npm install @upstash/ratelimit @upstash/redis
```

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

// Free tier: 3 requests per day
export const freeTierLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(3, '24h'),
  prefix: 'ratelimit:free',
})

// Paid tier: 100 requests per minute
export const paidTierLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(100, '1m'),
  prefix: 'ratelimit:paid',
})
```

```typescript
// app/api/chat/route.ts
import { freeTierLimit, paidTierLimit } from '@/lib/rate-limit'

export async function POST(req: Request) {
  const user = await getUser(req)
  const limit = user?.isPaid ? paidTierLimit : freeTierLimit

  const { success, reset } = await limit.limit(user?.id || getIP(req))

  if (!success) {
    return Response.json(
      { error: 'Rate limit exceeded', reset },
      { status: 429 }
    )
  }

  // Continue with AI generation
}
```

**Why Upstash:**
- HTTP-based (works on Vercel Edge)
- Global replication
- Generous free tier (10k requests/day)
- Caches in edge function memory

### Full Stack Cost Control

1. **Upstash Redis** - Edge rate limiting (per-user quotas)
2. **Supabase Auth** - Track user tier (free vs paid)
3. **Supabase Database** - Log usage for analytics
4. **Trigger.dev queues** - Prevent runaway batch jobs (concurrency limits)
5. **AI SDK** - Switch to cheaper models for free tier

```typescript
const model = user.isPaid
  ? anthropic('claude-opus-4.6')  // $5/$25 per MTok
  : google('gemini-2.5-flash')    // Free
```

---

## Complete Package List

### Core Framework
```bash
npm install next@latest react react-dom
npm install -D typescript @types/react @types/node
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Vercel AI SDK
```bash
npm install ai @ai-sdk/react
npm install @ai-sdk/openai        # OpenAI
npm install @ai-sdk/anthropic     # Claude
npm install @ai-sdk/google        # Gemini
```

### Trigger.dev
```bash
npm install @trigger.dev/sdk
npm install -D @trigger.dev/cli
npm install @trigger.dev/react-hooks  # For useRealtimeRun
```

### Supabase
```bash
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-nextjs  # Next.js auth helpers
```

### Rate Limiting
```bash
npm install @upstash/ratelimit @upstash/redis
```

### Optional
```bash
npm install zod                   # Schema validation
npm install @vercel/analytics     # Vercel Analytics
npm install @vercel/speed-insights # Performance monitoring
```

---

## Key Integration Patterns

### Pattern 1: Streaming Chat (Simple, <10s)

```typescript
// Use Vercel AI SDK streaming directly
export async function POST(req: Request) {
  const result = await streamText({ model, messages })
  return result.toDataStreamResponse()
}
```

### Pattern 2: Long-Running Generation (>10s)

```typescript
// Trigger Trigger.dev task, stream progress via Realtime
export async function POST(req: Request) {
  const handle = await tasks.trigger('long-generation', payload)
  return Response.json({ runId: handle.id })
}
// Frontend uses useRealtimeRun(runId) to show progress
```

### Pattern 3: Rate-Limited Batch Processing

```typescript
// Coordinator task triggers N workers with concurrency limit
export const batchGenerate = task({
  id: 'batch-generate',
  run: async (payload) => {
    const handles = await batch.triggerByTaskAndWait(
      'generate-one',
      payload.items,
      { concurrencyLimit: 5 }
    )
    return handles
  },
})
```

### Pattern 4: Realtime Collaborative Features

```typescript
// Supabase Realtime for live updates
supabase
  .channel('dashboard')
  .on('postgres_changes', { event: '*', table: 'dashboards' }, handleChange)
  .on('broadcast', { event: 'cursor-move' }, handleCursor)
  .subscribe()
```

---

## References

### Vercel AI SDK
- [AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [Getting Started: Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router)

### AI Providers
- [Google Gemini API Pricing](https://ai.google.dev/gemini-api/docs/pricing)
- [Anthropic Claude Pricing](https://www.anthropic.com/pricing)
- [OpenAI API Pricing](https://platform.openai.com/docs/pricing)

### Trigger.dev
- [Trigger.dev Documentation](https://trigger.dev/docs/introduction)
- [Using Vercel AI SDK with Trigger.dev](https://trigger.dev/docs/guides/examples/vercel-ai-sdk)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Realtime Documentation](https://supabase.com/docs/guides/realtime)

### Rate Limiting
- [Upstash Rate Limiting](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)

---

## Summary

This stack provides:

1. **AI orchestration** via Vercel AI SDK (unified provider interface, streaming, React hooks)
2. **Backend durability** via Trigger.dev (no timeouts, retries, observability)
3. **Data layer** via Supabase (Postgres, realtime, auth, vector search)
4. **Cost control** via tiered AI providers + Upstash rate limiting
5. **Developer experience** via Next.js + TypeScript + Tailwind

The key insight is that **each service handles what it does best:**
- Vercel AI SDK: streaming, UI, provider abstraction
- Trigger.dev: long-running workflows, queues, retries
- Supabase: data persistence, realtime, auth
- Upstash: edge rate limiting
