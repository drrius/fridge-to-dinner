# Fridge to Dinner - Design Spec and Implementation Plan

Status: Draft v1; Phase 0 implemented 2026-06-28  
Date: 2026-06-27  
Primary sources: `docs/PRD.md`, `docs/design-system.md`, `docs/design/Fridge-to-Dinner.dc.html`

## 1. Product Direction

Fridge to Dinner turns a photo of a fridge or pantry into a short, editable ingredient list and three recipes the user can cook now. The core promise remains the PRD's "photo in, dinner out" moment: fast, low-friction, no account, no saved photo history.

The current repo has a Next.js API service shell and a SwiftUI iOS target. Phase 0 confirmed v1 implementation as:

- SwiftUI iPhone client for the product experience.
- Next.js 16 App Router route handlers as a backend-for-frontend API.
- Stateless processing in v1: no accounts, no database, no image persistence.

If the product direction moves back to web-first, the API contract and most design primitives still apply. The client implementation phases would move from SwiftUI views to React components.

## 2. MVP User Experience

### Primary flow

1. Home: one strong "Snap your fridge" action, optional "Type ingredients" escape hatch, no login reassurance.
2. Capture: user takes or chooses a photo.
3. Review: show the image with "Use this photo" and "Retake".
4. Analyze: upload a downscaled image, show warm progress copy and a scanning visual.
5. Results: show editable ingredient chips and three recipe cards.
6. Recipe detail: show have/need split, cooking steps, time, servings, and "Start cooking".
7. Regenerate: if ingredients are edited, call the cheaper recipe-only endpoint.
8. Share or restart: native share sheet and "Snap again".

### Required failure paths

- Camera unavailable: fall back to photo library and manual ingredient entry.
- Low confidence / unclear image: show detected chips, suggested chips, and a friendly retake path.
- API timeout: preserve the photo and offer retry, retake, or manual ingredients.
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
- Motion: scanning sweep, shimmer, and loading dots should be subtle and cancelable through reduced motion settings.

### Component inventory

- `PrimaryButton`: full-width tomato pill, 44 pt minimum height.
- `SecondaryButton`: surface or transparent pill with ink border.
- `IngredientChip`: removable pill; supports normal, suggested, edited, and invalid states.
- `PreferenceToggle`: selected/unselected pill for options like "Under 30 min" and "Vegetarian".
- `RecipeCard`: title, meta row, best-match badge, have/need summary, expand affordance.
- `RecipeDetail`: hero title, have/need sections, steps, restart/share actions.
- `LoadingScanView`: photo preview plus scan sweep and rotating status copy.
- `ErrorRecoveryView`: concise reason plus recovery actions.

### Accessibility requirements

- Every tappable control is at least 44 x 44 pt.
- Ingredient status cannot rely on color alone; include labels such as "You have" and "Grab".
- Dynamic Type must not clip primary buttons, chips, recipe titles, or step text.
- VoiceOver labels should describe chip removal, recipe expansion, retake, and share actions.
- Respect Reduce Motion for sweep/shimmer animations.

## 4. Information Architecture and State

The iOS app is a single-flow app, so start with one `NavigationStack` rather than tabs.

Suggested route model:

```swift
enum Route: Hashable {
    case reviewPhoto
    case analyzing
    case results
    case recipeDetail(id: String)
    case manualIngredients
    case privacy
}
```

Suggested state ownership:

- `@State` at the scan-flow root owns current photo, ingredients, recipes, preferences, and request state.
- A small `@Observable` `ScanSession` is acceptable because the flow spans multiple screens.
- `FridgeAPIClient` is an injected service, not a global singleton in feature views.
- Async calls run from explicit user actions or `.task(id:)`, never from `body`.
- Cancellation is normal: retake, back navigation, or new edits should cancel stale in-flight requests.

## 5. Data Contract

Use one shared schema shape between the SwiftUI client and Next.js route handlers. Keep the client tolerant of optional fields, but keep server output strict.

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
- `image`: JPEG, PNG, or HEIC converted by the client where possible.
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

Implemented decisions:

- The v1 product UI is the SwiftUI iPhone client in `ios/fridge-to-dinner/`.
- The Next.js app is the backend-for-frontend API service.
- The web root remains a minimal backend status page for now.
- `docs/design-system.md` remains the visual source of truth.
- `.env.example` documents planned server-side provider and rate-limit settings.

Deliverables:

- Update the PRD or README to confirm SwiftUI-first client plus Next.js API service.
- Keep `docs/design-system.md` as the design token source.
- Add environment documentation for `OPENAI_API_KEY`, model name, and rate-limit settings.
- Decide whether the web root remains a backend status page or becomes a demo landing page later.

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

### Phase 2 - SwiftUI design foundation

Goal: build the app shell and polished screens with mock data before networking.

Deliverables:

- Bundle or configure the brand fonts used by the design system.
- Finish the SwiftUI design tokens and primitives in `Theme.swift`.
- Create reusable components: primary/secondary buttons, chips, recipe cards, loading scan view, error recovery view.
- Replace the default `ContentView` with the single-flow app shell.
- Add previews for home, review photo, loading, results, recipe detail, and error states.

Acceptance criteria:

- Screens match the warm paper/tomato/leaf design language.
- Dynamic Type and VoiceOver basics are verified in previews or Simulator.
- The app can navigate through the full mock flow without backend calls.

### Phase 3 - Camera, preprocessing, and API integration

Goal: complete the real "photo in, dinner out" path.

Deliverables:

- Add camera capture using a SwiftUI wrapper around the system camera picker.
- Add photo-library fallback.
- Downscale and JPEG-compress images client-side before upload.
- Add `FridgeAPIClient` using `URLSession` multipart upload for `/api/analyze`.
- Wire loading, success, cancellation, retry, and timeout states.

Acceptance criteria:

- A real photo can produce recipe results through the deployed or local API.
- Retake and retry do not leave stale requests updating the UI.
- The app remains usable on slow or failed network responses.

### Phase 4 - Ingredient editing and recipe regeneration

Goal: make AI mistakes recoverable and visible.

Deliverables:

- Add removable ingredient chips and manual ingredient entry.
- Add suggested low-confidence chips that can be accepted or ignored.
- Add preference toggles for the smallest P1 set: `Under 30 min` and `Vegetarian`.
- Call `/api/recipes` after edits, with debounce or explicit "Update recipes" behavior.
- Preserve original detected ingredients for comparison and analytics.

Acceptance criteria:

- Removing, adding, or accepting chips updates recipes without another image upload.
- Loading states make regeneration clear without replacing all context.
- Empty or nonsensical ingredient lists are handled gracefully.

### Phase 5 - Guardrails, sharing, and cost controls

Goal: make the demo safe to share publicly.

Deliverables:

- Add rate limiting in `lib/rate-limit.ts`, keyed by IP/device where practical.
- Add request ids and lightweight structured logs.
- Add native share sheet for result text or a generated share card.
- Add privacy reassurance screen or sheet.
- Add production error copy for rate limit, provider failure, invalid image, and timeout.

Acceptance criteria:

- Viral or accidental repeated use has a bounded cost.
- Users can share a result without exposing the original photo.
- Production errors feel recoverable and on-brand.

### Phase 6 - Release hardening

Goal: prepare for TestFlight or a public demo.

Deliverables:

- Verify secrets and environment variables in the deployment target.
- Add smoke tests for API route handlers with mocked provider responses.
- Add SwiftUI snapshot/previews or simulator checks for core states.
- Add App Store/TestFlight metadata drafts if shipping the native app.
- Update README with local dev, backend URL configuration, and release steps.

Acceptance criteria:

- Fresh checkout can run the API and app with documented setup.
- Demo script is repeatable: capture, analyze, edit, open detail, share, snap again.
- Known limitations are documented rather than hidden.

## 9. Suggested File Split

Backend:

- `app/api/analyze/route.ts`: multipart image analysis endpoint.
- `app/api/recipes/route.ts`: recipe regeneration endpoint.
- `app/api/health/route.ts`: basic health check.
- `lib/schemas.ts`: request/response validation and TypeScript types.
- `lib/openai.ts`: lazy provider client and model config.
- `lib/image.ts`: byte-size, MIME, and normalization helpers.
- `lib/rate-limit.ts`: cost-control gate.

iOS:

- `ContentView.swift`: temporary root only until an app shell replaces it.
- `AppRootView.swift`: navigation and dependency injection.
- `ScanSession.swift`: scan-flow state and transitions.
- `FridgeAPIClient.swift`: API requests and decoding.
- `ImagePreprocessor.swift`: downscale/compression.
- `Components/`: buttons, chips, cards, loading, error views.
- `Screens/`: Home, ReviewPhoto, Analyzing, Results, RecipeDetail, ManualIngredients, Privacy.

## 10. Open Decisions

- Decide whether manual ingredient entry is P0 fallback or P1 polish. Recommendation: include a minimal version in P0 because it is the best recovery path.
- Decide if the first public demo needs shareable web links, or if native sharing is enough for the first TestFlight/demo.
- Verify current model availability, structured-output syntax, image pricing, and privacy controls against provider docs immediately before implementation.
