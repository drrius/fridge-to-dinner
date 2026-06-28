# Fridge to Dinner - Design Spec and Implementation Plan

Status: Draft v2; web-first direction updated 2026-06-28  
Date: 2026-06-27  
Primary sources: `docs/PRD.md`, `docs/design-system.md`, `docs/design/Fridge-to-Dinner.dc.html`

## 1. Product Direction

Fridge to Dinner turns a fridge or pantry photo into a short, editable ingredient list and three recipes the user can cook now. The core promise remains "photo in, dinner out": fast, low-friction, no account, no saved photo history.

The current repo is now a web-first Next.js app:

- Next.js 16 App Router serves the product UI from the repo root.
- React client components own the scan flow and use shadcn/ui source components customized to the design system.
- Next.js route handlers under `app/api` act as the backend-for-frontend and keep provider keys server-side.
- v1 remains stateless: no accounts, no database, no saved recipe history, no image persistence.
- The previous native iOS target has been removed from this repo. SwiftUI can return as a follow-up after the web product proves the loop.

## 2. MVP User Experience

### Primary flow

1. Home: one strong "Snap your fridge" action, optional "Type ingredients" escape hatch, no-login reassurance.
2. Capture/review: browser file picker or camera capture, followed by a photo preview and "Use this photo" / "Retake".
3. Analyze: downscale/compress the image in the browser, upload it, and show warm progress copy with a scanning visual.
4. Results: show editable ingredient chips and three recipe cards.
5. Recipe detail: show have/need split, cooking steps, time, servings, and "Start cooking".
6. Regenerate: if ingredients are edited, call the cheaper recipe-only endpoint.
7. Share or restart: Web Share API where available, clipboard/share-card fallback, and "Snap again".

### Required failure paths

- Browser camera unavailable: fall back to photo-library upload and manual ingredient entry.
- Low confidence / unclear image: show detected chips, suggested chips, and a friendly retake path.
- API timeout: preserve the selected photo and offer retry, retake, or manual ingredients.
- Rate limited: explain the daily free scan limit without implying data loss.
- Bad AI output: validate shape server-side and return a recoverable error.

## 3. Visual and Interaction Spec

Use `docs/design-system.md` as the visual source of truth. The product should feel warm, food-forward, and direct rather than clinical.

### Visual rules

- Background: warm paper (`#FBF6EE`) instead of pure white.
- Primary action: tomato pill button with a single CTA glow per screen.
- Semantic pair: leaf for "you have", tomato/pink tint for "need/grab".
- Typography: serif display for headlines and recipe titles, sans for interface text, mono for status/meta labels.
- Cards: surface fill, low ink border, restrained elevation. Use the hard offset shadow only for emphasis moments.
- Motion: scanning sweep, shimmer, and loading dots should be subtle and respect reduced-motion preferences.

### Component inventory

- `Button`: shadcn base customized for tomato primary, surface secondary, and icon-only actions.
- `IngredientChip`: removable pill; supports normal, suggested, edited, and invalid states.
- `PreferenceToggle`: selected/unselected pill for options like "Under 30 min" and "Vegetarian".
- `RecipeCard`: title, meta row, best-match badge, have/need summary, expand affordance.
- `RecipeDetail`: hero title, have/need sections, steps, restart/share actions.
- `LoadingScanView`: photo preview plus scan sweep and rotating status copy.
- `ErrorRecoveryView`: concise reason plus recovery actions.
- `PrivacySheet`: reassurance that photos are processed once and not saved.

### Accessibility requirements

- Every interactive control is at least 44 x 44 CSS pixels.
- Ingredient status cannot rely on color alone; include labels such as "You have" and "Grab".
- Text must not clip primary buttons, chips, recipe titles, or step text on mobile or desktop.
- Buttons and icon buttons need clear accessible names.
- Respect `prefers-reduced-motion` for sweep/shimmer animations.

## 4. Information Architecture and State

The web app is a single-flow product experience rendered from the App Router root. Keep browser-only state in a focused client component rather than adding global state or premature routing.

Suggested screen model:

```ts
type Screen =
  | "home"
  | "manual"
  | "review"
  | "analyzing"
  | "results"
  | "detail"
  | "privacy"
  | "error"
  | "share";
```

Suggested state ownership:

- `components/fridge-to-dinner-app.tsx` owns selected photo, ingredients, recipes, preferences, selected recipe, and request state.
- Extract visual sections into smaller components once repetition appears, but keep API effects tied to explicit user actions.
- Async calls should run from button/form events, never as a render side effect.
- Retake, retry, cancel, or new edits must prevent stale requests from overwriting newer state.
- Fixture mode should stay easy to trigger for demos and UI work without provider secrets.

## 5. Data Contract

Use one shared schema shape between the React client and Next.js route handlers. Keep the client tolerant of optional fields, but keep server output strict.

### Ingredient

```json
{
  "id": "ing_eggs",
  "name": "eggs",
  "confidence": "high",
  "source": "vision"
}
```

Fields:

- `id`: stable client/server identifier for editing.
- `name`: display name, normalized to a human-friendly singular/plural.
- `confidence`: `high`, `medium`, or `low`.
- `source`: `vision`, `user`, or `suggested`.

### Recipe

```json
{
  "id": "recipe_1",
  "title": "Veggie fried rice",
  "minutes": 20,
  "servings": 2,
  "difficulty": "easy",
  "have": ["eggs", "rice", "carrot"],
  "need": ["soy sauce"],
  "steps": ["Cook the rice...", "Scramble the eggs..."],
  "whyThisWorks": "Uses the cooked rice and eggs as the base, with vegetables for texture."
}
```

### API success envelope

```json
{
  "ingredients": [],
  "recipes": [],
  "meta": {
    "requestId": "req_123",
    "latencyMs": 4200
  }
}
```

### API error envelope

```json
{
  "error": {
    "code": "image_too_large",
    "message": "That photo is too large. Try a smaller image.",
    "retryable": false
  }
}
```

Keep error messages sanitized. Do not send provider stack traces, prompts, API keys, or raw model output to clients.

## 6. Backend API Spec

Use Next.js App Router route handlers under `app/api/**/route.ts`. Route handlers are public endpoints, so validation, rate limiting, and sanitized errors belong at the edge of each handler. POST handlers are request-time only and should not rely on caching.

### `POST /api/analyze`

Purpose: process an image and return ingredients plus recipes.

Request:

- `multipart/form-data`
- `image`: JPEG, PNG, or HEIC converted by the browser where possible.
- `preferences`: optional JSON string with toggles such as `vegetarian`, `under30`, `useExpiringSoon`.

Server behavior:

- Validate content type and byte size before reading fully when possible.
- Normalize or reject unsupported images.
- Call a configurable vision-capable model through `lib/openai.ts`.
- Require structured output and validate it before returning.
- Use `store: false` or equivalent provider setting where available.
- Never persist uploaded image bytes in v1.

### `POST /api/recipes`

Purpose: regenerate recipes from corrected ingredients without reprocessing an image.

Request:

```json
{
  "ingredients": [],
  "preferences": {
    "vegetarian": false,
    "under30": true
  }
}
```

Server behavior:

- Validate ingredient count and names.
- Call a text-only recipe generation prompt.
- Return the same success envelope as `/api/analyze`.
- This should be materially cheaper and faster than the image route.

### `GET /api/health`

Purpose: simple deployment and app connectivity check.

Response:

```json
{
  "ok": true,
  "service": "fridge-to-dinner-api"
}
```

## 7. AI and Privacy Spec

- Model name must be configured through environment, not hardcoded into UI.
- OpenAI or provider clients should be lazy-initialized so `next build` does not require runtime secrets.
- Prompts must ask for practical weeknight recipes, not generic recipe browsing.
- The model should return confidence for detected ingredients and avoid claiming certainty from unclear photos.
- The backend should reject outputs with empty recipe arrays, missing steps, or ingredients that do not map to the have/need split.
- Photos are processed once and not stored in v1.
- Logs may include request id, latency, byte size, error code, and token/cost metadata. Logs must not include image bytes or full ingredient photos.

## 8. Implementation Phases

### Phase 0 - Product and repo alignment

Goal: make the repo direction explicit before feature work starts.

Current status: implemented.

Implemented decisions:

- The v1 product UI is the Next.js web app.
- The homepage is the product experience, not a backend status page.
- The native iOS target has been removed from this repo.
- The project uses pnpm only.
- `docs/design-system.md` remains the visual source of truth.
- `.env.example` documents server-side provider and rate-limit settings.

Acceptance criteria:

- A contributor can tell where the UI lives, where the API lives, and which docs are authoritative.

### Phase 1 - Backend vertical slice

Goal: return validated mock-shaped data from the API, then swap in the AI call.

Deliverables:

- Implement shared TypeScript schemas in `lib/schemas.ts`.
- Implement lazy provider client setup in `lib/openai.ts`.
- Implement image validation helpers in `lib/image.ts`.
- Implement `POST /api/analyze`, `POST /api/recipes`, and `GET /api/health`.
- Add fixture responses for local development and tests.
- Add basic request size limits and sanitized error envelopes.

Acceptance criteria:

- `pnpm lint` and `pnpm build` pass.
- `/api/analyze` rejects invalid images and returns structured data for a valid fixture.
- `/api/recipes` regenerates from ingredient JSON without requiring an image.

### Phase 2 - Web UI foundation

Goal: build the polished mobile-first screens with mock data before networking.

Current status: implemented as the first frontend pass.

Deliverables:

- Import the design tokens into `app/globals.css`.
- Install and customize shadcn/ui base components.
- Build the single-flow app shell in `components/fridge-to-dinner-app.tsx`.
- Implement home, manual entry, review, analyzing, results, detail, privacy, error, and share states with mock data.
- Make the layout feel first-class on mobile and composed on desktop.

Acceptance criteria:

- Screens match the warm paper/tomato/leaf design language.
- The mock flow works without backend calls.
- Mobile, tablet, and desktop layouts avoid text overlap and awkward wrapping.

### Phase 3 - Browser image preprocessing and API integration

Goal: complete the real "photo in, dinner out" path.

Deliverables:

- Add browser file/camera input with photo-library fallback.
- Downscale and compress images before upload.
- Upload multipart form data to `/api/analyze`.
- Wire loading, success, cancellation, retry, timeout, and invalid-image states.
- Keep fixture mode available for local demos and UI work.

Acceptance criteria:

- A real photo can produce recipe results through the local or deployed API.
- Retake and retry do not leave stale requests updating the UI.
- The app remains usable on slow or failed network responses.

### Phase 4 - Ingredient editing and recipe regeneration

Goal: make AI mistakes recoverable and visible.

Deliverables:

- Add removable ingredient chips and manual ingredient entry.
- Add suggested low-confidence chips that can be accepted or ignored.
- Add preference toggles for the smallest P1 set: `Under 30 min` and `Vegetarian`.
- Call `/api/recipes` after edits, using the existing explicit "Update recipes" behavior unless testing shows debounce is better.
- Preserve original detected ingredients for comparison and analytics.

Acceptance criteria:

- Removing, adding, or accepting chips updates recipes without another image upload.
- Loading states make regeneration clear without replacing all context.
- Empty or nonsensical ingredient lists are handled gracefully.

### Phase 5 - Web sharing, guardrails, and cost controls

Goal: make the demo safe to share publicly.

Deliverables:

- Add rate limiting in `lib/rate-limit.ts`, keyed by IP/device where practical.
- Add request ids and lightweight structured logs.
- Add Web Share API support for result text or a generated share card.
- Add clipboard fallback for unsupported browsers.
- Add privacy reassurance screen or sheet.
- Add production error copy for rate limit, provider failure, invalid image, and timeout.

Acceptance criteria:

- Viral or accidental repeated use has a bounded cost.
- Users can share a result without exposing the original photo.
- Production errors feel recoverable and on-brand.

### Phase 6 - Release hardening

Goal: prepare for a public web demo.

Deliverables:

- Verify secrets and environment variables in the deployment target.
- Add smoke tests for API route handlers with mocked provider responses.
- Add browser checks for the core flow across mobile and desktop viewports.
- Add a repeatable demo script: capture/upload, analyze, edit, open detail, share, snap again.
- Update README with local dev, env, and release steps as the API integration solidifies.

Acceptance criteria:

- Fresh checkout can run the app and API with documented setup.
- `pnpm lint` and `pnpm build` pass.
- Known limitations are documented rather than hidden.

## 9. Suggested File Split

Frontend:

- `app/page.tsx`: App Router entry that renders the product experience.
- `app/globals.css`: design tokens, theme variables, and global styles.
- `components/fridge-to-dinner-app.tsx`: scan-flow state machine.
- `components/screens/*`: one exported component per user-facing screen.
- `components/*`: shared app components such as recipe cards, chips, and shell UI.
- `components/ui/*`: shadcn/ui source components customized to the design system.
- `public/*`: visual assets used by the app.

Backend:

- `app/api/analyze/route.ts`: multipart image analysis endpoint.
- `app/api/recipes/route.ts`: recipe regeneration endpoint.
- `app/api/health/route.ts`: basic health check.
- `lib/schemas.ts`: request/response validation and TypeScript types.
- `lib/openai.ts`: lazy provider client and model config.
- `lib/image.ts`: byte-size, MIME, and normalization helpers.
- `lib/rate-limit.ts`: cost-control gate.

Optional future native app:

- If a SwiftUI app returns later, treat it as a new client that consumes the same `app/api` contract rather than moving v1 back into native code.

## 10. Open Decisions

- Decide whether minimal manual ingredient entry is enough for P0 recovery, or whether it needs richer editing before the first public demo.
- Decide if the first public demo needs durable shareable result URLs, or if Web Share/clipboard is enough.
- Verify current model availability, structured-output syntax, image pricing, and privacy controls against provider docs immediately before implementation.
- Decide whether a native iOS follow-up is still worth doing after web validation.
