# Fridge to Dinner

Fridge to Dinner turns a fridge or pantry photo into an editable ingredient list and three practical dinner ideas. The v1 direction is a SwiftUI iPhone app backed by a small Next.js API service.

## Current Architecture

- **Product UI:** SwiftUI iOS app in `ios/fridge-to-dinner/`.
- **Backend-for-frontend:** Next.js 16 App Router route handlers in `app/api/`.
- **Web root:** kept as a minimal backend status page for now. A public web demo or landing page can be added later without changing the API contract.
- **State:** stateless in v1. No accounts, database, saved recipe history, or image persistence.

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

Variables planned for the Next.js API service:

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENAI_API_KEY` | Yes for AI routes | Server-side provider key. Never expose it to the iOS client. |
| `OPENAI_MODEL` | Yes for AI routes | Vision-capable model used by `/api/analyze` and text recipe regeneration. |
| `RATE_LIMIT_DAILY_SCANS` | Later | Maximum free image scans per client/day once rate limiting ships. |
| `RATE_LIMIT_WINDOW_SECONDS` | Later | Rate-limit window length for future request throttling. |

The concrete model name and rate-limit defaults should be verified when Phase 1 begins.

## Local Development

Requirements:

- Node.js `>=22.13 <23`
- pnpm
- Xcode for the iOS client

Install dependencies and run the API/status service:

```bash
pnpm install
pnpm dev
```

Open the status page at [http://localhost:3000](http://localhost:3000). The API routes will live under `/api/*`.

Open the iOS app with:

```bash
open ios/fridge-to-dinner/fridge-to-dinner.xcodeproj
```

## Implementation Roadmap

Phase 0 is repo alignment: SwiftUI-first client, Next.js API service, documented environment, and an explicit web-root decision. See `docs/design-spec-and-implementation-plan.md` for the full Phase 1-6 split.

Next up: Phase 1, the backend vertical slice for `/api/analyze`, `/api/recipes`, shared schemas, image validation, lazy OpenAI client setup, and sanitized API errors.
