# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server at http://localhost:3000
npm run build        # Production build
npm run start        # Serve production build
npm run lint         # ESLint (next lint, next/core-web-vitals)
npx prisma db push   # Sync schema.prisma to the database (no migrations dir; this is the only sync mechanism)
npx prisma generate  # Regenerate the Prisma client after editing schema.prisma
npx prisma studio    # Browse/edit DB rows in a GUI
```

There is no test framework. Performance is validated by two standalone Node scripts that hit a **running** dev server over HTTP (they register a throwaway user, then time cached vs. uncached AI tool calls):

```bash
node test-cache.mjs            # Cache hit/miss latency benchmark
node demo-cache-latency.mjs    # Latency demo
```

## Environment

Requires `.env` with `DATABASE_URL` (PostgreSQL), `JWT_SECRET`, and `ANTHROPIC_API_KEY`. See `.env.example`. Note `src/lib/auth.ts` falls back to `'fallback-secret-key'` if `JWT_SECRET` is unset — never rely on this; a missing secret silently produces insecure tokens.

## Architecture

Next.js 15 App Router (React 19, TypeScript strict). Everything is one codebase: UI pages, API routes, and shared libs under `src/`. Path alias `@/*` → `src/*`. Server-side state (Prisma client, query cache) lives in module singletons, so it persists across requests within a single server instance but is **not** shared across serverless instances.

### Three-layer request flow
1. **`src/middleware.ts`** — runs on all non-`/api` routes. Reads the `token` cookie, verifies the JWT, redirects unauthenticated users to `/login` and authenticated users away from auth pages. Note it explicitly **excludes `/api`**, so API routes are not protected by middleware.
2. **API routes (`src/app/api/**/route.ts`)** — each route independently calls `getSession()` (or `getSessionFromRequest`) from `@/lib/auth` and returns 401 if absent. **This per-route check is the only auth gate for the API.** Every query is scoped by `session.userId`; there is no other tenancy boundary.
3. **Prisma → PostgreSQL** via the `@/lib/prisma` singleton (guards against connection exhaustion in dev by stashing the client on `globalThis`).

### Auth (`src/lib/auth.ts`)
JWT via `jose` (HS256, 7-day expiry), stored in an httpOnly cookie named `token`. `signToken`/`verifyToken` are the primitives; `getSession()` reads from `next/headers` cookies (use in route handlers), `getSessionFromRequest()` reads from a `NextRequest` (use in middleware). Passwords hashed with bcrypt (10 rounds). On registration (`api/auth/register`), a fixed set of 8 default categories is seeded for the new user.

### AI assistant — the central feature (`src/lib/ai-agent.ts` + `src/app/api/ai/chat/route.ts`)
The chat route runs an **agentic tool-calling loop**: it calls the Anthropic API, and while `stop_reason === 'tool_use'` it executes the requested tools, appends the assistant message + `tool_result` blocks to the conversation, and re-calls — looping until `end_turn`. Tool definitions and their execution handlers both live in `ai-agent.ts` (`tools` array + `executeTool()` switch). The six read-only tools (`get_transactions`, `analyze_spending_patterns`, `detect_anomalies`, `get_budgets`, `get_goals`, `get_summary`) all take `userId` and query Prisma. **When adding/changing a tool, update both the schema in `tools` and the `case` in `executeTool` together.**

PDF/CSV statement import (`api/transactions/upload`) is a separate, non-looping Claude call: PDFs are sent as base64 `document` vision blocks, CSVs as text; Claude returns a JSON array of transactions which is regex-extracted and bulk-inserted. Configured with `runtime = 'nodejs'`, `maxDuration = 60`, and a 10mb body limit (`next.config.ts`).

The Claude model is hardcoded as a string literal in each route (currently `claude-sonnet-4-5-20250929` in `ai/chat` and `transactions/upload`) — there is no central model config, so changing models means editing each call site.

### Query cache (`src/lib/queryCache.ts` + `src/lib/cacheInvalidation.ts`)
A custom in-memory LRU cache (singleton `queryCache`, 100 entries, 60s TTL) that **only** wraps the AI agent's read tools — regular API routes query Prisma directly and are not cached. Keys are `userId:queryType:JSON(params)`, so cache entries are naturally per-user. It also records hit/miss latencies for the stats exposed at `api/cache/stats`.

**Cache coherence is manual and easy to break:** after any mutation, the route must call the matching helper in `cacheInvalidation.ts` (`invalidateTransactionCache`, `invalidateBudgetCache`, `invalidateGoalCache`). Crucially, `invalidateTransactionCache` also clears `spending_patterns`, `summary`, **and** `budgets` because budget "spent" figures are derived from transactions. When you add a mutation endpoint or a new cached tool, wire up the corresponding invalidation or stale data will surface in the AI assistant.

### Anomaly detection (`src/lib/analytics.ts`)
Pure statistical Z-score analysis over the last 90 days of expense transactions, grouped by category. Computes per-category mean/stdDev, flags transactions with `|z| > 2` (requires ≥3 transactions in the category), and assigns severity: `>3` high, `>2.5` medium, else low. Exposed both as the `detect_anomalies` AI tool and the `api/analytics/anomalies` route.

## Data model (`prisma/schema.prisma`)

`User` owns `Transaction`, `Budget`, `Goal`, and `Category` (all cascade-delete with the user). Conventions to preserve:
- IDs are `cuid()`. `type` (income/expense), `period` (weekly/monthly/yearly), and `status` (active/completed/abandoned) are **free-form strings**, not enums — validate at the route layer.
- `Transaction` is indexed on `[userId, date]` and `[userId, categoryId]`; queries should lead with `userId` to use them.
- `Transaction.categoryId` is nullable (uncategorized transactions are normal — the upload importer creates them without a category).
