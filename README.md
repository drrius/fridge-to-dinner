# Fridge to Dinner

Fridge to Dinner turns a fridge or pantry photo into an editable ingredient list and three practical dinner ideas. The v1 direction is now a mobile-first **Next.js web app** backed by Next.js API routes.

## Current Architecture

- **Product UI:** Next.js 16 App Router web app at `app/page.tsx`, with the main flow in `components/fridge-to-dinner-app.tsx`.
- **Backend-for-frontend:** Next.js route handlers in `app/api/`.
- **Design system:** shadcn/ui source components customized to the Fridge to Dinner paper/tomato/leaf visual language.
- **State:** stateless in v1. No accounts, database, saved recipe history, or image persistence.
- **Package manager:** pnpm only. Do not add `package-lock.json`.

## Source of Truth

- Product requirements: `docs/PRD.md`.
- Visual language and tokens: `docs/design-system.md`.
- Phase plan and API/client contract: `docs/design-spec-and-implementation-plan.md`.
- Raw design export: `docs/design/Fridge-to-Dinner.dc.html`.

When these conflict, prefer the phase plan for current implementation direction, and prefer `docs/design-system.md` for visual decisions.

## Environment

Copy the example env file before implementing or running AI-backed routes:

```bash
cp .env.example .env.local
```

Variables planned for the Next.js app/API:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes outside fixture mode | Server-side provider key. Never expose it to browser code. |
| `OPENAI_MODEL` | Yes outside fixture mode | Vision-capable model used by `/api/analyze` and text recipe regeneration. |
| `FRIDGE_TO_DINNER_FIXTURE_MODE` | No | Set to `true` to return structured fixture data without calling a provider. Routes also use fixtures when no API key is set. |
| `RATE_LIMIT_DAILY_SCANS` | Later | Maximum free image scans per client/day once rate limiting ships. |
| `RATE_LIMIT_WINDOW_SECONDS` | Later | Rate-limit window length for future request throttling. |

The concrete model name and rate-limit defaults should be verified when the AI-backed vertical slice is wired end to end.

## Local Development

Requirements:

- Node.js `>=22.13 <23`
- pnpm

Install dependencies and run the web app/API:

```bash
pnpm install
pnpm dev
```

Open the app at [http://localhost:3000](http://localhost:3000). API routes live under `/api/*`.

For local backend work without an API key, leave `FRIDGE_TO_DINNER_FIXTURE_MODE=true`. `POST /api/analyze` still validates the uploaded image, then returns fixture ingredients and recipes. `POST /api/recipes` regenerates fixture recipes from ingredient JSON and does not require an image.

## Implementation Roadmap

Phase 0 and the mock frontend are implemented: the repo is web-first, the homepage is the product UI, shadcn components are customized to the design system, and the native iOS target has been removed.

Next up: wire the frontend to `/api/analyze` and `/api/recipes`, add browser-side image downscaling/compression, and keep fixture mode available for fast local demos.
