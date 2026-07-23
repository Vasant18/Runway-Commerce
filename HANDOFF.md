# CrossBorder Marketplace — HANDOFF

**Read this first each session.** Next.js app that re-skins the runway-landing design
into a peer-to-peer cross-border shopping marketplace (travelers carry cheaper-abroad
products for buyers; escrow, KYC, ratings). Concept from `plan.md` (a Grabr-like model).

## Where things stand (2026-07-23)
**Phase 3 COMPLETE** — build, 65 tests, and the full journey verified in-browser end-to-end.
- Branch: **`phase-3`** (off `phase-2`; NOT merged — local-only, no PR). Tag: `phase-3-complete`.
  Earlier tags `phase-1-complete`/`phase-2-complete` still stand.
- **Commit identity:** placeholder `local <local@localhost>`, unsigned, via per-command overrides
  (global git config untouched):
  `git -c user.name="local" -c user.email="local@localhost" -c commit.gpgsign=false commit --no-gpg-sign -m "..."`.
  (Phase 1's commits used a real email — a HANDOFF discrepancy noted then; placeholder from Phase 2 on.)
- **Running:** `PORT=3100 npm run start` → http://localhost:3100 (prod build).
  Postgres via Docker container **`cb-pg` on host port 5434**. Seed: `npm run db:seed` (idempotent).
- To restart: `docker start cb-pg`, then `cd ~/Runway-commerce && npm run build && PORT=3100 npm run start`. Stop: `lsof -ti:3100 | xargs kill`.
- **Two security fixes this session** (both from the automated commit review, both fixed + tested):
  reject non-http(s) `productUrl` (stored-XSS) in the requests API + RequestCard; escape
  user-derived labels in Leaflet popups. `lib/validation.isSafeHttpUrl` is the shared guard.

### Demo accounts (after `npm run db:seed`)
- **Password for all seeded users:** `demo1234`. **Ops:** `ops@crossborder.local` / `ops12345`.
- ~100 users: 50 buyers, 46 travelers, 3 BOTH, 1 OPS. Seed also creates ~37 trips (w/ flight
  details), 41 requests (detailed specs + where-to-buy + delivery address), and orders at EVERY
  lifecycle stage incl. ~4 CONFIRMED+rated (feed nothing directly — landing testimonials are
  hand-authored in `Tickets.tsx` from these personas).
- **Non-seeded manual accounts still exist:** `ollie.p2test@example.com`/`traveler123` (BOTH),
  `bella.buyer@example.com`/`buyerpass123` (BUYER). Ollie has a full CONFIRMED order from the
  Phase 3 E2E run (Sony A7 IV, JFK→DEL, Dunzo delivery, escrow released, rated).

## What Phase 1 delivered
- Next.js 15 App Router + TS. Landing (`runway-landing`) ported VERBATIM into React
  components under `components/landing/` (Header, Hero, Amenities, Betterway, Tickets,
  Supported, Takeoff, Boarding, Footer, EaModal); design/animations unchanged, only COPY
  re-skinned to CrossBorder. Assets copied to `public/assets/`. `app/globals.css` = the
  ported `css/style.css` (font paths rewritten to `/assets/`). Animations (GSAP + three.js
  sky) run from `app/LandingEffects.tsx` (`"use client"`, gsap.context + full unmount
  cleanup: cancelAnimationFrame, listener removal, renderer.dispose).
- Full Prisma schema (`prisma/schema.prisma`): 7 models User/Trip/Request/Match/Order/
  Message/Rating + all enums. Money = Int minor units + currency string. Only `User` has
  UI this phase.
- Auth: Auth.js v5 (`next-auth@5.0.0-beta.25`) Credentials, bcryptjs cost 10, JWT sessions,
  `lib/auth.ts` (has `trustHost: true` — REQUIRED for prod/non-dev host). Signup API
  `app/api/signup/route.ts` (role allowlisted BUYER/TRAVELER/BOTH, 201/400). Pages:
  `/signup`, `/login` (boarding-pass styled, `.cb-*` classes appended to globals.css).
  Protected `/dashboard` (server `auth()` + `middleware.ts` matcher `/dashboard/:path*`).
  Header shows name→/dashboard when authed via `AuthNavLink` client subcomponent.
- Validation `lib/validation.ts` + `lib/hash.ts`, tested with vitest (11 tests pass).

## What Phase 2 delivered (Trips & Requests)
- **Schema:** one additive field `Request.localPrice Int?` (nullable, minor units, same
  currency as `productPrice`) — powers the "you save X" figure. Applied via `npm run db:push`
  (there is NO migrations dir; `prisma db push` is the workflow). No other model changes —
  `Trip`/`Request` were already fully modeled in Phase 1.
- **Money math** `lib/money.ts` (pure, unit-tested): `PLATFORM_FEE_PCT=0.05`,
  `estimatePlatformFee`, `computeTotals` (product+reward+fee=total), `computeSavings`
  (localPrice−total, nullable, may be negative), `formatMoney` (Intl currency, /100),
  `toMinorUnits`/`fromMinorUnits`. Fee base = product+reward. **Imported by BOTH the client
  request-form preview AND the server RequestCard — one source of truth.**
- **Validators** `lib/validation.ts` +`tripError` (countries present & different, valid
  dates, depart not past, arrive≥depart, luggage>0 if given) +`requestError` (title,
  origin≠destination, productPrice>0, reward≥0, localPrice>0 if given, 3-letter currency).
- **API** (both mirror `signup/route.ts`, role-gated, 201/400/401/403):
  `app/api/trips/route.ts` (POST role∈{TRAVELER,BOTH}; GET `?mine=1`=own else browse others'
  UPCOMING) and `app/api/requests/route.ts` (POST role∈{BUYER,BOTH}, converts major→minor
  units; GET `?mine=1` else browse others' OPEN).
- **Pages** (all protected; `middleware.ts` matcher now `/dashboard`,`/trips`,`/requests`):
  `/trips/new` (server role-check → `TripForm.tsx` client, or buyer nudge), `/trips` (browse),
  `/requests/new` (→ `RequestForm.tsx` client with **live cost preview**, or traveler nudge),
  `/requests` (browse), and a **populated `/dashboard`** (own trips+requests, role-aware CTAs).
- **UI** `components/ui/Select.tsx`+`Textarea.tsx` (match `Field.tsx`); `components/app/
  TripCard.tsx`+`RequestCard.tsx`. New `.cb-*` classes appended to `globals.css` (cards grid,
  form rows, `.cb-preview` box, `.cb-cta`/`.ghost`, `.cb-nudge`) — landing classes untouched.
- **Verified in-browser (PORT=3100):** post trip→dashboard list; request form preview showed
  fee $207.50 / total $4,357.50 / "You save $642.50" (product 4000 + reward 150, local 5000,
  USD) → posted→list; DB stored minor units (400000/15000/500000); cross-browse works both
  ways; buyer→`/trips/new` nudge; buyer POST `/api/trips`→403; logged-out POST→401; landing `/`
  still animates, no console errors.

## What Phase 3 delivered (Full journey)
- **Schema v3** (`prisma db push`, no migrations dir): `Role.OPS`; `OrderStatus` +LANDED/AT_HUB/
  OUT_FOR_DELIVERY (chain CREATED→PURCHASED→IN_TRANSIT→LANDED→AT_HUB→OUT_FOR_DELIVERY→DELIVERED
  →CONFIRMED); `Trip` +airline/flightNumber/aircraft/departAirport/arriveAirport; `Request`
  +quantity/purchaseAt/deliveryCity/deliveryAddress; `Order` +deliveryFee/deliveryPartner/
  deliveryTrackingCode/deliveryCity/deliveryAddress.
- **Libs (pure, tested — 65 tests total):** `lib/geo.ts` (16 airports + `airportByIata` +
  `projectToSvg`), `lib/partners.ts` (8 couriers + `partnersForCountry`/`estimateDeliveryFee`),
  `lib/orders.ts` (**the lifecycle state machine** — `TRANSITIONS` table, `canTransition`/
  `applyTransition`, `genOtp`, `STAGE_ORDER`/`STAGE_LABELS`), `lib/money.computeOrderTotals`.
- **APIs:** `matches` POST (traveler offers), `matches/[id]` PATCH (buyer accept→creates Order/
  decline), `orders/[id]/advance` POST (state-machine gated; resolves actor from session vs
  order), `orders/[id]/rate` POST. Trips POST + TripForm carry flight fields; requests carry
  detail fields. `middleware.ts` matcher += `/orders`,`/ops`.
- **App shell/UI:** `AppNav` (server, w/ signOut server-action), `StageChip`, `OrderTracker`
  (Amazon-style itinerary stepper), `OrderCard`. **Maps:** `WorldMapSvg` (branded dot-grid world
  + GSAP-drawn flight arcs + animated plane) on dashboard/order; `OrderLeafletMap` (client-only,
  OSM tiles, no key — airport/hub/dropoff markers + arc + dashed last-mile) on order detail.
- **Pages:** dashboard v2 (map hero + stat tiles + pending-offer alert + recent orders),
  `/orders`, `/orders/[id]` (centerpiece: tracker + both maps + cost breakdown + purchase
  instructions + role action buttons + buyer OTP + rating form), `/requests/[id]` (buyer decides
  offers / traveler offers to carry), `/trips/[id]`, **`/ops`** (OPS-gated queue board: receive
  at hub → assign courier w/ partner Select+fee → OTP delivery).
- **Landing refresh:** `Tickets.tsx` now six DOM `.cb-pass-card` boarding-pass testimonials
  (conveyor rig untouched — still six `.pass` wrappers); `Supported.tsx` → "Our Delivery Network"
  partner pills on the same marquee rig; OTP/hub/last-mile copy pass on Amenities/Betterway.
- **Verified in-browser — the full loop:** traveler(Ethan) offers on buyer(Ollie)'s Sony A7 IV
  request → Ollie accepts (Order created, delivery fee $199, total $4,556.50, "saves $443.50")
  → deposit(escrow HELD) → purchased→boarded→landed → **ops** receive_hub→assign Dunzo (OTP
  466693, tracking CB-…, fee re-quoted) → buyer sees OTP on order page → wrong OTP=400, correct
  OTP→DELIVERED → buyer confirms (escrow **RELEASED**) → rated. Leaflet tiles+markers render;
  SVG arcs render; `/ops` blocked for non-OPS (nudge); landing conveyor animates w/ 6 DOM cards
  + 36 delivery pills; zero console errors (favicon 404 aside).

## Critical gotchas (don't re-learn these)
- **trustHost**: without `trustHost:true` in `lib/auth.ts`, prod (`npm start`) throws
  Auth.js `UntrustedHost` on any non-default host/port. Dev auto-trusts; prod does not.
- **Postgres port 5434** (not 5432). `.env` (gitignored) holds DATABASE_URL + AUTH_SECRET;
  a fresh clone must recreate `.env`.
- **Commits are unsigned** (`--no-gpg-sign`) — the repo's SSH signing key is passphrase-
  locked. Keep using `git -c commit.gpgsign=false ... --no-gpg-sign`. Author identity is a
  placeholder `local@localhost` (user asked: no real email).
- Ported SVG blobs use `dangerouslySetInnerHTML` (static, no user input — intentional).
- Landing animation element ids/classes are load-bearing (`#heroOverlay #ipImgwrap #hoPill
  #skyCanvas .trigger-N .bw-rig .tickets .site-footer #fb1..3 #takeoffWrap .dark-rig
  #skyZone .sky-zone-2 runway-is-better-*` etc.) — NEVER rename when editing landing copy.
- Reference source `~/runway-landing` is READ-ONLY (its own git repo, now on branch
  `commerce-port-reference`; `master` there = finished landing). Copy FROM it, never edit.

## Follow-ups / tech debt (tracked, non-blocking)
- `next@15.1.6` has a CVE — bump when convenient (was plan-pinned).
- **Edge/middleware**: `middleware.ts` imports full `lib/auth` → pulls Prisma+bcrypt into
  the Edge bundle. Works locally; before any real Edge deploy, split into `auth.config.ts`
  (no Credentials/Prisma) for middleware + full `auth.ts` for route handlers.
- `npm audit` transitive vulns from pinned deps. Signup email now trimmed+lowercased.
- Supported section still shows the original VC logos (spec-permitted demo assets).
- Future: if an ADMIN/elevated Role is ever added, EXCLUDE it from the signup allowlist.

## The phase roadmap (each gets its own spec→plan→build)
- **Phase 1 ✅** foundation + marketing + auth + schema + empty dashboard.
- **Phase 2 ✅** Trips & Requests (post trip, post product request w/ price-gap+reward math,
  list/browse, populated dashboard). Matching deliberately deferred to Phase 3.
- **Phase 3 ✅** Full journey: matching (offer→accept), simulated escrow (deposit→held→released),
  flight legs, **platform middleman** (hub→courier assignment+delivery fee→OTP delivery), mutual
  ratings, journey maps, ops console, landing refresh. Fee + delivery fee persist on the `Order`.
- **Phase 4** Trust deepening: in-app messaging, KYC vendor placeholders, disputes/refunds,
  reputation surfacing on profiles. (Ratings + OTP already shipped in Phase 3.)
- **Phase 5** Real Stripe Connect, customs/duty estimation, AI matching.

## Key files
- Phase 1 spec/plan: `docs/superpowers/specs/2026-07-23-crossborder-marketplace-phase1-design.md`,
  `docs/superpowers/plans/2026-07-23-crossborder-phase1.md`
- Phase 2 spec/plan: `docs/superpowers/specs/2026-07-23-crossborder-phase2-design.md`,
  `docs/superpowers/plans/2026-07-23-crossborder-phase2.md`
- Phase 3 spec/plan: `docs/superpowers/specs/2026-07-23-crossborder-phase3-design.md`,
  `docs/superpowers/plans/2026-07-23-crossborder-phase3.md`
- SDD progress ledger (gitignored scratch): `.superpowers/sdd/progress.md` (per-task
  commits + review dispositions — recovery map if context is lost).
- `plan.md` — the original CrossBorder concept brief.

## Verify the app quickly
`cd ~/Runway-commerce && npx tsc --noEmit && npm test && npm run build`  (34 tests pass)
then `docker start cb-pg && PORT=3100 npm run start` → curl localhost:3100/ (hero copy
"Shop the world"), /signup 200, /login 200, /dashboard 307→/login, POST /api/signup 201,
POST /api/trips (logged out) 401, /trips 307→/login. Full flow: log in as a BOTH/BUYER/
TRAVELER account and post/browse trips & requests (see Test accounts above).
