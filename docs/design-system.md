# Fridge to Dinner — Design System

> Mobile-first · bold & playful · photo-in, dinner-out · no login

Extracted from the Claude Design export (`docs/design/Fridge-to-Dinner.dc.html`). This document is the source of truth for the app's visual language. Token values are ready to drop into Tailwind v4 via `docs/design/design-tokens.css`.

---

## 1. Brand & voice

The product has one job: turn a fridge photo into dinner in ~15 seconds, with no account. The design backs that promise with a warm, editorial, food-magazine feel — a serif display face for confidence, a clean grotesk for the UI, and a mono face for small functional labels. Color is bold and appetite-driven (tomato, leaf, amber) over a warm paper background rather than clinical white.

Voice is direct and a little cheeky: headlines like *"Your fridge already knows what's for dinner."* and *"Tonight I'm making…"*, micro-copy like *"Reading your shelves…"* and *"spotting ingredients · 12 found."* Keep copy short, confident, lowercase-friendly, and never corporate.

Design principles:

- **Appetite over sterility.** Warm paper surfaces, food colors, generous serif display type.
- **Mobile-first, thumb-first.** Every primary action is a large pill button reachable at the bottom of the screen.
- **Honest about the machine.** Detected ingredients are always editable; loading and error states are friendly, not apologetic.
- **Playful structure.** Hard offset shadows and rounded cards give a confident, sticker-like physicality.

---

## 2. Color

### Core palette

| Token | Hex | Name | Role |
|---|---|---|---|
| `--color-tomato` | `#E8542E` | Tomato | Primary brand & CTA fill, accents, active states |
| `--color-tomato-deep` | `#C8431F` | Tomato Deep | Pressed/hover for tomato, gradient stop, emphasis text |
| `--color-leaf` | `#2E9E5E` | Leaf | Success, "you have" ingredients, positive confirmation |
| `--color-amber` | `#E5A823` | Amber | Warmth accent, "easy" tags, highlights |
| `--color-ink` | `#1E1B16` | Ink | Primary text, dark surfaces, hard offset shadows |
| `--color-paper` | `#FBF6EE` | Paper | App background |

### Neutrals (warm, paper-based)

| Token | Hex | Role |
|---|---|---|
| `--color-surface` | `#FFFDF9` | Card / elevated surface |
| `--color-ink-90` | `#26221C` | Near-black surface variant |
| `--color-ink-80` | `#2A2620` | Dark surface variant |
| `--color-ink-70` | `#3A352D` | Dark surface / heading on paper |
| `--color-text-muted` | `#7A7164` | Secondary text, mono labels |
| `--color-text-subtle` | `#5C544A` | Tertiary text |

### Tints (status & decoration)

| Token | Hex | Role |
|---|---|---|
| `--color-need-tint` | `#FBE9E2` | "Grab / need to buy" pink fill |
| `--color-need-tint-strong` | `#F6A98F` | Stronger tomato tint |
| `--color-have-tint` | `#E3F3E8` | "You have" leaf tint |
| `--color-have-tint-strong` | `#7DDBA3` | Stronger leaf tint |
| `--color-amber-tint` | `#FBF1DD` | Amber wash |
| `--color-amber-deep` | `#C98A13` | Amber text/border on tint |

### Usage rules

- **Backgrounds** are Paper `#FBF6EE`; cards lift to Surface `#FFFDF9` with a hairline `rgba(30,27,22,.10)` border.
- **Primary CTA** is Tomato fill, Paper/white text, full pill, with a tomato glow shadow (see §5).
- **Have vs. need** is the core semantic pair: Leaf + `have-tint` for ingredients you own, Tomato/`need-tint` for items to buy.
- **Text** defaults to Ink on paper; muted `#7A7164` for meta and mono labels; never pure `#000`.
- Borders and dividers use Ink at low alpha (`rgba(30,27,22,.10–.12)`), not gray.

---

## 3. Typography

Three families, each with a clear job:

| Family | Use | Weights |
|---|---|---|
| **DM Serif Display** | Headlines, display, recipe titles | 400 (regular + italic) |
| **Hanken Grotesk** | Body copy, buttons, all UI | 400 / 500 / 600 / 700 / 800 |
| **DM Mono** | Labels, meta, timers, status — UPPERCASE, tracked | 400 / 500 |

Load (Google Fonts):

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Type scale

Pulled directly from the export. DM Serif Display carries tight line-heights (.96–1.05) and slightly negative tracking for big display moments; the tomato-italic variant is used for emphasis words (*"dinner."*, *"— MVP UI & system"*).

| Role | Family | Size / line-height | Notes |
|---|---|---|---|
| Display XL | DM Serif Display | 50 / .96 | Hero headlines |
| Display L | DM Serif Display | 46 / .96 – 44 | Screen heroes |
| Display M | DM Serif Display | 40 | Page titles |
| Heading L | DM Serif Display | 32–36 / 1.0 | Section heroes |
| Heading M | DM Serif Display | 26–30 / 1.02 | Recipe titles |
| Heading S | DM Serif Display | 22–24 | Card titles |
| Title | DM Serif Display | 19 | Inline titles |
| Body L | Hanken Grotesk | 16 / 1.5 | Lead paragraphs |
| Body | Hanken Grotesk | 15 / 1.5 | Default body |
| Body S | Hanken Grotesk | 14 / 1.4 | Dense UI text |
| Button | Hanken Grotesk 600–700 | 14–16 | Pill labels |
| Label | Hanken Grotesk 500–600 | 11–13 | Chips, tags |
| Mono label | DM Mono 500 | 10–13 | UPPERCASE, `letter-spacing .02–.16em` |

### Mono label convention

Small functional labels (`PALETTE`, `BEST MATCH`, `YOU HAVE · 6`, `GRAB · 1`, `SERVES 2`, `NO LOGIN · ~15 SEC`, `20 MIN`) use DM Mono, uppercase, wide tracking, in `--color-text-muted`. This is the system's signature for "machine/meta" information.

---

## 4. Spacing, radius & layout

**Spacing** follows a soft 4px-ish rhythm; common gaps from the export: `5, 6, 12, 16, 24, 30, 34, 40px`. Use multiples of 4 for new work (4 / 8 / 12 / 16 / 24 / 32 / 40).

**Radius scale** — the system is generously rounded:

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 8px | Small chips, inner elements |
| `--radius-md` | 11–14px | Swatches, tags, inputs |
| `--radius-lg` | 16–18px | Buttons, secondary cards |
| `--radius-xl` | 20–24px | Cards, panels, sheets |
| `--radius-2xl` | 32–42px | Phone frame, large surfaces |
| `--radius-pill` | 999px | Pill buttons, toggles |

**Layout:** mobile-first phone frames (~360px content width). Primary actions are full-width pills anchored low. Cards are Surface on Paper with hairline Ink borders and soft shadows.

---

## 5. Elevation & shadows

Four distinct elevation languages — don't mix them arbitrarily:

| Token | Value | Use |
|---|---|---|
| `--shadow-card` | `0 1px 3px rgba(0,0,0,.05)` | Resting cards |
| `--shadow-float` | `0 2px 4px rgba(0,0,0,.05), 0 44px 70px -42px rgba(30,27,22,.45)` | Phone frame / floating overlays |
| `--shadow-cta` | `0 8px 18px -8px rgba(232,84,46,.7)` | Tomato primary button glow |
| `--shadow-cta-strong` | `0 12px 26px -10px rgba(232,84,46,.75)` | Hovered/large CTA glow |
| `--shadow-hard` | `8px 8px 0 #1E1B16` | Playful offset (sticker) shadow; `7px 7px` variant for smaller elements |

The **hard offset shadow** (solid Ink, no blur) is the playful signature — used on key cards/buttons to give a confident, printed-sticker feel. The **CTA glow** is reserved for the tomato primary action.

### Accent gradient

`linear-gradient(90deg, #E8542E, #E5A823, #E8542E)` — tomato→amber→tomato, used for the scan/progress sweep and shimmer accents.

---

## 6. Components

### Buttons

- **Primary (pill):** Tomato fill, white/Paper text, `--radius-pill`, Hanken 600–700, `--shadow-cta`. E.g. *"Snap your fridge"*, *"Start cooking"*, *"Got it — let's cook"*.
- **Secondary / ghost:** transparent or Surface fill, Ink text, hairline Ink border, pill or `--radius-lg`. E.g. *"Upload a photo instead"*, *"Type ingredients instead"*, *"Retake"*.
- **Hard-shadow button:** Surface fill, Ink border, `--shadow-hard` offset — for emphasis moments.

### Ingredient chips (editable)

The core interactive primitive. Pill-shaped (`--radius-pill`), Surface fill, Ink text, removable (tap to delete). Examples: `Eggs`, `Carrots`, `Rice`. A **suggested chip** (e.g. `Cilantro?`) is shown tentatively (dashed/lighter) and tappable to add. Editing chips re-runs recipe generation.

### Filter toggles

Pill toggles for dietary/time filters: `Under 30 min`, `Vegetarian`. Selected = Ink or Tomato fill; unselected = ghost with Ink border.

### Recipe card

Surface card, `--radius-xl`, hairline border. Contains:
- **Title** in DM Serif Display.
- **Meta row** (DM Mono): `SERVES 2`, `EASY`, time `20 MIN`.
- **"Best match" badge** — small Tomato/mono tag for the top suggestion (`BEST MATCH`).
- **Have / need split:** `YOU HAVE · 6` (Leaf + have-tint) and `GRAB · 1` (Tomato + need-tint), with a `find nearby ›` affordance for items to buy.
- Expands to ingredients + steps; primary `Start cooking` CTA.

### Status / loading

Friendly mono status text over the scan animation: `Scanning`, `spotting ingredients · 12 found`. Uses the tomato→amber gradient sweep (`scanSweep` keyframe) across a phone preview.

### Share card

Result share surface: `Tonight I'm making …` headline, `made with` credit, and actions `Share`, `Copy link`, `Save card`, `More`.

### Animations (from export)

`scanSweep` (vertical scan line), `bob` (gentle float), `shimmer` (loading skeleton), `blink` (status dots), `spin` (spinner). Keep motion subtle and food-friendly.

---

## 7. Screens

The export defines the full MVP flow as 8 screens:

1. **01 · Home** — hero *"Your fridge already knows what's for dinner."*, `Snap your fridge` primary CTA, `NO LOGIN · ~15 SEC` reassurance.
2. **02 · Review photo** — *"Looks good?"*, captured fridge preview, `Use this photo` / `Retake`.
3. **03 · Reading shelves** — loading/scan state, `spotting ingredients · 12 found`.
4. **04 · Results (editable)** — detected ingredient chips (editable), then recipe cards.
5. **05 · Recipe detail** — `Best match`, have/need split, steps, `Start cooking`.
6. **06 · Privacy reassurance** — no-login / photo-not-stored messaging.
7. **07 · Error state** — friendly recovery with `Retake photo` / `Type ingredients instead`.
8. **08 · Share result** — share card with `Share` / `Copy link` / `Save card`.

Reference renders: `docs/design/screenshots/canvas.png` (tokens & components) and `docs/design/screenshots/flow.png` (screen flow).

---

## 8. Implementation notes

- The app uses **Tailwind v4** with `@theme inline`. Import `docs/design/design-tokens.css` (or paste its `@theme` block into `app/globals.css`) to make these tokens available as utilities (`bg-tomato`, `text-ink`, `rounded-pill`, etc.).
- Current `app/globals.css` is still the Next.js default (white/black, Geist) — replacing it with these tokens is the first step to bring the app in line with the design.
- Always pair "have" with Leaf/`have-tint` and "need/grab" with Tomato/`need-tint` for semantic consistency.
- Reserve `--shadow-cta` for the single primary action per screen; reserve `--shadow-hard` for playful emphasis, not every card.
