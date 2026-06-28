# PRD — "Fridge to Dinner" (working title)

**Author:** Darius · **Date:** 2026-06-27 · **Status:** Draft v2 · **Owner:** solo

**Direction update — 2026-06-28:** v1 is now SwiftUI-first: a native iPhone client backed by a Next.js API service. Earlier web-first notes are retained only where they describe product intent or future web/demo opportunities.

## 1. Summary
A mobile-first iPhone app where a user photographs their fridge/pantry and gets back, in seconds, (a) a list of detected ingredients and (b) 3 recipes they can make right now, plus the few items they'd need to buy. The "magic moment" — photo in, dinner out — is the entire pitch and the entire demo.

## 2. Problem & insight
People stare into a full fridge and still order takeout. The friction isn't lack of recipes online — it's the translation step: "given *these specific things*, what do I actually make?" Existing recipe apps make you search by dish; this inverts it — search by what you have.

**Why now / why this shape:** vision models can now reliably read a cluttered fridge photo and reason about substitutions. A native iPhone client gives the v1 demo a polished camera, sharing, and cooking experience; a web demo or shareable result page can follow if distribution needs it.

## 3. Goals & non-goals
**Goals (v1)**
- Deliver the magic moment in <15 seconds from photo to recipes.
- Ship something genuinely usable in 2–3 weekends.
- Keep per-user cost low enough that a free tier is sustainable.

**Non-goals (v1)** — explicitly cut to protect scope:
- ❌ Accounts / login
- ❌ Payments
- ❌ Android app
- ❌ Public web client / PWA
- ❌ Saved recipe history, meal planning, calorie tracking
- ❌ Grocery delivery integration
- ❌ Dietary-profile personalization beyond a couple of quick toggles

## 4. Target user
**Primary:** 25–40, cooks at home a few nights/week, decision-fatigued, phone-first. Wants "tell me what to make" not "let me browse."
**Secondary (later):** budget-conscious users trying to cook what they have before it spoils.

## 5. Core user flow
1. Open app → one big **"Snap your fridge"** button.
2. Camera opens. User takes or chooses a photo.
3. Loading state with a fun message ("Reading your shelves…").
4. **Results screen:** detected ingredients (editable chips — tap to remove a wrong one, add a missing one), then 3 recipe cards.
5. Each recipe card → tap to expand: ingredients you have ✅ / need to buy 🛒, plus steps.
6. CTA to **"Snap again"** and a **share** button.

The editable-ingredients step matters: it's the graceful failure mode when vision misreads something, and it visibly improves the recipes, which makes the product feel smart rather than wrong.

## 6. Functional requirements
**P0 — MVP (the demo)**
- F1. Photo capture/upload (iOS camera + photo library fallback).
- F2. Image → structured ingredient list (AI vision).
- F3. Ingredients → 3 recipe suggestions with have/need split + steps (AI).
- F4. Editable ingredient chips; editing re-runs recipe generation.
- F5. Results render fast, mobile-first, no layout jank.

**P1 — soon after**
- F6. 2–3 dietary toggles (vegetarian, quick <30 min, "use what's expiring").
- F7. Native share sheet + privacy reassurance screen.
- F8. Lightweight rate limit (free scans per device/day) to cap cost.
- F9. Shareable result link or web preview card, if distribution needs a browser artifact.

**P2 — monetization & retention**
- F10. Stripe + scan limits (free X/day, paid unlimited + dietary profiles).
- F11. Affiliate "buy missing items" links.
- F12. Optional accounts to save favorites.

## 7. UX / screens
1. **Home** — hero, one button, one-line value prop, optional sample-result thumbnail.
2. **Capture** — native camera or photo library; show the photo back with a "use this / retake."
3. **Loading** — playful status messages (mask the few seconds of latency).
4. **Results** — ingredient chips (editable) → 3 recipe cards → snap-again + share.
5. **Recipe detail** — have/need lists, steps, time + servings.

## 8. Technical architecture
- **Client:** SwiftUI iPhone app in `ios/fridge-to-dinner/`.
- **Backend:** Next.js 16 App Router route handlers on Vercel — a small backend-for-frontend API that keeps provider keys server-side.
- **Web root:** minimal backend status page in v1; public web UI can be added later.
- **Camera:** native iOS camera flow with photo library fallback.
- **Image handling:** downscale/compress client-side (e.g. long edge ~1024–1280px), then upload to `/api/analyze` as multipart form data. Fridge photos don't need full resolution and smaller uploads directly cut latency and token cost (see §8.2).
- **AI call:** server-side route calls the OpenAI Responses API with the image + a structured-output schema; returns JSON `{ ingredients[], recipes[] }`. Keeping the key server-side is the reason the analyze step must be an API route, not client-side.
- **State:** none persisted in v1 (stateless). Add KV/Postgres only when you introduce accounts.
- **Rate limiting (P1):** Vercel KV or Upstash, keyed by IP/device, to cap free scans.

### 8.1 AI design (the core of the product)
**One call, structured output.** Send the fridge image + a system prompt to OpenAI's Responses API; force a JSON schema via `text.format` so you get clean, parseable data instead of prose to regex. Use `store: false` to align with the v1 privacy promise. Shape:

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

Vision input is sent from the backend after it receives the downscaled upload from the iOS client. When the user edits chips (F4), re-call `/api/recipes` with the corrected ingredient list as text (no image) — cheaper and faster.

### 8.2 Model choice & per-scan cost
OpenAI vision-capable GPT models and list pricing (input / output per 1M tokens):

| Model | Input | Output | Est. cost/scan* | Best for |
|---|---|---|---|---|
| **gpt-5.4-nano** | $0.20 | $1.25 | **~$0.002** | Cheapest possible free-tier candidate |
| **gpt-5.4-mini** | $0.75 | $4.50 | **~$0.007** | v1 default; quality/cost sweet spot |
| **gpt-5.4** | $2.50 | $15 | **~$0.024** | Quality fallback if mini misses ingredients |
| **gpt-5.5** | $5 | $30 | **~$0.049** | Likely overkill unless quality is the bottleneck |

\*Rough estimate per scan: ~1.6K image tokens (downscaled) + ~0.9K prompt input, ~1.2K output. Real numbers vary — measure with `count_tokens` on representative photos before trusting these.

**Recommendation:** build v1 on **gpt-5.4-mini** — it supports image input, structured JSON output, and should keep scans comfortably below 1¢ at the expected payload size. **A/B against gpt-5.4-nano** on real fridge photos: if nano's ingredient detection and recipe quality hold up, it can cut cost further. Reserve **gpt-5.4** for a paid/quality fallback or for cases where mini misses too many ingredients. (These are your cost-vs-quality dials — worth testing empirically rather than picking blind.)

**Cost levers:** downscale images (§8); keep the prompt compact; use cached input pricing where available once you have steady traffic; cap free scans (F8) so a viral spike can't run up a surprise bill.

## 9. Monetization
Beer-money path, introduced only after people actually use it:
- **Free:** N scans/day per device.
- **Paid (~$5/mo):** unlimited scans + dietary profiles + saved favorites.
- **Later:** affiliate links on "need to buy" items.

Distribution *is* the strategy: short demo videos (the photo→recipes reveal is inherently watchable), posts in cooking/budget communities, and a frictionless shareable link. Build is the easy 20%; getting it seen is the 80%.

## 10. Success metrics
- **Activation:** % of visitors who complete one scan (target the magic moment).
- **Magic-moment quality:** % of scans where the user keeps the AI's ingredients without heavy editing (proxy for recognition accuracy).
- **Repeat:** scans per user in 7 days.
- **Cost:** avg $/scan (must stay well under any future price point).
- **Virality:** share clicks / scans.

## 11. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Vision misreads cluttered/dark fridges | Editable chips (F4); prompt for confidence; guide users to a clearer photo |
| Per-scan cost balloons with traffic | Downscale, cache, rate-limit, cheaper model on free tier |
| Recipes feel generic/bad | Constrain to "use what you have," show have/need split, tune the prompt |
| Built it, nobody comes | Validate via demo videos *before* building monetization |
| Privacy concern over fridge photos | Don't store images in v1; state "processed once, not saved" |

## 12. Roadmap (fits ~10 hrs/week)
- **Milestone 1 — Magic moment (2 weekends):** F1–F3 hardcoded to one model, ugly but working photo→recipes.
- **Milestone 2 — Usable (1–2 weekends):** F4, F5, loading polish, native share/privacy polish (F7), basic rate limit (F8).
- **Milestone 3 — Shareable (1 weekend):** F9 if needed + a couple dietary toggles (F6). **Ship publicly, post the demo.**
- **Milestone 4 — Monetize (only if traction):** F10–F12.

## 13. Open questions
1. Recipe source: fully AI-generated, or AI + a curated recipe DB for reliability?
2. How aggressive is the free-tier limit (cost vs. virality)?
3. Naming + domain.
4. One-photo-at-a-time, or allow fridge + pantry as two shots?
5. When, if ever, should a public web client or result page re-enter scope?
