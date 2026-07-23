# CrossBorder Marketplace — Phase 2 Design (Trips & Requests)

**Date:** 2026-07-23
**Status:** Approved for implementation planning
**Directory:** `/Users/vpujar/Runway-commerce`
**Branch:** `phase-2` (off `phase-1`; no merge/PR — local build-on-top)

---

## Context

Phase 1 delivered the foundation: a re-skinned marketing landing page, email/password
auth with role selection (BUYER / TRAVELER / BOTH), the **full** Prisma schema (all 7
models), and a protected but **empty** dashboard shell. See
`docs/superpowers/specs/2026-07-23-crossborder-marketplace-phase1-design.md`.

Phase 2 makes the marketplace usable for the first time. Per `plan.md`, the core loop
begins with two actions: **a traveler registers an upcoming trip**, and **a buyer posts a
product request** (with the price-gap / reward math that is the product's whole value
proposition). This phase builds both, plus the **browse** views where each side discovers
the other's postings, and it **fills the dashboard** with the signed-in user's own trips
and requests.

Matching, accept/decline, and the simulated-escrow order lifecycle remain **Phase 3** —
this phase deliberately stops at "both sides can post and browse."

**Key enabler:** the schema already models `Trip` and `Request` completely (built in
Phase 1 to avoid later migrations). Phase 2 is therefore overwhelmingly **UI + API on top
of existing models**. The only schema change is one optional field.

---

## Scope & Decisions (locked)

- **Branch/commits:** build on `phase-2` off `phase-1`; **no merge, no PR** (local only).
  Commits authored as placeholder `local <local@localhost>`, unsigned (`--no-gpg-sign`)
  via per-command `-c` overrides. (Note: Phase 1 commits were actually authored with a
  real email despite the HANDOFF's claim; Phase 2 uses the placeholder going forward.)
- **Savings figure:** add optional **`Request.localPrice`** (Int, minor units, same
  currency as `productPrice`) — what the item costs the buyer at home. Savings =
  `localPrice − totalCost`. This is the one schema change.
- **Platform fee:** a **`PLATFORM_FEE_PCT` constant** (5%) in `lib/money.ts`, computed and
  displayed live on the request form and cards. **Not persisted** in Phase 2 — the fee
  first lands in the DB on the `Order` when escrow is created (Phase 3).
- **Breadth:** full CRUD-lite (create + list) for trips and requests, **cross-browse**
  (travelers see open requests, buyers see upcoming trips), and a **populated dashboard**.
  No matching, no edit/delete of postings yet (deferred; postings are create + view).

### Money convention (unchanged from Phase 1)
Money is **integer minor units** + a `currency` code, never floats. Forms collect major
units (e.g. rupees/dollars) and convert ×100 on write; display divides back on read via
`Intl.NumberFormat`.

---

## Data Model change

Single additive, nullable field — safe `prisma db push`, no data migration:

```prisma
model Request {
  // ...existing fields...
  localPrice  Int?   // buyer's local/retail price in minor units, same currency; optional
}
```

All other Phase 2 behavior uses existing `Trip` and `Request` fields:
- **Trip**: `travelerId`, `fromCountry`, `toCountry`, `departDate`, `arriveDate`,
  `luggageCapacityKg?`, `status` (default `UPCOMING`).
- **Request**: `buyerId`, `title`, `productUrl?`, `category?`, `originCountry`,
  `destinationCountry`, `productPrice`, `travelerReward`, `currency`, `notes?`,
  `status` (default `OPEN`), plus new `localPrice?`.

---

## Cost / Savings math (`lib/money.ts`, pure + unit-tested)

Fee base = `productPrice + travelerReward`. Mirrors the `plan.md` worked example
(₹4,00,000 product + ₹15,000 reward, 5% ≈ but example uses flat ₹5,000; we use % and
document the difference — the example is illustrative, the constant is the rule).

- `PLATFORM_FEE_PCT = 0.05`
- `estimatePlatformFee(productPrice, travelerReward)` → `Math.round((productPrice +
  travelerReward) * PLATFORM_FEE_PCT)` (Int minor units).
- `computeTotals({ productPrice, travelerReward })` → `{ platformFee, totalCost }` where
  `totalCost = productPrice + travelerReward + platformFee`.
- `computeSavings(localPrice, totalCost)` → `localPrice != null ? localPrice - totalCost
  : null` (may be negative — the UI shows "you save" only when > 0, else a neutral note).
- `formatMoney(minorUnits, currency)` → `Intl.NumberFormat` (currency style), dividing /100.
- `toMinorUnits(major)` / `fromMinorUnits(minor)`.

The same module is imported by the request form (client) for the **live preview** and by
the `RequestCard` (server) for display — one source of truth.

---

## Validation (`lib/validation.ts`, extended; same shape as `signupError`)

Return `string | null` (first error message or null), matching the Phase 1 helper style.

- **`tripError(input)`**: `fromCountry` & `toCountry` required and different; `departDate`
  & `arriveDate` valid dates; `arriveDate ≥ departDate`; `departDate` not in the past;
  `luggageCapacityKg` optional but > 0 if given.
- **`requestError(input)`**: `title` required; `originCountry` & `destinationCountry`
  required and different; `productPrice` > 0; `travelerReward` ≥ 0; `localPrice` optional
  but > 0 if given; `currency` a 3-letter code. (Numeric inputs are major-unit numbers at
  the validation boundary; conversion to minor units happens in the route after validation.)

Tests extend `lib/validation.test.ts`; `lib/money.test.ts` is new. All green.

---

## API routes (auth + role gating; mirror `app/api/signup/route.ts`)

Both return JSON with status codes: **201** created, **400** validation, **401**
unauthenticated, **403** wrong role.

- **`app/api/trips/route.ts`**
  - `POST`: `auth()` required (else 401); role ∈ {TRAVELER, BOTH} (else 403);
    `tripError` (else 400); create `Trip` with `travelerId = session.user.id`,
    `status = UPCOMING`. → `{ id }`, 201.
  - `GET`: `?mine=1` → caller's own trips (any status), newest first; default → browse
    **others'** `UPCOMING` trips (exclude caller), newest first.
- **`app/api/requests/route.ts`**
  - `POST`: role ∈ {BUYER, BOTH}; `requestError`; convert major→minor units; create
    `Request` with `buyerId = session.user.id`, `status = OPEN`. → `{ id }`, 201.
  - `GET`: `?mine=1` → caller's own requests; default → browse **others'** `OPEN`
    requests (exclude caller), newest first.

Page reads (dashboard, browse) query Prisma **directly in server components** (Phase 1
dashboard pattern) — the `GET` handlers exist for parity/testing and future client use.

---

## Pages (all protected)

`middleware.ts` matcher extends to `["/dashboard/:path*", "/trips/:path*",
"/requests/:path*"]`.

- **`/trips/new`** — client form (mirrors `/signup`): from/to country, depart/arrive
  dates, optional luggage kg. Buyers (role BUYER) see a gentle nudge instead of the form
  ("You're registered as a buyer — post a request instead"), with a link to `/requests/new`.
  Submit → `POST /api/trips` → on 201 redirect `/dashboard`.
- **`/trips`** — server component: browse other users' upcoming trips as `TripCard`s.
  Empty state when none.
- **`/requests/new`** — client form with a **live cost preview** box: as the buyer types
  productPrice / travelerReward / (optional) localPrice, show product + reward + estimated
  fee = **total cost**, and **"you save X"** when localPrice implies positive savings.
  Fields: title, optional productUrl, optional category, origin/destination country,
  productPrice, travelerReward, optional localPrice, currency (default from a small list),
  optional notes. Travelers see a nudge to `/trips/new`. Submit → `POST /api/requests` →
  redirect `/dashboard`.
- **`/requests`** — server component: browse other users' open requests as `RequestCard`s
  (each showing fee/total and savings). Empty state when none.
- **`/dashboard`** — replaces the Phase 1 placeholders with real data for
  `session.user.id`: "Your trips" and "Your requests" lists (or empty states with CTAs to
  the `/new` forms), plus links into `/trips` and `/requests` browse. CTAs are role-aware
  (a buyer sees "Post a request" prominently; a traveler sees "Post a trip"; BOTH sees
  both).

---

## Reusable UI + CSS

- **`components/ui/Select.tsx`**, **`components/ui/Textarea.tsx`** — same wrapper shape as
  the existing `Field.tsx` (label + control, `.cb-field*` classes).
- **`components/app/TripCard.tsx`** — route (from → to), dates, luggage, traveler name.
- **`components/app/RequestCard.tsx`** — title, origin → destination, product/reward/fee/
  total via `lib/money`, savings badge when positive, buyer name, category/link if present.
- New `.cb-*` classes appended to `app/globals.css` for the form layouts, the card grids,
  and the cost-preview box — using existing tokens (`--ink --paper --amber --grey
  --orange --radius-* --pad --font`). **Landing animation ids/classes are never touched.**

---

## Out of Scope (Phase 2)

- Matching engine, match proposals, accept/decline (Phase 3).
- Orders, simulated escrow, OTP, status tracking (Phase 3).
- Messaging, ratings, KYC, disputes (Phase 4).
- Editing or deleting a posted trip/request (create + view only this phase).
- Real payments, customs/duty estimation, AI matching (Phase 5).
- Persisting the platform fee (lands on `Order` in Phase 3).

---

## Verification

- `npx tsc --noEmit && npm test && npm run build` all green; new `money`/`validation`
  tests pass.
- `npm run db:push` applies `localPrice` cleanly against `cb-pg` (port 5434).
- Browser (PORT=3100), signed in as a **BOTH/TRAVELER** user: post a trip → it appears in
  the dashboard "Your trips" and (for a different buyer account) in `/trips` browse.
- Signed in as **BOTH/BUYER**: post a request → the live preview shows
  product + reward + fee = total and "you save X" (when localPrice set) → it appears in
  "Your requests" and in `/requests` browse for a traveler account.
- **Role gating:** a BUYER hitting `/trips/new` sees the nudge (no form); `POST /api/trips`
  as a buyer → 403; any POST while logged out → 401.
- No new console errors; landing route `/` unchanged (animations intact).

---

## Notes

- Phase 3 will add Match/Order UI on top of these postings; Request/Trip `status` values
  already anticipate that flow (`OPEN`→`MATCHED`, `UPCOMING`→`ACTIVE`).
- Countries are free-text in Phase 2 (a fixed picker can come later); validation only
  enforces "present and different," not membership in a country list.
