# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Gastro-AI** is a Vietnamese restaurant and cafe AI recommendation app. The project spec lives in `restaurant-ai-app.md` and is the authoritative reference for planned architecture, data schemas, and tech stack. The `frontend/` directory is the only implemented code so far; the `backend/` (FastAPI + Qdrant + PostgreSQL) does not exist yet.

## Frontend Development

The frontend is a **Next.js 14 App Router** app in `frontend/`. All data is currently mocked — there is no real backend.

```bash
# Install dependencies
cd frontend && npm install

# Dev server (http://localhost:3000)
npm run dev

# Build
npm run build

# Lint
npm run lint
```

Run via Docker (frontend only):
```bash
docker compose up -d
```

Start infrastructure services when the backend is added:
```bash
# PostgreSQL (5432) + Qdrant (6333) + Redis (6379)
docker compose up -d
open http://localhost:6333/dashboard   # Qdrant UI
```

## Architecture

### Current frontend structure

- `frontend/app/` — App Router pages (SSR/SSG)
  - `page.tsx` — homepage, hero search + trending cards
  - `search/page.tsx` — search results, split left-pane / fake-map-pane layout
  - `[slug]/page.tsx` — individual restaurant detail (SSG)
  - `profile/page.tsx` — user profile
- `frontend/components/` — `Sidebar` (fixed, `"use client"`), `RestaurantCard` (Server Component)
- `frontend/lib/mock-data.ts` — all restaurant data (`Restaurant` type + `restaurants` array); this is the single source of truth until the backend exists
- `frontend/lib/search.ts` — pure filter/sort logic over mock data; `searchRestaurants()` and `getRestaurantBySlug()`
- `frontend/app/globals.css` — all CSS custom properties and layout classes (no Tailwind; plain CSS with design tokens)

### Data flow (current)

Pages call `searchRestaurants()` or `getRestaurantBySlug()` directly at render time (no API calls yet). The `aiMatch` field on `Restaurant` drives sort order and is displayed as a percentage badge.

### Planned backend (not yet built — see `restaurant-ai-app.md`)

When built: Next.js Route Handlers at `app/api/search/` proxy to a FastAPI backend. The backend uses Claude API for intent parsing, `multilingual-e5-large` embeddings, and Qdrant vector search. See `restaurant-ai-app.md` for the full AI flow, Qdrant payload schema, and PostgreSQL schema.

## Design System

The design spec is in `UI/DESIGN.md`. CSS tokens are defined in `frontend/app/globals.css`.

Key tokens: `--primary` (#ab3500 orange), `--secondary` (#5a5d70 blue), `--mint` (#19aba3 green for "open/match" states). Typography: Montserrat for headlines, Inter for body. All spacing uses an 8px base unit. Card radius is 16px.

## Environment Variables

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

**Backend** (`.env`, when built):
```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/restaurants_db
QDRANT_URL=http://localhost:6333
ANTHROPIC_API_KEY=sk-ant-...
REDIS_URL=redis://localhost:6379
```

## Key Conventions

- Restaurant categories use slug keys: `"nuong"`, `"lau"`, `"cafe"`, `"bun-pho"`, `"com"` — these are used in URL params and as keys in `categoryVisuals` on the homepage.
- `priceRange` is always `1 | 2 | 3` (1 = <100k VND, 2 = 100–300k, 3 = >300k).
- New restaurants added to `mock-data.ts` must include an `aiMatch` (0–100) and `aiInsight` string to simulate the AI recommendation layer.
- The `Sidebar` component is always rendered; it is `"use client"` and uses `usePathname()` for active state — do not make it a Server Component.
