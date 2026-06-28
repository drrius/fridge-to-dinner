# PRD - "Fridge to Dinner" (working title)

**Author:** Darius · **Date:** 2026-06-27 · **Status:** Draft v3 · **Owner:** solo

**Direction update - 2026-06-28:** v1 is now web-first: a mobile-first Next.js app with route handlers keeping provider keys server-side. The native SwiftUI/iOS app is out of scope for v1 and can return later if the web product proves the core loop.

## 1. Summary
A mobile-first web app where a user snaps or uploads a fridge/pantry photo and gets back, in seconds, (a) a list of detected ingredients and (b) 3 recipes they can make right now, plus the few items they would need to buy. The "magic moment" - photo in, dinner out - is the entire pitch and the entire demo.

## 2. Problem & insight
People stare into a full fridge and still order takeout. The friction is not lack of recipes online - it is the translation step: "given these specific things, what do I actually make?" Existing recipe apps make you search by dish; this inverts it and starts with what you have.

**Why now / why this shape:** vision models can now read a cluttered fridge photo and reason about substitutions well enough for a compelling v1. A web-first build keeps distribution simple, avoids App Store overhead, works from a shared link, and still supports camera/photo-library input on modern mobile browsers. A native app can follow if the web version proves repeat use.

## 3. Goals & non-goals
**Goals (v1)**
- Deliver the magic moment in <15 seconds from photo to recipes.
- Ship something genuinely usable in 2-3 weekends.
- Keep per-user cost low enough that a free tier is sustainable.
- Make the first public demo easy to open, try, and share from a browser.

**Non-goals (v1)** - explicitly cut to protect scope:
- Accounts / login
- Payments
- Native iOS or Android apps
- Saved recipe history, meal planning, calorie tracking
- Grocery delivery integration
- Dietary-profile personalization beyond a couple of quick toggles

## 4. Target user
**Primary:** 25-40, cooks at home a few nights/week, decision-fatigued, phone-first. Wants "tell me what to make" not "let me browse."
**Secondary (later):** budget-conscious users trying to cook what they have before it spoils.

## 5. Core user flow
1. Open the web app and tap one big **"Snap your fridge"** button.
2. Browser camera/file picker opens. User takes a photo or chooses one from their library.
3. Loading state with a warm message like "Reading your shelves..."
4. **Results screen:** detected ingredients as editable chips, then 3 recipe cards.
5. Each recipe card expands into ingredients you have, ingredients to grab, and steps.
6. CTA to **"Snap again"** plus browser sharing/copy options.

The editable-ingredients step matters: it is the graceful failure mode when vision misreads something, and it visibly improves the recipes, which makes the product feel smart rather than wrong.

## 6. Functional requirements
**P0 - MVP (the demo)**
- F1. Browser photo capture/upload using a camera-capable file input and photo-library fallback.
- F2. Image to structured ingredient list through AI vision.
- F3. Ingredients to 3 recipe suggestions with have/need split and steps.
- F4. Editable ingredient chips; editing can re-run recipe generation.
- F5. Results render fast, mobile-first, with no layout jank.

**P1 - soon after**
- F6. 2-3 dietary toggles: vegetarian, quick under 30 minutes, use what is expiring.
- F7. Web Share API / clipboard share card plus privacy reassurance.
- F8. Lightweight rate limit to cap cost.
- F9. Optional shareable result link if distribution needs it.

**P2 - monetization & retention**
- F10. Stripe + scan limits: free X/day, paid unlimited + dietary profiles.
- F11. Affiliate "buy missing items" links.
- F12. Optional accounts to save favorites.

## 7. UX / screens
1. **Home** - hero, one button, one-line value prop, optional manual ingredient fallback.
2. **Capture / review** - browser file picker, photo preview, "use this / retake."
3. **Loading** - playful status messages and scan visual to mask latency.
4. **Results** - ingredient chips, 3 recipe cards, snap-again and share actions.
5. **Recipe detail** - have/need lists, steps, time, servings, and start-cooking action.
6. **Privacy / recovery** - photo-not-saved reassurance plus retry/manual paths.

## 8. Technical architecture
- **Client:** Next.js 16 App Router web app at the repo root.
- **Frontend:** React client components with shadcn/ui source components customized to the Fridge to Dinner design system.
- **Backend:** Next.js route handlers in `app/api` as a small backend-for-frontend API that keeps provider keys server-side.
- **Camera:** browser file input with `accept="image/*"` and camera capture where supported; library upload and manual ingredients as fallbacks.
- **Image handling:** downscale/compress in the browser before upload, then send to `/api/analyze` as multipart form data. Fridge photos do not need full resolution, and smaller uploads directly cut latency and token cost.
- **AI call:** server-side route calls the OpenAI Responses API with the image plus a structured-output schema; returns JSON `{ ingredients[], recipes[] }`.
- **State:** none persisted in v1. No accounts, database, saved recipe history, or image persistence.
- **Rate limiting (P1):** Vercel KV, Upstash, or another lightweight server-side gate keyed by IP/device where practical.

### 8.1 AI design (the core of the product)
**One call, structured output.** Send the fridge image plus a system prompt to OpenAI's Responses API; force a JSON schema via `text.format` so the app receives parseable data instead of prose. Use `store: false` or the provider's equivalent privacy setting where available. Shape:

```jsonc
{
  "ingredients": [{ "name": "eggs", "confidence": "high" }],
  "recipes": [{
    "title": "Veggie fried rice",
    "minutes": 20,
    "have": ["eggs", "rice", "carrot"],
    "need": ["soy sauce"],
    "steps": ["...", "..."]
  }]
}
```

Vision input is sent from the backend after it receives the downscaled upload from the browser client. When the user edits chips, re-call `/api/recipes` with the corrected ingredient list as text rather than another image upload.

### 8.2 Model choice & per-scan cost
The exact model and pricing should be re-verified immediately before wiring the provider. The practical v1 recommendation is to start with a low-cost, vision-capable model that supports structured JSON output, then test it on real fridge photos before optimizing cost.

**Cost levers:** downscale images; keep the prompt compact; use cached input pricing where available once traffic exists; cap free scans so a viral spike cannot run up a surprise bill.

## 9. Monetization
Beer-money path, introduced only after people actually use it:
- **Free:** N scans/day per browser/device.
- **Paid (~$5/mo):** unlimited scans + dietary profiles + saved favorites.
- **Later:** affiliate links on "need to buy" items.

Distribution is the strategy: short demo videos, posts in cooking/budget communities, and a frictionless web link. Build is the easy 20%; getting it seen is the 80%.

## 10. Success metrics
- **Activation:** percent of visitors who complete one scan.
- **Magic-moment quality:** percent of scans where the user keeps the AI's ingredients without heavy editing.
- **Repeat:** scans per user in 7 days.
- **Cost:** average cost per scan.
- **Virality:** share clicks / scans.

## 11. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Vision misreads cluttered/dark fridges | Editable chips; confidence labels; guide users to a clearer photo |
| Per-scan cost balloons with traffic | Downscale, cache where possible, rate-limit, cheaper model on free tier |
| Recipes feel generic/bad | Constrain to "use what you have," show have/need split, tune the prompt |
| Browser capture is inconsistent | Support ordinary file upload and manual ingredients as reliable fallbacks |
| Built it, nobody comes | Validate via demo videos before building monetization |
| Privacy concern over fridge photos | Do not store images in v1; state "processed once, not saved" |

## 12. Roadmap (fits ~10 hrs/week)
- **Milestone 1 - Mockable web product:** mobile-first Next.js UI, mock data, responsive desktop layout.
- **Milestone 2 - Magic moment:** browser image preprocessing, `/api/analyze`, real photo to recipes.
- **Milestone 3 - Usable:** editable ingredients, `/api/recipes`, loading/retry polish, privacy copy.
- **Milestone 4 - Shareable:** Web Share API / copy card, rate limit, public demo deploy.
- **Milestone 5 - Monetize (only if traction):** scan limits, paid tier, saved favorites.

## 13. Open questions
1. Recipe source: fully AI-generated, or AI plus a curated recipe DB for reliability?
2. How aggressive is the free-tier limit?
3. Naming and domain.
4. One photo at a time, or allow fridge plus pantry as two shots?
5. Does the first public demo need durable shareable result URLs, or is browser sharing enough?
6. When, if ever, should a native iOS app re-enter scope?
