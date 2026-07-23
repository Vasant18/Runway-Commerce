# CrossBorder Marketplace — Phase 3 Design (Full Journey: Matching → Flight → Middleman → Last-Mile → Ratings)

**Date:** 2026-07-23
**Status:** Approved for implementation
**Directory:** `/Users/vpujar/Runway-commerce` · **Branch:** `phase-3` (off `phase-2`, local only, no PR)

---

## Context

Phase 2 ended at "post & browse." Phase 3 makes the entire marketplace loop work as a
platform experience, modeled on real e-commerce order lifecycles (Amazon-style staged
tracking: placed → shipped → out for delivery → delivered) and P2P shopping (Grabr):

1. Traveler **offers to carry** a buyer's request on one of their trips.
2. Buyer **accepts** → Order created, fees computed, escrow awaits deposit.
3. Buyer **deposits** → escrow HELD.
4. Traveler **purchases** the item (following the buyer's detailed instructions —
   exact product spec and where to buy it, online store URL or offline store+location),
   **boards** a (synthetic) flight — airline, flight number, aircraft, airports — and
   **lands** at the destination.
5. From landing, **the platform is the middleman**: parcel received at our hub →
   a **local delivery partner** is assigned (BlueDart/Dunzo/DHL/FedEx/Lalamove/Sendle,
   synthetic) with a **delivery fee** and tracking code → out for delivery to the
   buyer's address → OTP-confirmed delivery.
6. Buyer **confirms** → escrow RELEASED → both sides **rate** each other.
7. Real seeded ratings/reviews feed the **landing testimonials** (replacing the baked
   webp ticket art with DOM boarding-pass cards).

Everything uses **synthetic data**. The UI is a full **app/platform experience** on top
of the existing design system (`.cb-*` components, ink/paper/amber tokens, boarding-pass
motif), with **journey maps**: a branded GSAP-animated SVG world map AND a real Leaflet
(OSM) map on order tracking.

**Locked decisions:** Map = Both · lifecycle via role action buttons + Ops console (no
auto-sim) · OPS role seeded and excluded from public signup · flow through OTP + ratings.

---

## Data model changes (all additive/nullable — safe `db push`)

- `Role` += `OPS` (signup allowlist unchanged: BUYER/TRAVELER/BOTH only).
- `OrderStatus` += `LANDED`, `AT_HUB`, `OUT_FOR_DELIVERY`. Full chain:
  `CREATED → PURCHASED → IN_TRANSIT → LANDED → AT_HUB → OUT_FOR_DELIVERY → DELIVERED → CONFIRMED`.
- `Trip` += `airline?`, `flightNumber?`, `aircraft?`, `departAirport?` (IATA), `arriveAirport?` (IATA).
- `Request` += `deliveryCity?`, `deliveryAddress?`, `quantity Int @default(1)`,
  `purchaseAt String?` (where to buy: online URL or offline store + location — the
  buyer's "detailed instructions" surface; `notes` holds extra detail like size/color).
- `Order` += `deliveryFee Int @default(0)`, `deliveryPartner?`, `deliveryTrackingCode?`,
  `deliveryAddress?`, `deliveryCity?`.

## State machine (`lib/orders.ts`, pure + fully unit-tested)

Declarative `TRANSITIONS`: `{action, from, to, actor, escrowTo?}`:

| action | actor | from → to | side effects |
|---|---|---|---|
| deposit | BUYER | escrow AWAITING_DEPOSIT → HELD | — |
| purchased | TRAVELER | CREATED → PURCHASED | requires escrow HELD |
| boarded | TRAVELER | PURCHASED → IN_TRANSIT | — |
| landed | TRAVELER | IN_TRANSIT → LANDED | — |
| receive_hub | OPS | LANDED → AT_HUB | — |
| assign_courier | OPS | AT_HUB → OUT_FOR_DELIVERY | sets partner, tracking code, 6-digit OTP |
| deliver | OPS | OUT_FOR_DELIVERY → DELIVERED | requires correct OTP |
| confirm | BUYER | DELIVERED → CONFIRMED | escrow HELD → RELEASED |

`canTransition(order, action, actorRole)` / `applyTransition(...)` are pure; the API
route enforces session identity (buyer = order.buyerId, traveler = order.travelerId,
ops = role OPS).

## Synthetic reference data

- **`lib/geo.ts`** — 16 airports `{iata, city, country, lat, lng}` (JFK SFO LHR CDG FRA
  DXB SIN NRT SYD BLR BOM DEL GRU YYZ ICN AMS) + `airportByIata()` +
  `projectToSvg(lat,lng,W,H)` equirectangular projection.
- **`lib/partners.ts`** — delivery partners with country coverage + flat synthetic fee
  tiers; `partnersForCountry(country)`, `estimateDeliveryFee(country)` → minor units.
- **`lib/money.ts`** += `computeOrderTotals({productPrice, travelerReward, deliveryFee})`
  → `{platformFee, totalCost}` (platform fee still 5% of product+reward; delivery fee
  added to the grand total).

## Seed (`prisma/seed.mjs`, idempotent upserts, `npm run db:seed`)

**~100 users** covering every scenario: ~50 buyers + ~50 travelers (+2 BOTH, 1 OPS
`ops@crossborder.local`/`ops12345`; everyone else `demo1234`). Spread across the 16 geo
cities. Personas include: fresh signups with no activity, travelers with upcoming /
active / completed trips, buyers with open requests that have no offers yet, PROPOSED
matches awaiting buyer decision, a DECLINED match, and **orders at every lifecycle
stage** (AWAITING_DEPOSIT, HELD/CREATED, PURCHASED, IN_TRANSIT, LANDED, AT_HUB,
OUT_FOR_DELIVERY, DELIVERED, CONFIRMED+RELEASED), ending with **~10 ratings with real
review comments** — the source of the landing testimonials.

**~35 trips** with full flight details (AI 102 777-300ER JFK→DEL, BA 275 A380 LHR→BLR,
EK 202 A380 DXB→JFK, SQ 317 SIN→LHR, QR 8, UA 48, LH 754, AF 225, JL 4 …).

**~55 requests** across many categories (laptops, phones, cameras, sneakers, watches,
cosmetics, vitamins, games consoles, headphones, baby formula, whisky, books…), each
with: exact spec (brand/model/config/size/qty), **purchaseAt** — online ("Buy at
bhphotovideo.com — link attached") or offline ("Apple Store, 5th Avenue NYC" / "Don
Quijote, Shibuya") — price gap via `localPrice`, delivery city + street address, notes.

## APIs (mirror `signup` route pattern; middleware += `/orders`, `/ops`)

- `POST /api/matches` — traveler proposes `{requestId, tripId}` (must own trip; trip
  UPCOMING; request OPEN; not own request).
- `PATCH /api/matches/[id]` — buyer `{action: accept|decline}`. Accept → Match ACCEPTED,
  Request MATCHED, **Order created** (fees via `computeOrderTotals` +
  `estimateDeliveryFee`, address copied from request, escrow AWAITING_DEPOSIT).
- `POST /api/orders/[id]/advance` — `{action, otp?, partner?}` → state machine + session
  identity checks.
- `POST /api/orders/[id]/rate` — `{stars 1-5, comment?}` when CONFIRMED, once per rater,
  updates ratee's ratingAvg/ratingCount.
- Trips POST + TripForm extended with flight fields (airports from `lib/geo` Selects).

## App experience (all authed pages get `AppNav`)

- **AppNav** — slim boarding-strip header: brand → /dashboard; Dashboard · Trips ·
  Requests · Orders · Ops (OPS only) · Sign out.
- **Dashboard v2** — `WorldMapSvg` hero (user's active journey arcs), stat tiles
  (active orders / in transit / total saved / rating), role CTAs, recent OrderCards,
  own trips/requests.
- **/orders** — my orders (buyer or traveler side), StageChips.
- **/orders/[id]** — centerpiece: boarding-pass header (route, airline/flight/aircraft,
  parties), **OrderTracker** stepper (all stages, done/active/pending), WorldMapSvg +
  **OrderLeafletMap** (OSM tiles, airport/hub/address markers, arc + dashed last-mile),
  full cost breakdown (product/reward/platform fee/**delivery fee**/total + savings),
  buyer's purchase instructions panel (spec, purchaseAt, qty, notes), role-appropriate
  action buttons from the state machine, OTP display for buyer at OUT_FOR_DELIVERY,
  rating form at CONFIRMED.
- **/requests/[id]** — buyer: own request + incoming proposals (traveler + trip/flight)
  Accept/Decline; traveler: request detail + "Offer to carry" (pick my upcoming trip).
- **/trips/[id]** — trip + its proposals/orders.
- **/ops** — OPS console: queues (Landed → Receive at hub · At hub → Assign courier
  (partner Select w/ fee) · Out for delivery → Enter OTP · All active). Non-OPS → nudge.

## Landing refresh (animation-safe)

- **Tickets**: six baked-webp `<img class="pass-art">` → six DOM `.cb-pass-card`
  boarding-pass tickets (same `.pass` wrappers/count/order — the conveyor rig in
  `LandingEffects.tsx` animates `.pass` elements and is untouched). Content = seeded
  users' actual reviews with route stubs, star rows, initials discs, savings figures.
- **Supported** → "Our delivery network": same section/classes, VC logo imgs → partner
  wordmark pills.
- **Copy pass** (text only) on Amenities/Betterway/Boarding/EaModal/Footer: escrow, OTP
  delivery, door-to-door via local partners, live journey map.

## Out of scope

Real payments/Stripe, real flight APIs, real courier APIs, messaging, disputes, KYC
vendors, customs estimation, AI matching (Phases 4–5).

## Verification

Static gates (tsc, vitest, build). Seed idempotent. Full Playwright 3-account loop:
offer → accept → deposit → purchased → boarded → landed → ops hub → courier+fee →
OTP → delivered → confirm → escrow RELEASED → mutual ratings. Maps render (SVG arcs +
Leaflet tiles). /ops gated. Landing conveyor animates with DOM cards; new testimonials
visible; no new console errors.
