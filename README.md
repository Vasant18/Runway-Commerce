# Runway Commerce — CrossBorder Marketplace

A peer-to-peer **cross-border shopping marketplace**: travellers carry products that are
cheaper abroad back to buyers, earning a reward for luggage space they're already
flying with. The platform matches buyers with travellers, holds payment in simulated
escrow, and tracks the order from purchase to doorstep — a Grabr-style model.

The marketing site reuses the aviation-themed [Runway landing-page](https://github.com/Vasant18/Runway)
design (boarding passes, plane windows, flight routes, clouds) — a natural fit for a
travel-powered marketplace — with the copy re-skinned for CrossBorder.

## Features

**Marketing & auth**
- Fully animated landing page (WebGL sky, hero fly-through, flip-board, stream paths),
  ported into React components with the design kept identical and copy re-skinned.
- Email/password auth (Auth.js v5, JWT, bcrypt) with Buyer / Traveller / Both roles.

**The marketplace journey**
- Travellers post **trips** (route, dates, flight details, luggage capacity).
- Buyers post **requests** (product, where it's cheaper, target price, reward, delivery
  address) with a **live cost preview** — product + reward + platform fee, and the
  savings vs. buying locally.
- **Matching**: travellers offer on requests; buyers accept, creating an **order**.
- **Order lifecycle** state machine: `CREATED → PURCHASED → IN_TRANSIT → LANDED →
  AT_HUB → OUT_FOR_DELIVERY → DELIVERED → CONFIRMED`, with simulated escrow
  (deposit → held → released) and OTP delivery confirmation.
- **Live tracking**: an Amazon-style itinerary stepper, a branded SVG world map with
  GSAP-drawn flight arcs, and a Leaflet map (OSM tiles) showing airport → hub → last-mile
  delivery. Ratings on completed orders.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + React 18
- **PostgreSQL** via **Prisma** (models: User, Trip, Request, Match, Order, Message,
  Rating; money stored as integer minor units)
- **Auth.js v5** (credentials, JWT sessions)
- **GSAP** + **three.js** (ported landing animations), **Leaflet** (order maps)
- **Vitest** (unit tests for money math, validation, geo, order state machine, hashing)

## Getting started

```bash
# 1. Postgres (Docker)
docker run --name cb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crossborder \
  -p 5434:5432 -d postgres:16

# 2. Env
cp .env.example .env        # then fill DATABASE_URL + AUTH_SECRET

# 3. Install, schema, seed
npm install
npm run db:push
npm run db:seed             # demo data: ~100 users, trips, requests, orders

# 4. Run
npm run dev                 # http://localhost:3000
```

### Demo accounts (after seeding)
All seeded users share the password **`demo1234`**. See `HANDOFF.md` for specific
buyer / traveller / ops logins and the full data breakdown.

## Environment

`.env` (gitignored) needs:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5434/crossborder?schema=public"
AUTH_SECRET="<generate: openssl rand -base64 32>"
```

## Project status

Built in phases (each with its own spec + plan under `docs/superpowers/`):
Phase 1 foundation + auth · Phase 2 trips & requests · Phase 3 full order journey.
Escrow is **simulated** (no real money moves); Stripe Connect, KYC, and AI matching
are future phases. `HANDOFF.md` has the complete state and architecture.

## Disclaimer

Educational project. The landing design and bundled fonts/imagery derive from a
recreation of runway.com and are the property of their respective owners — included for
study only. Not affiliated with runway.com. "CrossBorder Marketplace" is a fictional
concept for this build.
