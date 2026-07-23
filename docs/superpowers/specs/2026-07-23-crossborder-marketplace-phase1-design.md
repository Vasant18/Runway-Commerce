# CrossBorder Marketplace — Phase 1 Design (Foundation + Marketing Site)

**Date:** 2026-07-23
**Status:** Approved for implementation planning
**Directory:** `/Users/vpujar/Runway-commerce`

---

## Context

`Runway-commerce/plan.md` describes **CrossBorder Marketplace**: a peer-to-peer
marketplace connecting international travelers with buyers who want products that are
significantly cheaper in another country. Travelers already taking a trip buy items on
behalf of buyers and carry them back legally; the platform matches both parties, holds
payment in escrow, verifies identities, and handles trust/ratings. It is explicitly NOT
a traditional inventory-holding e-commerce site — it's a connector (Airbnb/Uber model).

Separately, `~/runway-landing` is a completed, pixel-faithful recreation of runway.com's
Jan-2024 landing page (aviation theme: boarding passes, plane windows, XLS→RNW flight
routes, clouds, "First Class Amenities"). The user wants this landing page's **design and
animations kept identical**, with only the **copy changed** to market CrossBorder
Marketplace, and a **real working app** built behind it.

The aviation theme is a natural metaphor for a travel-powered marketplace, so the re-skin
is a strong conceptual fit.

### Market validation (research)
The model is real and funded: **Grabr** (peer-to-peer international shopping/delivery,
$24.7M raised, 75+ countries), plus **Airfrov**, **Hitchhiker**, and ~99 P2P
international-shipping startups globally. Concept is proven; differentiation will come
later (AI matching, customs estimation — plan.md's long-term vision).

---

## Scope & Decisions (locked)

- **Deliverable:** marketing landing page **+ a real working app** (not a mockup).
- **Stack:** **Next.js (App Router) + TypeScript**, full rebuild. The existing
  `runway-landing` is the design reference; its markup/CSS/JS is **ported** into the
  Next app (design unchanged), not edited in place.
- **Database:** **Postgres via Prisma**.
- **Auth:** **Auth.js (NextAuth v5)** Credentials provider (email + password, bcrypt),
  JWT cookie sessions, Prisma adapter.
- **Payments/escrow:** **simulated** — full escrow lifecycle modeled in the DB (deposit →
  held → released), no real money. Real Stripe Connect deferred to a later phase.

### Why this is decomposed into phases
"Landing + working marketplace" spans many independent subsystems and is too large for one
spec. It is split into sequential phases, each with its own spec → plan → build cycle.
**This document specifies Phase 1 only.**

| Phase | Scope |
|-------|-------|
| **1 (this doc)** | Next.js scaffold; port + re-skin landing at `/`; email/password auth with role selection; **full** Postgres schema; protected empty dashboard shell. |
| 2 | Trips & Requests: travelers post trips, buyers post product requests (price-gap/reward math), list/browse views. |
| 3 | Matching & Orders: matching engine, accept flow, simulated-escrow order lifecycle, status tracking. |
| 4 | Trust layer: messaging, ratings/reputation, OTP delivery confirmation, KYC placeholders, disputes. |
| 5 (later) | Real Stripe Connect escrow, customs/duty estimation, AI matching. |

**Phase 1 done = a visitor can view the marketed site, sign up as buyer/traveler/both,
log in, and land in an (empty) authed dashboard.** Later phases fill the dashboard.

---

## Architecture & Project Structure

Fresh Next.js App Router + TypeScript app in `Runway-commerce/`. `runway-landing` stays
untouched as the reference.

```
Runway-commerce/
  app/
    layout.tsx            # root: PP Mori fonts, global CSS, session provider
    page.tsx              # "/" — ported, re-skinned landing
    (auth)/
      signup/page.tsx     # boarding-pass styled sign-up
      login/page.tsx      # log in
    dashboard/page.tsx    # protected empty authed shell
    api/
      auth/[...nextauth]/route.ts   # Auth.js handler
  components/
    landing/              # Hero, Amenities, Betterway, Tickets, Supported, Takeoff, Boarding, Footer, Header
    ui/                   # Button, Modal, Field
  lib/
    db.ts                 # Prisma client singleton
    auth.ts               # Auth.js config + session helpers
  prisma/
    schema.prisma         # FULL core schema (all entities)
  public/assets/          # fonts, img, video, svg copied from runway-landing
  styles/globals.css      # ported css/style.css + tokens
```

- **Landing port:** each HTML section → a React component in `components/landing/`;
  `css/style.css` → `styles/globals.css` (largely verbatim); GSAP + ScrollTrigger +
  DrawSVGPlugin + CustomEase + three.js init moves into client-side effects
  (`"use client"` components / `useEffect`). Vendored libs from `runway-landing/vendor`
  are installed as npm deps (gsap incl. plugins, three). **Look, layout, and animations
  remain identical — only text changes.**
- **Assets:** fonts/img/video/svg copied into `public/assets/` with the same relative
  paths so CSS/JS references keep working.

---

## Data Model (full core schema — built in Phase 1, most UI in later phases)

Money is stored as **integer minor units** + a `currency` code (never floats).
Phase 1 builds UI only for `User`; the rest are defined now to avoid later migrations.

- **User** — `id`, `email` (unique), `passwordHash`, `fullName`,
  `role` (`BUYER`|`TRAVELER`|`BOTH`), `avatarUrl?`, `homeCountry?`,
  `kycStatus` (`UNVERIFIED`|`PENDING`|`VERIFIED`, default `UNVERIFIED`),
  `ratingAvg` (default 0), `ratingCount` (default 0), `createdAt`.
- **Trip** *(Phase 2 UI)* — `id`, `travelerId→User`, `fromCountry`, `toCountry`,
  `departDate`, `arriveDate`, `luggageCapacityKg?`,
  `status` (`UPCOMING`|`ACTIVE`|`COMPLETED`|`CANCELLED`), `createdAt`.
- **Request** *(Phase 2)* — `id`, `buyerId→User`, `title`, `productUrl?`, `category?`,
  `originCountry`, `destinationCountry`, `productPrice`, `travelerReward`, `currency`,
  `notes?`, `status` (`OPEN`|`MATCHED`|`FULFILLED`|`CANCELLED`), `createdAt`.
- **Match** *(Phase 3)* — `id`, `requestId`, `tripId`,
  `status` (`PROPOSED`|`ACCEPTED`|`DECLINED`), `createdAt`.
- **Order** *(Phase 3, simulated escrow)* — `id`, `matchId`, `buyerId`, `travelerId`,
  `productPrice`, `travelerReward`, `platformFee`, `totalAmount`, `currency`,
  `escrowStatus` (`AWAITING_DEPOSIT`|`HELD`|`RELEASED`|`REFUNDED`),
  `deliveryOtp?`, `status` (`CREATED`|`PURCHASED`|`IN_TRANSIT`|`DELIVERED`|`CONFIRMED`),
  `createdAt`, `updatedAt`.
- **Message** *(Phase 4)* — `id`, `orderId`, `senderId`, `body`, `createdAt`.
- **Rating** *(Phase 4)* — `id`, `orderId`, `raterId`, `rateeId`, `stars` (1–5),
  `comment?`, `createdAt`.

**Relations:** User 1─* Trip / Request; User as buyer/traveler 1─* Order;
Request 1─1 Match 1─1 Order; Order 1─* Message / Rating.
The plan.md example (₹4,00,000 product + ₹15,000 reward + ₹5,000 fee = ₹4,20,000 total;
buyer saves ₹80,000) maps directly onto `Order` fields.

---

## Auth & Session Flow

- **Auth.js (NextAuth v5)**, Credentials provider, `bcrypt` password hashing, JWT cookie
  sessions (no session table), Prisma adapter.
- **Sign-up** (`/signup`): full name, email, password, **role toggle**
  (Buyer / Traveler / Both). Styled with the existing boarding-pass "Get Access" ticket
  card so it feels native. Submit → create `User` (role set, `kycStatus=UNVERIFIED`) →
  auto sign-in → redirect `/dashboard`.
- **Log in** (`/login`): email + password → session → `/dashboard`.
- **Dashboard** (`/dashboard`): protected (redirect to `/login` if unauthenticated).
  Phase 1 shows an authed welcome ("Welcome aboard, {name}") in boarding-pass/sky styling
  with empty placeholders ("Your trips", "Your requests") for later phases.
- **Header wiring:** landing "Get Early Access" → `/signup`; nav "Log In" → `/login`;
  when authenticated, header shows the user's name → `/dashboard`.
- **Validation/errors:** inline field errors (invalid email, weak password, duplicate
  email, wrong credentials). No silent failures.

---

## Copy Re-skin (design identical, text only)

Every section keeps exact layout/animation/styling; only words change.

- **Header nav:** Log In / How it works / Travelers / Contact · button "Get Early Access".
- **Hero:** headline → **"Shop the world. Carried by travelers."**
  Sub → *"CrossBorder connects you with travelers heading your way — get products that
  are cheaper abroad, delivered by real people."* Kicker XLS→RNW kept (reads as a flight
  route). Flipboard logos kept (may become destination cities in a later phase).
- **Amenities accordion:** title kept ("First Class Amenities") or **"Why CrossBorder"**;
  5 panels re-labeled to value props — *Post a request · Match with travelers · Secure
  escrow · Track delivery · Rate & repeat*. Demo videos kept.
- **"Runway is a better way"** → **"A better way to shop across borders."**
  3 checkpoint cards → **"Built for Buyers" / "Built for Travelers" / "Built on Trust,"**
  copy drawn from plan.md value-prop lists (save money / earn on existing trips /
  escrow + KYC + reputation).
- **Tickets (testimonials):** boarding-pass cards kept; quotes swapped to buyer/traveler
  testimonials (buyer saved ₹80,000; traveler earned ₹15,000 on a trip already planned).
- **Supported By / Ready for Takeoff:** "Supported By" kept as press/"As seen in" row;
  Takeoff CTA "Ready for takeoff?" kept → sign-up.
- **Boarding-pass CTA / Early Access modal:** becomes the real **sign-up** entry (wires to
  `/signup`), ticket design kept.
- **Footer:** structure kept; links updated (How it works, Travelers, Buyers,
  Trust & Safety, Contact) + legal line.

No structural or visual changes anywhere — purely text.

---

## Out of Scope (Phase 1)

- Trip/Request/Match/Order/Message/Rating **UI** (later phases).
- Real payments, Stripe, real KYC/identity vendors, customs estimation, AI matching.
- Email verification, password reset, OAuth providers (can be added later).
- Native mobile app.

---

## Verification

- `npm run dev` serves `/` rendering the re-skinned landing with **all original
  animations working** (hero ×7 window zoom, sky cloud-flight, flipboard, betterway
  streams, tickets conveyor, footer) — visually compared against `runway-landing`.
- Sign-up creates a `User` row (correct `role`, hashed password) and redirects to
  `/dashboard`; verify via Prisma Studio / DB query.
- Log out → visiting `/dashboard` redirects to `/login`; log in → reaches `/dashboard`.
- Invalid inputs (bad email, weak password, duplicate email, wrong password) show inline
  errors, no crash.
- `npx prisma migrate` applies the full schema cleanly; all tables/enums present.
- No console errors on the landing route; Lighthouse sanity check on `/`.

---

## Notes

- Runway/Pangram fonts & assets are reused for local study/demo only — not for publishing.
- Local Postgres for dev; hosted Postgres swap-in is a config change (no schema change).
- Each later phase (2–5) gets its own spec in `docs/superpowers/specs/`.
