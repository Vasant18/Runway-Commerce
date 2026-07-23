# CrossBorder Marketplace — HANDOFF

**Read this first each session.** Next.js app that re-skins the runway-landing design
into a peer-to-peer cross-border shopping marketplace (travelers carry cheaper-abroad
products for buyers; escrow, KYC, ratings). Concept from `plan.md` (a Grabr-like model).

## Where things stand (2026-07-23)
**Phase 1 COMPLETE** — build, tests, and a running app all green.
- Branch: **`phase-1`** (NOT yet merged to `master`). Tag: `phase-1-complete` @ commit `e0302e0`.
- 20 commits on `phase-1`; `master` has only the spec+plan (2 commits). Merge is the
  user's pending choice (they said "merge to master locally, no push" — offer again).
- **Running now:** `PORT=3100 npm run start` → http://localhost:3100 (prod build).
  Postgres via Docker container **`cb-pg` on host port 5434** (5432 was occupied).
- To restart: ensure `docker start cb-pg`, then `cd ~/Runway-commerce && npm run build && PORT=3100 npm run start`. Stop: `lsof -ti:3100 | xargs kill`.

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
- **Phase 2** Trips & Requests (post trip, post product request w/ price-gap+reward math,
  list/browse). Dashboard gets real content here.
- **Phase 3** Matching & Orders + simulated escrow lifecycle (deposit→held→released).
- **Phase 4** Trust: messaging, ratings/reputation, OTP delivery, KYC placeholders, disputes.
- **Phase 5** Real Stripe Connect, customs/duty estimation, AI matching.

## Key files
- Design spec: `docs/superpowers/specs/2026-07-23-crossborder-marketplace-phase1-design.md`
- Impl plan: `docs/superpowers/plans/2026-07-23-crossborder-phase1.md`
- SDD progress ledger (gitignored scratch): `.superpowers/sdd/progress.md` (per-task
  commits + review dispositions — recovery map if context is lost).
- `plan.md` — the original CrossBorder concept brief.

## Verify the app quickly
`cd ~/Runway-commerce && npx tsc --noEmit && npm test && npm run build`
then `docker start cb-pg && PORT=3100 npm run start` → curl localhost:3100/ (hero copy
"Shop the world"), /signup 200, /login 200, /dashboard 307→/login, POST /api/signup 201.
