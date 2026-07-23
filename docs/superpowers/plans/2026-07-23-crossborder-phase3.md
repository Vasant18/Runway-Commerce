# CrossBorder Marketplace — Phase 3 Implementation Plan

> **For agentic workers:** execute task-by-task with per-task commits
> (`git -c user.name="local" -c user.email="local@localhost" -c commit.gpgsign=false commit --no-gpg-sign`).
> Spec: `docs/superpowers/specs/2026-07-23-crossborder-phase3-design.md`.

**Goal:** the full loop — offer → accept → escrow → purchase (per buyer's detailed
instructions) → flight (airline/flight/aircraft) → landed → platform middleman (hub →
courier assignment + delivery fee → OTP delivery) → confirm → escrow release → mutual
ratings → landing testimonials. ~100 seeded users covering every scenario. Journey maps
(branded SVG + Leaflet). Ops console. Landing refresh.

## Global constraints
- Reuse Phase 1/2 primitives: `lib/db.ts`, `auth()`, `lib/money.ts`, `lib/validation.ts`
  shape (`string | null`), `Field/Select/Textarea`, `.cb-*` tokens, API route pattern of
  `app/api/signup/route.ts`.
- Money = Int minor units. Landing animation ids/classes are load-bearing — inner
  content of `.pass` may change, wrappers/ids may not.
- New dep: `leaflet` + `@types/leaflet` ONLY.
- DB: `npm run db:push`; seed via `node prisma/seed.mjs` (`npm run db:seed`).

## Task order
1. **Schema v3** — Role.OPS; OrderStatus += LANDED/AT_HUB/OUT_FOR_DELIVERY; Trip flight
   fields; Request deliveryCity/deliveryAddress/quantity/purchaseAt; Order deliveryFee/
   deliveryPartner/deliveryTrackingCode/deliveryAddress/deliveryCity. Push. Commit.
2. **Libs (TDD)** — `lib/geo.ts` (16 airports, `airportByIata`, `projectToSvg`);
   `lib/partners.ts` (partners, `partnersForCountry`, `estimateDeliveryFee`);
   `lib/orders.ts` (TRANSITIONS table + `canTransition`/`applyTransition` + `genOtp`);
   `lib/money.ts` += `computeOrderTotals`. Tests: every legal/illegal transition, fee
   math, projection bounds. Commit.
3. **Seed** — `prisma/seed.mjs` (idempotent): ~50 buyers, ~50 travelers, 2 BOTH, 1 OPS;
   ~35 trips w/ flights; ~55 requests w/ detailed specs + purchaseAt (online URL /
   offline store) + delivery addresses; matches PROPOSED/DECLINED; ~9 orders one per
   stage; ~10 ratings w/ comments. `db:seed` script in package.json. Commit.
4. **APIs** — matches POST, matches/[id] PATCH (accept creates Order w/ fees), orders/
   [id]/advance POST (state machine), orders/[id]/rate POST, trips POST + validation +
   TripForm flight fields, middleware matcher += /orders /ops. Commit.
5. **Shell/UI** — AppNav, StageChip, OrderTracker, OrderCard + CSS. Commit.
6. **Maps** — WorldMapSvg (GSAP arcs over branded SVG), OrderLeafletMap (client-only,
   OSM). `npm i leaflet @types/leaflet`. Commit.
7. **Pages** — dashboard v2, /orders, /orders/[id], /requests/[id], /trips/[id], /ops.
   Wire cards with hrefs. Commit per page group.
8. **Landing refresh** — DOM testimonial passes from seeded reviews, delivery-network
   pills, copy pass. Commit.
9. **E2E + docs** — gates green; Playwright full loop (3 accounts + ops); HANDOFF;
   tag `phase-3-complete`.

## Verification
`npx tsc --noEmit && npm test && npm run build`; `npm run db:seed` twice (idempotent);
browser loop per spec §Verification; landing conveyor + maps visual check; no new
console errors.
