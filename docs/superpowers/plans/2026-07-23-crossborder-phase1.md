# CrossBorder Marketplace — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a Next.js app that serves the runway-landing design (ported verbatim, re-skinned for CrossBorder Marketplace) at `/`, with email/password auth (buyer/traveler/both roles), the full Postgres schema, and a protected empty dashboard.

**Architecture:** Next.js App Router + TypeScript. The existing `/Users/vpujar/runway-landing` static site is copied into the app **unchanged in look** — its `index.html` becomes a React component tree, `css/style.css` becomes a global stylesheet, and its GSAP/three.js init (`js/main.js`, `js/sky.js`) runs from a single client-side effect. Only text strings change. Data lives in Postgres via Prisma; Auth.js v5 (Credentials) handles sessions.

**Tech Stack:** Next.js 15 (App Router), TypeScript, React 18, Prisma + PostgreSQL, Auth.js v5 (`next-auth@beta`), bcryptjs, GSAP (+ScrollTrigger, DrawSVGPlugin, CustomEase), three.js.

## Global Constraints

- Project root: `/Users/vpujar/Runway-commerce`. Do NOT modify `/Users/vpujar/runway-landing` (read-only reference; copy files out of it).
- Design/animation parity is mandatory: ported markup, CSS class names, element IDs, and asset paths stay byte-identical except for user-visible copy text. Animation JS keys off IDs like `#heroOverlay`, `#ipImgwrap`, `#hoPill`, `#fb1..3`, `.trigger-N`, `.bw-rig`, `.tickets`, `.site-footer` — do not rename them.
- Money: integer **minor units** + `currency` string. Never floats.
- Roles enum: `BUYER | TRAVELER | BOTH`. kycStatus enum: `UNVERIFIED | PENDING | VERIFIED` (default `UNVERIFIED`).
- Passwords: hash with `bcryptjs` (cost 10). Never store plaintext.
- Auth sessions: JWT strategy (no session table).
- Node ≥ 18.18. Package manager: `npm`.
- Commit after every task. Use conventional-commit messages.

---

## File Structure

```
Runway-commerce/
  package.json, tsconfig.json, next.config.mjs, .env, .gitignore
  prisma/schema.prisma
  lib/db.ts                      # Prisma singleton
  lib/auth.ts                    # Auth.js config (exports handlers, auth, signIn, signOut)
  lib/validation.ts             # email/password/signup validators
  types/next-auth.d.ts          # session/user type augmentation
  middleware.ts                 # protect /dashboard
  app/
    layout.tsx                  # fonts, globals.css, SessionProvider
    globals.css                 # ported css/style.css + @font-face
    page.tsx                    # "/" assembles landing sections (server component)
    providers.tsx               # "use client" SessionProvider wrapper
    LandingEffects.tsx          # "use client" — runs ported GSAP/three init
    signup/page.tsx
    login/page.tsx
    dashboard/page.tsx          # protected shell
    api/auth/[...nextauth]/route.ts
    api/signup/route.ts         # POST create user
  components/landing/
    Header.tsx Hero.tsx Amenities.tsx Betterway.tsx Tickets.tsx
    Supported.tsx Takeoff.tsx Boarding.tsx Footer.tsx EaModal.tsx
  components/ui/Field.tsx
  public/assets/                # fonts, img, video, svg copied from runway-landing
  public/vendor/                # (only if a lib isn't on npm; prefer npm)
```

**Porting strategy (applies to every landing component task):** open the matching section of `/Users/vpujar/runway-landing/index.html`, copy the markup into the component's `return(...)`, convert HTML attrs to JSX (`class`→`className`, `for`→`htmlFor`, inline `style="..."`→`style={{...}}` or keep as string via `dangerouslySetInnerHTML` for the big inline-SVG blocks), keep every `id`/`className`/asset path, and change only the copy text per the spec's re-skin table.

---

### Task 1: Scaffold Next.js app + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore`, `app/layout.tsx`, `app/page.tsx` (temporary), `app/globals.css` (temporary empty)

**Interfaces:**
- Produces: a runnable Next.js app; `npm run dev` serves `/`.

- [ ] **Step 1: Create package.json**

```json
{
  "name": "runway-commerce",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "15.1.6",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "gsap": "3.13.0",
    "three": "0.160.0"
  },
  "devDependencies": {
    "typescript": "5.7.3",
    "@types/node": "20.17.16",
    "@types/react": "18.3.18",
    "@types/react-dom": "18.3.5"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create next.config.mjs and .gitignore**

`next.config.mjs`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = { reactStrictMode: true };
export default nextConfig;
```

`.gitignore`:
```
node_modules/
.next/
.env
*.log
.DS_Store
```

- [ ] **Step 4: Create minimal app/layout.tsx, app/page.tsx, app/globals.css**

`app/globals.css`: empty file (real CSS lands in Task 4).

`app/layout.tsx`:
```tsx
import "./globals.css";
export const metadata = { title: "CrossBorder Marketplace" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`app/page.tsx`:
```tsx
export default function Home() {
  return <main>CrossBorder — scaffold OK</main>;
}
```

- [ ] **Step 5: Install and run**

Run: `cd /Users/vpujar/Runway-commerce && npm install && npm run dev`
Expected: dev server on `http://localhost:3000`; visiting `/` shows "CrossBorder — scaffold OK". Stop the server (Ctrl-C) after confirming.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Next.js app"
```

---

### Task 2: Prisma + full schema + DB client

**Files:**
- Create: `prisma/schema.prisma`, `lib/db.ts`, `.env`
- Modify: `package.json` (add prisma deps + scripts)

**Interfaces:**
- Produces: `import prisma from "@/lib/db"` — a `PrismaClient` singleton. Models: `User, Trip, Request, Match, Order, Message, Rating` with enums `Role, KycStatus, TripStatus, RequestStatus, MatchStatus, EscrowStatus, OrderStatus`.

- [ ] **Step 1: Add Prisma deps and scripts to package.json**

Add to `dependencies`: `"@prisma/client": "6.3.1"`. Add to `devDependencies`: `"prisma": "6.3.1"`. Add to `scripts`: `"db:push": "prisma db push"`, `"db:studio": "prisma studio"`. Run `npm install`.

- [ ] **Step 2: Create .env**

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/crossborder?schema=public"
AUTH_SECRET="dev-secret-change-me-0123456789abcdef"
```
(Assumes a local Postgres. If none is running: `createdb crossborder` or run Postgres via Docker `docker run --name cb-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crossborder -p 5432:5432 -d postgres:16`.)

- [ ] **Step 3: Write prisma/schema.prisma (full core schema)**

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Role { BUYER TRAVELER BOTH }
enum KycStatus { UNVERIFIED PENDING VERIFIED }
enum TripStatus { UPCOMING ACTIVE COMPLETED CANCELLED }
enum RequestStatus { OPEN MATCHED FULFILLED CANCELLED }
enum MatchStatus { PROPOSED ACCEPTED DECLINED }
enum EscrowStatus { AWAITING_DEPOSIT HELD RELEASED REFUNDED }
enum OrderStatus { CREATED PURCHASED IN_TRANSIT DELIVERED CONFIRMED }

model User {
  id           String    @id @default(cuid())
  email        String    @unique
  passwordHash String
  fullName     String
  role         Role
  avatarUrl    String?
  homeCountry  String?
  kycStatus    KycStatus @default(UNVERIFIED)
  ratingAvg    Float     @default(0)
  ratingCount  Int       @default(0)
  createdAt    DateTime  @default(now())

  trips        Trip[]
  requests     Request[]
  buyerOrders  Order[]   @relation("BuyerOrders")
  travelerOrders Order[] @relation("TravelerOrders")
  messages     Message[]
  ratingsGiven Rating[]  @relation("RatingsGiven")
  ratingsRecv  Rating[]  @relation("RatingsReceived")
}

model Trip {
  id               String     @id @default(cuid())
  travelerId       String
  traveler         User       @relation(fields: [travelerId], references: [id])
  fromCountry      String
  toCountry        String
  departDate       DateTime
  arriveDate       DateTime
  luggageCapacityKg Float?
  status           TripStatus @default(UPCOMING)
  createdAt        DateTime   @default(now())
  matches          Match[]
}

model Request {
  id                 String        @id @default(cuid())
  buyerId            String
  buyer              User          @relation(fields: [buyerId], references: [id])
  title              String
  productUrl         String?
  category           String?
  originCountry      String
  destinationCountry String
  productPrice       Int
  travelerReward     Int
  currency           String
  notes              String?
  status             RequestStatus @default(OPEN)
  createdAt          DateTime      @default(now())
  match              Match?
}

model Match {
  id        String      @id @default(cuid())
  requestId String      @unique
  request   Request     @relation(fields: [requestId], references: [id])
  tripId    String
  trip      Trip        @relation(fields: [tripId], references: [id])
  status    MatchStatus @default(PROPOSED)
  createdAt DateTime    @default(now())
  order     Order?
}

model Order {
  id             String       @id @default(cuid())
  matchId        String       @unique
  match          Match        @relation(fields: [matchId], references: [id])
  buyerId        String
  buyer          User         @relation("BuyerOrders", fields: [buyerId], references: [id])
  travelerId     String
  traveler       User         @relation("TravelerOrders", fields: [travelerId], references: [id])
  productPrice   Int
  travelerReward Int
  platformFee    Int
  totalAmount    Int
  currency       String
  escrowStatus   EscrowStatus @default(AWAITING_DEPOSIT)
  deliveryOtp    String?
  status         OrderStatus  @default(CREATED)
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  messages       Message[]
  ratings        Rating[]
}

model Message {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  senderId  String
  sender    User     @relation(fields: [senderId], references: [id])
  body      String
  createdAt DateTime @default(now())
}

model Rating {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  raterId   String
  rater     User     @relation("RatingsGiven", fields: [raterId], references: [id])
  rateeId   String
  ratee     User     @relation("RatingsReceived", fields: [rateeId], references: [id])
  stars     Int
  comment   String?
  createdAt DateTime @default(now())
}
```

- [ ] **Step 4: Create lib/db.ts**

```ts
import { PrismaClient } from "@prisma/client";
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export default prisma;
```

- [ ] **Step 5: Push schema and verify**

Run: `npm run db:push`
Expected: "Your database is now in sync with your Prisma schema." Then `npx prisma studio` (opens :5555) and confirm all 7 tables exist. Stop studio after.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add full Prisma schema and db client"
```

---

### Task 3: Copy assets from runway-landing

**Files:**
- Create: `public/assets/**` (copied), `app/fonts.css` fragment folded into globals later.

**Interfaces:**
- Produces: every asset path referenced by the ported markup (`/assets/img/*`, `/assets/svg/*`, `/assets/video/*`, `/assets/fonts/*`) resolves under `public/`.

- [ ] **Step 1: Copy the asset tree**

Run:
```bash
mkdir -p /Users/vpujar/Runway-commerce/public/assets
cp -R /Users/vpujar/runway-landing/assets/. /Users/vpujar/Runway-commerce/public/assets/
```

- [ ] **Step 2: Verify counts**

Run: `find /Users/vpujar/Runway-commerce/public/assets -type f | wc -l`
Expected: same order as source (~100 files: img ~73, svg ~15, video ~11, fonts 2).

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "chore: copy landing assets into public/"
```

---

### Task 4: Port global CSS + fonts

**Files:**
- Create: `app/globals.css` (real content)
- Reference: `/Users/vpujar/runway-landing/css/style.css`, `/Users/vpujar/runway-landing/index.html` (head `<style>`/`<link>` + `@font-face`)

**Interfaces:**
- Produces: all landing class styles available globally; PP Mori fonts load from `/assets/fonts/`.

- [ ] **Step 1: Copy style.css into globals.css**

Run: `cp /Users/vpujar/runway-landing/css/style.css /Users/vpujar/Runway-commerce/app/globals.css`

- [ ] **Step 2: Prepend @font-face + :root from the landing's index.html head**

Open `/Users/vpujar/runway-landing/index.html`, copy any `@font-face` blocks and `:root{...}` custom-properties from its `<style>` in `<head>` to the TOP of `app/globals.css`. Ensure font `src: url(...)` paths are rooted at `/assets/fonts/...` (leading slash). If the landing referenced fonts via a relative `assets/…`, change to `/assets/…`.

- [ ] **Step 3: Verify no build-breaking url() paths**

Run: `grep -n "url(" app/globals.css | grep -v "/assets/" | grep -viE "data:|linear-gradient|radial-gradient|http"`
Expected: no output (every asset `url()` is absolute `/assets/...`). Fix any relative ones.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: port global CSS and fonts"
```

---

### Task 5: Landing effects client component (GSAP + three.js)

**Files:**
- Create: `app/LandingEffects.tsx`
- Reference: `/Users/vpujar/runway-landing/js/main.js`, `/Users/vpujar/runway-landing/js/sky.js`

**Interfaces:**
- Consumes: DOM IDs/classes rendered by landing components (Tasks 6–8).
- Produces: `<LandingEffects/>` — a `"use client"` component that runs the ported animation init on mount and cleans up on unmount.

- [ ] **Step 1: Create the client component shell that imports gsap from npm**

```tsx
"use client";
import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { CustomEase } from "gsap/CustomEase";
import * as THREE from "three";

export default function LandingEffects() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, CustomEase);
    const ctx = gsap.context(() => {
      initSky();
      initAnimations();
    });
    return () => ctx.revert();

    // --- ported below ---
    function initSky() { /* Step 2 */ }
    function initAnimations() { /* Step 3 */ }
  }, []);
  return null;
}
```

- [ ] **Step 2: Port sky.js into initSky()**

Copy the body of `/Users/vpujar/runway-landing/js/sky.js` into `initSky()`. Replace any global `THREE` usage with the imported `THREE`. Keep the `#skyCanvas` selector and all sizing/animation logic identical. If sky.js referenced `window.gsap`, use the imported `gsap`.

- [ ] **Step 3: Port main.js into initAnimations()**

Copy the body of `/Users/vpujar/runway-landing/js/main.js` into `initAnimations()`, minus any `gsap.registerPlugin(...)` line (already done) and any `DOMContentLoaded`/IIFE wrapper (the effect already runs after mount). Keep every selector (`#heroOverlay`, `#ipImgwrap`, `#hoPill`, `#hoWhiteTop`, `#hoWhiteBottom`, `.trigger-N`, `.bw-rig`, `.tickets`, `.site-footer`, `#fb1..3`, flipboard `.fb-card`) unchanged. For the Early-Access button/modal open logic, keep it (Task 12 wires the modal). Guard DOM lookups with null checks so missing optional nodes don't throw.

- [ ] **Step 4: Verify it compiles (used in Task 11)**

Run: `npx tsc --noEmit`
Expected: no type errors from `LandingEffects.tsx` (unused-until-Task-11 is fine).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: port GSAP + three.js landing effects"
```

---

### Task 6: Port hero + header landing components (re-skinned)

**Files:**
- Create: `components/landing/Header.tsx`, `components/landing/Hero.tsx`
- Reference: `/Users/vpujar/runway-landing/index.html` (lines ~19–90)

**Interfaces:**
- Produces: `<Header/>`, `<Hero/>` React components with identical markup/IDs, re-skinned copy.

- [ ] **Step 1: Create Header.tsx**

Port the `<header class="site-header">` block. Keep logo SVG, `.main-nav`, `.header-right`, burger, and the amber "Get Early Access" button markup/classes verbatim. Nav labels: **Log In / How it works / Travelers / Contact**. Make "Log In" an `<a href="/login">`; "Get Early Access" an `<a href="/signup">` (keep its classes). Convert `class`→`className`; keep the arrow inline SVGs (wrap large SVG markup with a `dangerouslySetInnerHTML` string if JSX conversion is noisy).

- [ ] **Step 2: Create Hero.tsx**

Port `<div class="hero-overlay" id="heroOverlay">…</div>` and `<section class="iproduct" id="iproduct">`. Keep ALL ids (`heroOverlay, hoPill, hoWhiteTop, hoWhiteBottom, fb1, fb2, fb3, ipInner, ipImgwrap`), classes, inline SVGs, flipboard card markup, and asset `src` paths (prefix with `/`). Change only:
- `<h1 class="ho-title">` text → **"Shop the world. Carried by travelers."**
- `<p class="ho-text">` text → **"CrossBorder connects you with travelers heading your way — get products that are cheaper abroad, delivered by real people."**
- The `.ho-btn` "Early Access" button: keep markup; it opens the modal (wired in Task 12) — leave as `<button className="ho-btn early-access-tile" type="button">`.
Keep XLS/RNW kicker text as-is.

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: port hero + header (re-skinned)"
```

---

### Task 7: Port amenities + betterway components (re-skinned)

**Files:**
- Create: `components/landing/Amenities.tsx`, `components/landing/Betterway.tsx`
- Reference: `/Users/vpujar/runway-landing/index.html` (amenities ~96–207; bw-rig ~209–311)

**Interfaces:**
- Produces: `<Amenities/>`, `<Betterway/>` with identical structure/IDs/`.trigger-N`, re-skinned copy.

- [ ] **Step 1: Create Amenities.tsx**

Port the `<section class="amenities" id="amenities">` block including the `.trigger-0..N` divs, accordion panels, and `<video>` tags (keep `src` `/assets/video/...`). Re-label the 5 panel titles/copy to: **Post a request · Match with travelers · Secure escrow · Track delivery · Rate & repeat** (map onto the existing 5 panels in order; keep each panel's surrounding markup/classes). Section heading text → keep "First Class Amenities" OR "Why CrossBorder" (use "Why CrossBorder").

- [ ] **Step 2: Create Betterway.tsx**

Port `<section class="bw-rig" id="betterway">` including the SVG stream paths and `#builtfor` sub-block. Keep all classes/ids/SVG path `d` attributes. Change copy:
- main heading → **"A better way to shop across borders."**
- 3 checkpoint card titles → **"Built for Buyers" / "Built for Travelers" / "Built on Trust"**
- card body copy → from spec (save money & access products / earn on trips you're already taking / escrow + KYC + reputation).

- [ ] **Step 3: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: port amenities + betterway (re-skinned)"
```

---

### Task 8: Port tickets, supported, takeoff, boarding, footer, modal (re-skinned)

**Files:**
- Create: `components/landing/Tickets.tsx`, `Supported.tsx`, `Takeoff.tsx`, `Boarding.tsx`, `Footer.tsx`, `EaModal.tsx`
- Reference: `/Users/vpujar/runway-landing/index.html` (tickets ~315–328; takeoff-wrap/supported/boarding ~330–415; footer ~417–443; eaModal ~445–470)

**Interfaces:**
- Produces: the six components; `EaModal` renders `#eaModal` markup used by ported JS.

- [ ] **Step 1: Tickets.tsx**

Port `<section class="tickets" id="tickets">` and its baked boarding-pass card markup. Keep classes/ids/asset paths. Swap testimonial quote text to buyer/traveler stories (e.g., a buyer who saved ₹80,000; a traveler who earned ₹15,000 on a trip already planned). If the ticket art is a baked image, leave the image; only change any HTML text overlays.

- [ ] **Step 2: Supported.tsx + Takeoff.tsx**

Port `<section class="supported" id="investors">` (keep as press/"As seen in" row — keep logos/markup, change any heading text to "As seen in" or keep "Supported By"). Port `<section class="takeoff">` — CTA heading "Ready for takeoff?" kept; its button → `<a href="/signup">` keeping classes.

- [ ] **Step 3: Boarding.tsx + EaModal.tsx**

Port `<section class="boarding" id="boarding">` (boarding-pass CTA). Its primary CTA becomes `<a href="/signup">` keeping ticket styling. Port `<div class="ea-modal" id="eaModal">` into `EaModal.tsx` verbatim (keep `#eaModal`, close button id, form markup). The modal's form fields stay; its submit will point to `/signup` (an anchor or a client handler that routes to `/signup`). Keep all classes/ids so ported open/close JS works.

- [ ] **Step 4: Footer.tsx**

Port `<footer class="site-footer" id="footer">`. Keep structure/classes (stripes, wordmark, firing-arrow circle). Update link labels to: How it works, Travelers, Buyers, Trust & Safety, Contact; legal line → "© 2026 CrossBorder Marketplace." Keep the animated wordmark markup.

- [ ] **Step 5: Verify compile**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: port tickets/supported/takeoff/boarding/footer/modal (re-skinned)"
```

---

### Task 9: Assemble landing page route

**Files:**
- Modify: `app/page.tsx`
- Reference: order of sections in `/Users/vpujar/runway-landing/index.html`

**Interfaces:**
- Consumes: all `components/landing/*` + `app/LandingEffects`.
- Produces: `/` renders the full re-skinned landing with animations.

- [ ] **Step 1: Write app/page.tsx**

```tsx
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Amenities from "@/components/landing/Amenities";
import Betterway from "@/components/landing/Betterway";
import Tickets from "@/components/landing/Tickets";
import Supported from "@/components/landing/Supported";
import Takeoff from "@/components/landing/Takeoff";
import Boarding from "@/components/landing/Boarding";
import Footer from "@/components/landing/Footer";
import EaModal from "@/components/landing/EaModal";
import LandingEffects from "./LandingEffects";

export default function Home() {
  return (
    <>
      {/* fixed sky canvas lives inside Hero/global markup as in the original */}
      <Header />
      <main id="top">
        <Hero />
        <Amenities />
        <Betterway />
        <Tickets />
        <Supported />
        <Takeoff />
        <Boarding />
      </main>
      <Footer />
      <EaModal />
      <LandingEffects />
    </>
  );
}
```

Note: if the original places `<canvas id="skyCanvas">` or `.sky` wrapper at body top, replicate that exact element at the top of this fragment (copy from index.html) so `initSky()` finds it.

- [ ] **Step 2: Run dev and visually verify parity**

Run: `npm run dev`, open `http://localhost:3000`. Confirm against `runway-landing` (open its `index.html` via its python server or file): hero ×7 window zoom on scroll, sky cloud-flight, flipboard flipping, betterway stream draw, tickets conveyor, footer wordmark — all present. Copy reads CrossBorder, not finance. Check browser console: no errors. Stop server.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: assemble re-skinned landing at /"
```

---

### Task 10: Validation helpers (TDD)

**Files:**
- Create: `lib/validation.ts`, `lib/validation.test.ts`
- Modify: `package.json` (add `vitest`), `scripts.test`

**Interfaces:**
- Produces: `isValidEmail(s: string): boolean`, `passwordError(s: string): string | null` (null = ok; else message), `signupError(input: {fullName:string; email:string; password:string; role:string}): string | null`.

- [ ] **Step 1: Add vitest**

Add devDep `"vitest": "3.0.4"`; add script `"test": "vitest run"`. Run `npm install`.

- [ ] **Step 2: Write failing tests — lib/validation.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { isValidEmail, passwordError, signupError } from "./validation";

describe("isValidEmail", () => {
  it("accepts a normal email", () => expect(isValidEmail("a@b.co")).toBe(true));
  it("rejects missing @", () => expect(isValidEmail("ab.co")).toBe(false));
  it("rejects empty", () => expect(isValidEmail("")).toBe(false));
});

describe("passwordError", () => {
  it("ok for 8+ chars", () => expect(passwordError("abcdefgh")).toBeNull());
  it("too short", () => expect(passwordError("abc")).toMatch(/8/));
});

describe("signupError", () => {
  const ok = { fullName: "Ada", email: "a@b.co", password: "abcdefgh", role: "BUYER" };
  it("passes valid input", () => expect(signupError(ok)).toBeNull());
  it("catches blank name", () => expect(signupError({ ...ok, fullName: " " })).toMatch(/name/i));
  it("catches bad email", () => expect(signupError({ ...ok, email: "x" })).toMatch(/email/i));
  it("catches short password", () => expect(signupError({ ...ok, password: "x" })).toMatch(/8/));
  it("catches bad role", () => expect(signupError({ ...ok, role: "ADMIN" })).toMatch(/role/i));
});
```

- [ ] **Step 3: Run tests to confirm they fail**

Run: `npm test`
Expected: FAIL — "Cannot find module './validation'".

- [ ] **Step 4: Implement lib/validation.ts**

```ts
export function isValidEmail(s: string): boolean {
  return /^\S+@\S+\.\S+$/.test(s.trim());
}

export function passwordError(s: string): string | null {
  if (s.length < 8) return "Password must be at least 8 characters.";
  return null;
}

const ROLES = ["BUYER", "TRAVELER", "BOTH"];

export function signupError(input: {
  fullName: string; email: string; password: string; role: string;
}): string | null {
  if (!input.fullName.trim()) return "Please enter your name.";
  if (!isValidEmail(input.email)) return "Please enter a valid email.";
  const pw = passwordError(input.password);
  if (pw) return pw;
  if (!ROLES.includes(input.role)) return "Please choose a valid role.";
  return null;
}
```

- [ ] **Step 5: Run tests to confirm pass**

Run: `npm test`
Expected: PASS (all cases).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: add signup/login validation helpers with tests"
```

---

### Task 11: Auth.js config + session types + signup API (TDD on password hashing)

**Files:**
- Create: `lib/auth.ts`, `types/next-auth.d.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/api/signup/route.ts`, `lib/hash.ts`, `lib/hash.test.ts`, `app/providers.tsx`
- Modify: `package.json` (add `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`), `app/layout.tsx`

**Interfaces:**
- Consumes: `prisma` from `@/lib/db`, `signupError` from `@/lib/validation`.
- Produces: `hashPassword(pw:string):Promise<string>`, `verifyPassword(pw,hash):Promise<boolean>`; Auth.js `handlers, auth, signIn, signOut` from `lib/auth.ts`; `POST /api/signup` accepting `{fullName,email,password,role}` → 201 `{id}` or 400 `{error}`; session `user.id` and `user.role` typed.

- [ ] **Step 1: Add deps**

Add `dependencies`: `"next-auth": "5.0.0-beta.25"`, `"bcryptjs": "2.4.3"`. `devDependencies`: `"@types/bcryptjs": "2.4.6"`. Run `npm install`.

- [ ] **Step 2: Write failing hash test — lib/hash.test.ts**

```ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./hash";

describe("password hashing", () => {
  it("hash differs from input and verifies", async () => {
    const h = await hashPassword("abcdefgh");
    expect(h).not.toBe("abcdefgh");
    expect(await verifyPassword("abcdefgh", h)).toBe(true);
    expect(await verifyPassword("wrong", h)).toBe(false);
  });
});
```

- [ ] **Step 3: Run to confirm fail**

Run: `npm test`
Expected: FAIL — "Cannot find module './hash'".

- [ ] **Step 4: Implement lib/hash.ts**

```ts
import bcrypt from "bcryptjs";
export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 10);
}
export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}
```

- [ ] **Step 5: Run to confirm pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Create lib/auth.ts (Auth.js v5 Credentials)**

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { verifyPassword } from "@/lib/hash";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(creds) {
        const email = String(creds?.email ?? "").toLowerCase();
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        if (!(await verifyPassword(password, user.passwordHash))) return null;
        return { id: user.id, email: user.email, name: user.fullName, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) { token.id = (user as any).id; token.role = (user as any).role; }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
```

- [ ] **Step 7: Create types/next-auth.d.ts**

```ts
import { DefaultSession } from "next-auth";
declare module "next-auth" {
  interface Session { user: { id: string; role: string } & DefaultSession["user"]; }
}
```

- [ ] **Step 8: Create app/api/auth/[...nextauth]/route.ts**

```ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 9: Create app/api/signup/route.ts**

```ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { signupError } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { fullName, email, password, role } = body ?? {};
  const err = signupError({ fullName: fullName ?? "", email: email ?? "", password: password ?? "", role: role ?? "" });
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (existing) return NextResponse.json({ error: "That email is already registered." }, { status: 400 });
  const user = await prisma.user.create({
    data: { fullName, email: String(email).toLowerCase(), passwordHash: await hashPassword(password), role },
    select: { id: true },
  });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
```

- [ ] **Step 10: Create app/providers.tsx and wire into layout**

`app/providers.tsx`:
```tsx
"use client";
import { SessionProvider } from "next-auth/react";
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```
In `app/layout.tsx`, wrap `{children}` with `<Providers>` (import it). Keep `import "./globals.css"`.

- [ ] **Step 11: Verify build + signup via curl**

Run: `npm run dev`, then:
```bash
curl -s -X POST localhost:3000/api/signup -H 'content-type: application/json' \
  -d '{"fullName":"Ada Lovelace","email":"ada@ex.com","password":"abcdefgh","role":"BUYER"}'
```
Expected: `{"id":"..."}` (201). Repeat same call → `{"error":"That email is already registered."}`. Verify row in `npx prisma studio`. Stop server.

- [ ] **Step 12: Commit**

```bash
git add -A && git commit -m "feat: auth.js credentials + signup API + password hashing"
```

---

### Task 12: Signup + login pages + EA modal wiring

**Files:**
- Create: `app/signup/page.tsx`, `app/login/page.tsx`, `components/ui/Field.tsx`
- Modify: `components/landing/EaModal.tsx`, `components/landing/Hero.tsx` (button → open modal or link `/signup`)

**Interfaces:**
- Consumes: `POST /api/signup`, `signIn` from `next-auth/react`.
- Produces: working `/signup` and `/login` that end at `/dashboard`.

- [ ] **Step 1: Create components/ui/Field.tsx**

```tsx
export default function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="cb-field">
      <span className="cb-field-label">{label}</span>
      <input className="cb-field-input" {...props} />
    </label>
  );
}
```
Add minimal styles for `.cb-field*` to `app/globals.css` (reuse boarding-pass field look: transparent input, bottom border). Keep it visually consistent with the ticket form.

- [ ] **Step 2: Create app/signup/page.tsx (client)**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Field from "@/components/ui/Field";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "BUYER" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/signup", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Sign up failed."); setBusy(false); return; }
    const s = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setBusy(false);
    if (s?.error) { setError("Signed up, but sign-in failed. Try logging in."); return; }
    router.push("/dashboard");
  }

  return (
    <main className="cb-auth">
      <form className="cb-auth-card" onSubmit={onSubmit}>
        <h1>Get Early Access</h1>
        <Field label="First & Last Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
        <Field label="Work Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Field label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <div className="cb-role" role="radiogroup" aria-label="I am a">
          {["BUYER", "TRAVELER", "BOTH"].map(r => (
            <button type="button" key={r} className={form.role === r ? "cb-role-opt on" : "cb-role-opt"} onClick={() => setForm({ ...form, role: r })}>
              {r === "BUYER" ? "I'm a Buyer" : r === "TRAVELER" ? "I'm a Traveler" : "Both"}
            </button>
          ))}
        </div>
        {error && <p className="cb-error">{error}</p>}
        <button className="cb-submit" disabled={busy}>{busy ? "Booking…" : "Get Access"}</button>
        <p className="cb-alt">Already aboard? <a href="/login">Log in</a></p>
      </form>
    </main>
  );
}
```
Add `.cb-auth*`, `.cb-role*`, `.cb-error`, `.cb-submit`, `.cb-alt` styles to `globals.css` using existing tokens (amber submit, ink text, boarding-pass card). Keep on-brand; no new design language.

- [ ] **Step 3: Create app/login/page.tsx (client)**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Field from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    const s = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (s?.error) { setError("Wrong email or password."); return; }
    router.push("/dashboard");
  }

  return (
    <main className="cb-auth">
      <form className="cb-auth-card" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <Field label="Work Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="cb-error">{error}</p>}
        <button className="cb-submit" disabled={busy}>{busy ? "Boarding…" : "Log in"}</button>
        <p className="cb-alt">New here? <a href="/signup">Get early access</a></p>
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Wire the hero/modal Early-Access button**

In `Hero.tsx`, change the `.ho-btn` to navigate: wrap as a link — replace `<button className="ho-btn early-access-tile" ...>` with `<a href="/signup" className="ho-btn early-access-tile">…</a>` (keep inner markup/classes). In `EaModal.tsx`, make the modal's submit/CTA an `<a href="/signup">` (or leave the modal but ensure its primary button routes to `/signup`). Header + boarding + takeoff CTAs already link to `/signup` (Tasks 6/8).

- [ ] **Step 5: Manual verify the flow**

Run `npm run dev`:
- `/signup` → fill valid form, submit → lands on `/dashboard` (will 200 after Task 13; until then may 404 — acceptable here, confirm no JS error and the user row is created).
- Bad email / short password / duplicate email → inline `.cb-error` shows, no crash.
- `/login` with the created creds → routes to `/dashboard`; wrong password → error.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: signup + login pages, wire CTAs"
```

---

### Task 13: Protected dashboard + middleware + header session state

**Files:**
- Create: `app/dashboard/page.tsx`, `middleware.ts`
- Modify: `components/landing/Header.tsx` (show name/dashboard when authed)

**Interfaces:**
- Consumes: `auth` from `@/lib/auth`.
- Produces: `/dashboard` protected server component; unauthenticated → redirect `/login`.

- [ ] **Step 1: Create app/dashboard/page.tsx**

```tsx
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const name = session.user.name ?? "traveler";
  return (
    <main className="cb-dash">
      <h1>Welcome aboard, {name}.</h1>
      <p className="cb-dash-sub">Your journey starts here. Trips and requests are coming in the next update.</p>
      <div className="cb-dash-grid">
        <section className="cb-dash-card"><h2>Your trips</h2><p>No trips yet.</p></section>
        <section className="cb-dash-card"><h2>Your requests</h2><p>No requests yet.</p></section>
      </div>
    </main>
  );
}
```
Add `.cb-dash*` styles to `globals.css` (sky background + boarding-pass card styling, on-brand).

- [ ] **Step 2: Create middleware.ts**

```ts
export { auth as middleware } from "@/lib/auth";
export const config = { matcher: ["/dashboard/:path*"] };
```

- [ ] **Step 3: Header session state**

Make `Header.tsx` a client component (`"use client"`) OR add a small client subcomponent that uses `useSession()` from `next-auth/react`: when authenticated, replace the "Log In" link with the user's first name linking to `/dashboard`, and keep "Get Early Access". When unauthenticated, keep current links. Do not alter classes/layout.

- [ ] **Step 4: Full flow verification**

Run `npm run dev`:
- Logged out → visit `/dashboard` → redirected to `/login`.
- Sign up (Task 12 flow) → auto lands on `/dashboard` showing "Welcome aboard, {name}".
- Header now shows the name → clicking it opens `/dashboard`.
- `/` still renders full animated landing, console clean.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: protected dashboard + middleware + header session"
```

---

### Task 14: End-to-end verification pass

**Files:** none (verification only)

- [ ] **Step 1: Typecheck + tests + build**

Run: `npx tsc --noEmit && npm test && npm run build`
Expected: no type errors; all vitest pass; production build succeeds.

- [ ] **Step 2: Parity + flow checklist (manual, `npm run dev`)**

Confirm each spec verification bullet:
- [ ] `/` renders re-skinned landing; hero ×7 zoom, sky cloud-flight, flipboard, betterway streams, tickets conveyor, footer wordmark all animate.
- [ ] Copy reads CrossBorder everywhere (no "finance platform" text remains — grep the components).
- [ ] Signup creates a `User` with correct `role` + hashed password (Prisma Studio).
- [ ] Logout → `/dashboard` redirects to `/login`; login → `/dashboard`.
- [ ] Invalid inputs show inline errors, no crash.
- [ ] No console errors on `/`.

Run copy check: `grep -rin "finance platform\|model, plan" components/ app/ || echo "clean"`
Expected: `clean`.

- [ ] **Step 2b: Commit any fixes, then tag**

```bash
git add -A && git commit -m "test: phase 1 e2e verification fixes" || echo "nothing to fix"
git tag phase-1-complete
```

---

## Self-Review Notes

- **Spec coverage:** scaffold (T1) · full schema (T2) · asset copy (T3) · CSS/fonts (T4) · animations port (T5) · all landing sections re-skinned (T6–T8) · assembled `/` (T9) · validation (T10) · auth+signup API+hashing (T11) · signup/login+CTA wiring (T12) · protected dashboard+middleware+header session (T13) · e2e (T14). Every spec section maps to a task.
- **Simulated escrow:** schema-only this phase (Order.escrowStatus enum present, no UI) — matches spec scope.
- **Design parity:** enforced by copy-not-rewrite porting + Global Constraints ID list + T9/T14 visual checks.
- **Type consistency:** `hashPassword/verifyPassword`, `signupError`, `signIn` signatures, `POST /api/signup` contract, and session `user.id/role` augmentation are consistent across T10–T13.
