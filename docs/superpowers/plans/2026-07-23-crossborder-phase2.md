# CrossBorder Marketplace — Phase 2 Implementation Plan (Trips & Requests)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the marketplace usable: travelers post trips, buyers post product requests (with price-gap / reward / fee math), both sides browse the other's postings, and the dashboard shows the signed-in user's own trips & requests. Matching and orders remain Phase 3.

**Spec:** `docs/superpowers/specs/2026-07-23-crossborder-phase2-design.md`

**Architecture:** Build on the Phase 1 Next.js App Router + TypeScript app. The Prisma schema already fully models `Trip` and `Request`; Phase 2 adds one optional field (`Request.localPrice`) and is otherwise UI + API. Reads for pages happen in **server components** querying Prisma directly (Phase 1 dashboard pattern); writes go through **API routes** that mirror `app/api/signup/route.ts`. Auth/session (`session.user.id`, `session.user.role`) already exist from Phase 1.

**Tech Stack:** unchanged (Next.js 15, React 18, Prisma + PostgreSQL, Auth.js v5, vitest). No new deps.

## Global Constraints

- Project root: `/Users/vpujar/Runway-commerce`. Branch: `phase-2` (off `phase-1`). **No merge, no PR.**
- Commits: author as placeholder, unsigned, via per-command overrides:
  `git -c user.name="local" -c user.email="local@localhost" -c commit.gpgsign=false commit --no-gpg-sign -m "..."`. Commit after every task.
- Money: integer **minor units** + `currency` string, never floats. Forms take major units; convert ×100 on write; format /100 on read.
- **Never** rename/touch landing animation ids/classes or edit `~/runway-landing` (read-only reference).
- New styles: append `.cb-*` classes to `app/globals.css` using existing tokens (`--ink --paper --amber --grey --grey-lt --orange --ink-soft --radius-md --radius-lg --pad --font --amber-lt`). No new design language.
- Reuse Phase 1 primitives: `components/ui/Field.tsx`, `lib/db.ts` (`import prisma from "@/lib/db"`), `auth` from `@/lib/auth`, the `signupError` return-shape (`string | null`).
- Postgres: Docker `cb-pg` on host port **5434**; DB name `crossborder`. `.env` holds `DATABASE_URL` + `AUTH_SECRET`.
- Role gating: trips require role ∈ {TRAVELER, BOTH}; requests require role ∈ {BUYER, BOTH}.

## New / changed files

```
prisma/schema.prisma            # + Request.localPrice Int?
lib/money.ts                    # NEW — fee/total/savings math + formatting (pure)
lib/money.test.ts               # NEW — unit tests
lib/validation.ts               # + tripError, requestError
lib/validation.test.ts          # + trip/request cases
middleware.ts                   # matcher += /trips, /requests
components/ui/Select.tsx         # NEW — label+select (matches Field.tsx)
components/ui/Textarea.tsx       # NEW — label+textarea
components/app/TripCard.tsx      # NEW
components/app/RequestCard.tsx   # NEW — uses lib/money
app/api/trips/route.ts          # NEW — POST create, GET list
app/api/requests/route.ts       # NEW — POST create, GET list
app/trips/new/page.tsx          # NEW — client form
app/trips/page.tsx              # NEW — browse (server)
app/requests/new/page.tsx       # NEW — client form + live cost preview
app/requests/page.tsx           # NEW — browse (server)
app/dashboard/page.tsx          # MODIFY — real trips/requests + role-aware CTAs
app/globals.css                 # MODIFY — append .cb-* for forms/cards/preview
```

---

### Task 1: Schema — add `Request.localPrice` + push

**Files:** Modify `prisma/schema.prisma`.
**Interfaces:** `Request.localPrice: Int?` available on the Prisma client.

- [ ] **Step 1:** In `model Request`, add after `travelerReward`:
  ```prisma
  localPrice         Int?
  ```
  (nullable; minor units; same currency as `productPrice`.)
- [ ] **Step 2:** Ensure `cb-pg` is running (`docker start cb-pg`), then run `npm run db:push`. Expected: "Your database is now in sync" and the Prisma client regenerates.
- [ ] **Step 3:** Confirm the column exists:
  `docker exec cb-pg psql -U postgres -d crossborder -c '\d "Request"'` → shows `localPrice | integer |` nullable.
- [ ] **Step 4:** Commit `feat: add Request.localPrice for savings math`.

---

### Task 2: `lib/money.ts` + tests (TDD)

**Files:** Create `lib/money.ts`, `lib/money.test.ts`.
**Interfaces (all minor-unit Ints unless noted):**
- `PLATFORM_FEE_PCT = 0.05`
- `estimatePlatformFee(productPrice: number, travelerReward: number): number`
- `computeTotals(input: { productPrice: number; travelerReward: number }): { platformFee: number; totalCost: number }`
- `computeSavings(localPrice: number | null | undefined, totalCost: number): number | null`
- `formatMoney(minorUnits: number, currency: string): string`
- `toMinorUnits(major: number): number` / `fromMinorUnits(minor: number): number`

- [ ] **Step 1: Write failing tests — `lib/money.test.ts`**
  ```ts
  import { describe, it, expect } from "vitest";
  import {
    PLATFORM_FEE_PCT, estimatePlatformFee, computeTotals,
    computeSavings, formatMoney, toMinorUnits, fromMinorUnits,
  } from "./money";

  describe("estimatePlatformFee", () => {
    it("is 5% of product+reward, rounded", () => {
      // 400000 + 15000 = 415000 * 0.05 = 20750
      expect(estimatePlatformFee(400000, 15000)).toBe(20750);
    });
    it("rounds to nearest integer", () => {
      expect(estimatePlatformFee(101, 0)).toBe(5); // 5.05 -> 5
    });
  });

  describe("computeTotals", () => {
    it("sums product + reward + fee", () => {
      const { platformFee, totalCost } = computeTotals({ productPrice: 400000, travelerReward: 15000 });
      expect(platformFee).toBe(20750);
      expect(totalCost).toBe(435750);
    });
  });

  describe("computeSavings", () => {
    it("returns local - total when local given", () =>
      expect(computeSavings(500000, 435750)).toBe(64250));
    it("returns null when local missing", () =>
      expect(computeSavings(null, 435750)).toBeNull());
    it("can be negative (no floor)", () =>
      expect(computeSavings(400000, 435750)).toBe(-35750));
  });

  describe("unit conversion", () => {
    it("major -> minor", () => expect(toMinorUnits(4000)).toBe(400000));
    it("minor -> major", () => expect(fromMinorUnits(400000)).toBe(4000));
  });

  describe("formatMoney", () => {
    it("formats minor units in the currency", () => {
      const s = formatMoney(435750, "USD");
      expect(s).toMatch(/4,357\.50/); // $4,357.50
    });
    it("exposes the fee constant", () => expect(PLATFORM_FEE_PCT).toBe(0.05));
  });
  ```
- [ ] **Step 2:** Run `npm test` → FAIL (module missing).
- [ ] **Step 3: Implement `lib/money.ts`**
  ```ts
  export const PLATFORM_FEE_PCT = 0.05;

  export function estimatePlatformFee(productPrice: number, travelerReward: number): number {
    return Math.round((productPrice + travelerReward) * PLATFORM_FEE_PCT);
  }

  export function computeTotals(input: { productPrice: number; travelerReward: number }): {
    platformFee: number; totalCost: number;
  } {
    const platformFee = estimatePlatformFee(input.productPrice, input.travelerReward);
    const totalCost = input.productPrice + input.travelerReward + platformFee;
    return { platformFee, totalCost };
  }

  export function computeSavings(localPrice: number | null | undefined, totalCost: number): number | null {
    if (localPrice == null) return null;
    return localPrice - totalCost;
  }

  export function toMinorUnits(major: number): number { return Math.round(major * 100); }
  export function fromMinorUnits(minor: number): number { return minor / 100; }

  export function formatMoney(minorUnits: number, currency: string): string {
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(fromMinorUnits(minorUnits));
    } catch {
      // unknown currency code → fall back to a plain number + code
      return `${fromMinorUnits(minorUnits).toLocaleString("en-US", { minimumFractionDigits: 2 })} ${currency}`;
    }
  }
  ```
- [ ] **Step 4:** Run `npm test` → PASS.
- [ ] **Step 5:** Commit `feat: money math helpers (fee/total/savings) with tests`.

---

### Task 3: `lib/validation.ts` — `tripError` + `requestError` (TDD)

**Files:** Modify `lib/validation.ts`, `lib/validation.test.ts`.
**Interfaces (return `string | null`, first-error-or-null, matching `signupError`):**
- `tripError(input: { fromCountry: string; toCountry: string; departDate: string; arriveDate: string; luggageCapacityKg?: string | number | null }): string | null`
- `requestError(input: { title: string; originCountry: string; destinationCountry: string; productPrice: number; travelerReward: number; localPrice?: number | null; currency: string }): string | null`

Numbers here are **major-unit numbers** (validation boundary); route converts to minor units after.

- [ ] **Step 1: Add failing tests to `lib/validation.test.ts`**
  ```ts
  import { tripError, requestError } from "./validation";

  describe("tripError", () => {
    const ok = { fromCountry: "USA", toCountry: "India", departDate: "2099-01-01", arriveDate: "2099-01-02", luggageCapacityKg: 10 };
    it("passes valid", () => expect(tripError(ok)).toBeNull());
    it("needs both countries", () => expect(tripError({ ...ok, fromCountry: " " })).toMatch(/country/i));
    it("countries must differ", () => expect(tripError({ ...ok, toCountry: "USA" })).toMatch(/different/i));
    it("arrive >= depart", () => expect(tripError({ ...ok, arriveDate: "2098-12-31" })).toMatch(/after|before|date/i));
    it("depart not in past", () => expect(tripError({ ...ok, departDate: "2000-01-01", arriveDate: "2000-01-02" })).toMatch(/past|future/i));
    it("luggage > 0 if given", () => expect(tripError({ ...ok, luggageCapacityKg: -1 })).toMatch(/luggage|capacity/i));
  });

  describe("requestError", () => {
    const ok = { title: "Sony Camera", originCountry: "USA", destinationCountry: "India", productPrice: 4000, travelerReward: 150, localPrice: 5000, currency: "USD" };
    it("passes valid", () => expect(requestError(ok)).toBeNull());
    it("needs a title", () => expect(requestError({ ...ok, title: " " })).toMatch(/title/i));
    it("countries differ", () => expect(requestError({ ...ok, destinationCountry: "USA" })).toMatch(/different/i));
    it("product price > 0", () => expect(requestError({ ...ok, productPrice: 0 })).toMatch(/price/i));
    it("reward >= 0", () => expect(requestError({ ...ok, travelerReward: -5 })).toMatch(/reward/i));
    it("localPrice > 0 if given", () => expect(requestError({ ...ok, localPrice: -1 })).toMatch(/local|price/i));
    it("currency is 3 letters", () => expect(requestError({ ...ok, currency: "US" })).toMatch(/currency/i));
  });
  ```
- [ ] **Step 2:** Run `npm test` → FAIL (functions missing).
- [ ] **Step 3: Implement** in `lib/validation.ts` (append; keep existing exports):
  ```ts
  export function tripError(input: {
    fromCountry: string; toCountry: string; departDate: string; arriveDate: string;
    luggageCapacityKg?: string | number | null;
  }): string | null {
    if (!input.fromCountry?.trim() || !input.toCountry?.trim()) return "Please enter both countries.";
    if (input.fromCountry.trim().toLowerCase() === input.toCountry.trim().toLowerCase())
      return "From and to countries must be different.";
    const depart = new Date(input.departDate);
    const arrive = new Date(input.arriveDate);
    if (isNaN(depart.getTime()) || isNaN(arrive.getTime())) return "Please enter valid dates.";
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (depart < today) return "Departure date can't be in the past.";
    if (arrive < depart) return "Arrival must be on or after departure.";
    if (input.luggageCapacityKg != null && input.luggageCapacityKg !== "") {
      const kg = Number(input.luggageCapacityKg);
      if (isNaN(kg) || kg <= 0) return "Luggage capacity must be greater than 0.";
    }
    return null;
  }

  export function requestError(input: {
    title: string; originCountry: string; destinationCountry: string;
    productPrice: number; travelerReward: number; localPrice?: number | null; currency: string;
  }): string | null {
    if (!input.title?.trim()) return "Please enter a title.";
    if (!input.originCountry?.trim() || !input.destinationCountry?.trim()) return "Please enter both countries.";
    if (input.originCountry.trim().toLowerCase() === input.destinationCountry.trim().toLowerCase())
      return "Origin and destination must be different.";
    if (!(input.productPrice > 0)) return "Product price must be greater than 0.";
    if (!(input.travelerReward >= 0)) return "Traveler reward can't be negative.";
    if (input.localPrice != null && !(input.localPrice > 0)) return "Local price must be greater than 0.";
    if (!/^[A-Za-z]{3}$/.test(input.currency?.trim() ?? "")) return "Currency must be a 3-letter code.";
    return null;
  }
  ```
- [ ] **Step 4:** Run `npm test` → PASS (all old + new).
- [ ] **Step 5:** Commit `feat: trip/request validators with tests`.

---

### Task 4: API route — `app/api/trips/route.ts`

**Files:** Create `app/api/trips/route.ts`.
**Interfaces:** `POST` create → 201 `{id}` / 400 / 401 / 403. `GET ?mine=1` own trips; default browse others' UPCOMING.

- [ ] **Step 1: Implement** (mirror `app/api/signup/route.ts` + Phase 1 `auth()` usage):
  ```ts
  import { NextResponse } from "next/server";
  import prisma from "@/lib/db";
  import { auth } from "@/lib/auth";
  import { tripError } from "@/lib/validation";

  const CAN_TRAVEL = new Set(["TRAVELER", "BOTH"]);

  export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const role = (session.user as any).role;
    if (!CAN_TRAVEL.has(role)) return NextResponse.json({ error: "Only travelers can post trips." }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const { fromCountry, toCountry, departDate, arriveDate, luggageCapacityKg } = body ?? {};
    const err = tripError({ fromCountry: fromCountry ?? "", toCountry: toCountry ?? "", departDate: departDate ?? "", arriveDate: arriveDate ?? "", luggageCapacityKg });
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const trip = await prisma.trip.create({
      data: {
        travelerId: (session.user as any).id,
        fromCountry: String(fromCountry).trim(),
        toCountry: String(toCountry).trim(),
        departDate: new Date(departDate),
        arriveDate: new Date(arriveDate),
        luggageCapacityKg: luggageCapacityKg != null && luggageCapacityKg !== "" ? Number(luggageCapacityKg) : null,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: trip.id }, { status: 201 });
  }

  export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const uid = (session.user as any).id;
    const mine = new URL(req.url).searchParams.get("mine") === "1";
    const trips = await prisma.trip.findMany({
      where: mine ? { travelerId: uid } : { travelerId: { not: uid }, status: "UPCOMING" },
      orderBy: { createdAt: "desc" },
      include: { traveler: { select: { fullName: true } } },
    });
    return NextResponse.json({ trips });
  }
  ```
- [ ] **Step 2: Verify** (needs a running server + a logged-in cookie; deferred full check to Task 10). At minimum `npx tsc --noEmit` passes.
- [ ] **Step 3:** Commit `feat: trips API (create + list, role-gated)`.

---

### Task 5: API route — `app/api/requests/route.ts`

**Files:** Create `app/api/requests/route.ts`.
**Interfaces:** `POST` create → 201/400/401/403 (role ∈ {BUYER, BOTH}); converts major→minor units. `GET ?mine=1` own; default browse others' OPEN.

- [ ] **Step 1: Implement:**
  ```ts
  import { NextResponse } from "next/server";
  import prisma from "@/lib/db";
  import { auth } from "@/lib/auth";
  import { requestError } from "@/lib/validation";
  import { toMinorUnits } from "@/lib/money";

  const CAN_BUY = new Set(["BUYER", "BOTH"]);

  export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const role = (session.user as any).role;
    if (!CAN_BUY.has(role)) return NextResponse.json({ error: "Only buyers can post requests." }, { status: 403 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    const { title, productUrl, category, originCountry, destinationCountry, productPrice, travelerReward, localPrice, currency, notes } = body ?? {};

    // productPrice/travelerReward/localPrice arrive as MAJOR-unit numbers
    const err = requestError({
      title: title ?? "", originCountry: originCountry ?? "", destinationCountry: destinationCountry ?? "",
      productPrice: Number(productPrice), travelerReward: Number(travelerReward),
      localPrice: localPrice != null && localPrice !== "" ? Number(localPrice) : null,
      currency: currency ?? "",
    });
    if (err) return NextResponse.json({ error: err }, { status: 400 });

    const created = await prisma.request.create({
      data: {
        buyerId: (session.user as any).id,
        title: String(title).trim(),
        productUrl: productUrl?.trim() || null,
        category: category?.trim() || null,
        originCountry: String(originCountry).trim(),
        destinationCountry: String(destinationCountry).trim(),
        productPrice: toMinorUnits(Number(productPrice)),
        travelerReward: toMinorUnits(Number(travelerReward)),
        localPrice: localPrice != null && localPrice !== "" ? toMinorUnits(Number(localPrice)) : null,
        currency: String(currency).trim().toUpperCase(),
        notes: notes?.trim() || null,
      },
      select: { id: true },
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  }

  export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
    const uid = (session.user as any).id;
    const mine = new URL(req.url).searchParams.get("mine") === "1";
    const requests = await prisma.request.findMany({
      where: mine ? { buyerId: uid } : { buyerId: { not: uid }, status: "OPEN" },
      orderBy: { createdAt: "desc" },
      include: { buyer: { select: { fullName: true } } },
    });
    return NextResponse.json({ requests });
  }
  ```
- [ ] **Step 2:** `npx tsc --noEmit` passes.
- [ ] **Step 3:** Commit `feat: requests API (create + list, role-gated, minor-unit conversion)`.

---

### Task 6: Reusable UI — `Select`, `Textarea`, `TripCard`, `RequestCard` + CSS

**Files:** Create `components/ui/Select.tsx`, `components/ui/Textarea.tsx`, `components/app/TripCard.tsx`, `components/app/RequestCard.tsx`. Modify `app/globals.css`.

- [ ] **Step 1: `components/ui/Select.tsx`** (mirror `Field.tsx`):
  ```tsx
  export default function Select(
    { label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>
  ) {
    return (
      <label className="cb-field">
        <span className="cb-field-label">{label}</span>
        <select className="cb-field-input" {...props}>{children}</select>
      </label>
    );
  }
  ```
- [ ] **Step 2: `components/ui/Textarea.tsx`:**
  ```tsx
  export default function Textarea(
    { label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
  ) {
    return (
      <label className="cb-field">
        <span className="cb-field-label">{label}</span>
        <textarea className="cb-field-input cb-textarea" {...props} />
      </label>
    );
  }
  ```
- [ ] **Step 3: `components/app/TripCard.tsx`** (presentational; accepts a plain trip object with `traveler.fullName`, dates as strings or Dates):
  ```tsx
  export type TripCardData = {
    id: string; fromCountry: string; toCountry: string;
    departDate: string | Date; arriveDate: string | Date;
    luggageCapacityKg: number | null; traveler?: { fullName: string };
  };
  function fmtDate(d: string | Date) { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  export default function TripCard({ trip }: { trip: TripCardData }) {
    return (
      <article className="cb-card">
        <div className="cb-card-route">{trip.fromCountry} → {trip.toCountry}</div>
        <div className="cb-card-meta">{fmtDate(trip.departDate)} – {fmtDate(trip.arriveDate)}</div>
        {trip.luggageCapacityKg != null && <div className="cb-card-meta">Up to {trip.luggageCapacityKg} kg spare</div>}
        {trip.traveler && <div className="cb-card-by">Traveler: {trip.traveler.fullName}</div>}
      </article>
    );
  }
  ```
- [ ] **Step 4: `components/app/RequestCard.tsx`** (uses `lib/money`):
  ```tsx
  import { computeTotals, computeSavings, formatMoney } from "@/lib/money";
  export type RequestCardData = {
    id: string; title: string; category: string | null; productUrl: string | null;
    originCountry: string; destinationCountry: string;
    productPrice: number; travelerReward: number; localPrice: number | null;
    currency: string; notes: string | null; buyer?: { fullName: string };
  };
  export default function RequestCard({ request }: { request: RequestCardData }) {
    const { platformFee, totalCost } = computeTotals(request);
    const savings = computeSavings(request.localPrice, totalCost);
    const c = request.currency;
    return (
      <article className="cb-card">
        <div className="cb-card-title">{request.title}</div>
        <div className="cb-card-meta">{request.originCountry} → {request.destinationCountry}{request.category ? ` · ${request.category}` : ""}</div>
        <dl className="cb-card-costs">
          <div><dt>Product</dt><dd>{formatMoney(request.productPrice, c)}</dd></div>
          <div><dt>Traveler reward</dt><dd>{formatMoney(request.travelerReward, c)}</dd></div>
          <div><dt>Est. platform fee</dt><dd>{formatMoney(platformFee, c)}</dd></div>
          <div className="cb-card-total"><dt>Total</dt><dd>{formatMoney(totalCost, c)}</dd></div>
        </dl>
        {savings != null && savings > 0 && <div className="cb-card-savings">You save {formatMoney(savings, c)}</div>}
        {request.buyer && <div className="cb-card-by">Buyer: {request.buyer.fullName}</div>}
      </article>
    );
  }
  ```
- [ ] **Step 5: Append `.cb-*` CSS to `app/globals.css`** — a `.cb-card` (paper card on ink, radius-md, padding), `.cb-card-route`/`.cb-card-title` (bold, ~20px), `.cb-card-meta` (grey), `.cb-card-costs` dl grid (label left / value right), `.cb-card-total` (bold, top border), `.cb-card-savings` (amber pill), `.cb-card-by` (small, ink-soft); a `.cb-cards` grid (responsive `repeat(auto-fill,minmax(260px,1fr))`, gap); a `.cb-form` column layout; a `.cb-preview` box (bordered, dashed) for the request preview; `.cb-textarea` (min-height, resize-y); `.cb-nudge` (centered card with CTA). Reuse existing tokens only.
- [ ] **Step 6:** `npx tsc --noEmit` passes. Commit `feat: Select/Textarea + Trip/RequestCard + card CSS`.

---

### Task 7: Trip pages — `/trips/new` (form) + `/trips` (browse) + middleware

**Files:** Create `app/trips/new/page.tsx`, `app/trips/page.tsx`. Modify `middleware.ts`.

- [ ] **Step 1: Extend `middleware.ts` matcher:**
  ```ts
  export const config = { matcher: ["/dashboard/:path*", "/trips/:path*", "/requests/:path*"] };
  ```
- [ ] **Step 2: `app/trips/new/page.tsx`** — a server component that reads `auth()` for the role, then renders either a role nudge (role === "BUYER") or the client form. Split: server page checks role; if buyer, render `<div className="cb-nudge">You're registered as a buyer — <a href="/requests/new">post a request</a> instead.</div>`; else render `<TripForm/>` (a `"use client"` child in the same file or a colocated component).
  - `TripForm` mirrors `app/signup/page.tsx`: `useState` for `{fromCountry,toCountry,departDate,arriveDate,luggageCapacityKg}`, `Field` for countries (text) + `type="date"` for dates + `type="number"` for kg, POST to `/api/trips`, on 201 `router.push("/dashboard")`, else show `.cb-error`.
- [ ] **Step 3: `app/trips/page.tsx`** — server component:
  ```tsx
  import { auth } from "@/lib/auth";
  import { redirect } from "next/navigation";
  import prisma from "@/lib/db";
  import TripCard from "@/components/app/TripCard";
  export default async function BrowseTrips() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const uid = (session.user as any).id;
    const trips = await prisma.trip.findMany({
      where: { travelerId: { not: uid }, status: "UPCOMING" },
      orderBy: { createdAt: "desc" },
      include: { traveler: { select: { fullName: true } } },
    });
    return (
      <main className="cb-dash">
        <h1>Upcoming trips</h1>
        {trips.length === 0 ? <p className="cb-dash-sub">No trips posted yet.</p>
          : <div className="cb-cards">{trips.map(t => <TripCard key={t.id} trip={t as any} />)}</div>}
      </main>
    );
  }
  ```
- [ ] **Step 4: Verify** `npx tsc --noEmit` + build. Commit `feat: trip post form + browse page`.

---

### Task 8: Request pages — `/requests/new` (form + live preview) + `/requests` (browse)

**Files:** Create `app/requests/new/page.tsx`, `app/requests/page.tsx`.

- [ ] **Step 1: `app/requests/new/page.tsx`** — server component reads `auth()` role; if role === "TRAVELER" render nudge to `/trips/new`; else render `<RequestForm/>` (`"use client"`).
  - `RequestForm` state: `{title, productUrl, category, originCountry, destinationCountry, productPrice, travelerReward, localPrice, currency, notes}` (prices as strings from inputs; `currency` default "USD").
  - **Live preview:** compute on each render from the numeric fields using `lib/money`:
    ```tsx
    const pp = Number(form.productPrice) || 0;
    const tr = Number(form.travelerReward) || 0;
    const lp = form.localPrice === "" ? null : Number(form.localPrice);
    // preview works in MAJOR units for display, or convert with toMinorUnits then formatMoney
    const { platformFee, totalCost } = computeTotals({ productPrice: toMinorUnits(pp), travelerReward: toMinorUnits(tr) });
    const savings = computeSavings(lp == null ? null : toMinorUnits(lp), totalCost);
    ```
    Render a `.cb-preview` box: Product / Traveler reward / Est. fee / **Total** via `formatMoney(_, form.currency||"USD")`, and "You save X" when `savings != null && savings > 0`. Hide the box until `pp > 0`.
  - Use `Field` for text/number/url, `Select` for currency (USD, EUR, GBP, INR, JPY, AUD, CAD), `Textarea` for notes. POST to `/api/requests`, on 201 `router.push("/dashboard")`.
- [ ] **Step 2: `app/requests/page.tsx`** — server component, same shape as `/trips` but querying `prisma.request.findMany({ where: { buyerId: { not: uid }, status: "OPEN" }, include: { buyer: { select: { fullName: true } } } })`, rendering `RequestCard`s; empty state otherwise.
- [ ] **Step 3: Verify** `npx tsc --noEmit` + build. Commit `feat: request post form with live cost preview + browse page`.

---

### Task 9: Dashboard — real trips & requests + role-aware CTAs

**Files:** Modify `app/dashboard/page.tsx`.

- [ ] **Step 1: Rewrite dashboard** to load the user's own data and render role-aware CTAs:
  ```tsx
  import { auth } from "@/lib/auth";
  import { redirect } from "next/navigation";
  import prisma from "@/lib/db";
  import TripCard from "@/components/app/TripCard";
  import RequestCard from "@/components/app/RequestCard";

  export default async function Dashboard() {
    const session = await auth();
    if (!session?.user) redirect("/login");
    const uid = (session.user as any).id;
    const role = (session.user as any).role;
    const name = session.user.name ?? "traveler";
    const [trips, requests] = await Promise.all([
      prisma.trip.findMany({ where: { travelerId: uid }, orderBy: { createdAt: "desc" } }),
      prisma.request.findMany({ where: { buyerId: uid }, orderBy: { createdAt: "desc" } }),
    ]);
    const canTravel = role === "TRAVELER" || role === "BOTH";
    const canBuy = role === "BUYER" || role === "BOTH";
    return (
      <main className="cb-dash">
        <h1>Welcome aboard, {name}.</h1>
        <div className="cb-dash-actions">
          {canBuy && <a className="cb-cta" href="/requests/new">Post a request</a>}
          {canTravel && <a className="cb-cta" href="/trips/new">Post a trip</a>}
          <a className="cb-cta ghost" href="/requests">Browse requests</a>
          <a className="cb-cta ghost" href="/trips">Browse trips</a>
        </div>
        <div className="cb-dash-grid">
          <section className="cb-dash-card">
            <h2>Your trips</h2>
            {trips.length === 0 ? <p>No trips yet.</p>
              : <div className="cb-cards">{trips.map(t => <TripCard key={t.id} trip={t as any} />)}</div>}
          </section>
          <section className="cb-dash-card">
            <h2>Your requests</h2>
            {requests.length === 0 ? <p>No requests yet.</p>
              : <div className="cb-cards">{requests.map(r => <RequestCard key={r.id} request={r as any} />)}</div>}
          </section>
        </div>
      </main>
    );
  }
  ```
- [ ] **Step 2: Append `.cb-dash-actions` + `.cb-cta` (+ `.ghost`) CSS** to `globals.css` (amber filled button + ghost outline, flex-wrap row). Reuse tokens.
- [ ] **Step 3: Verify** `npx tsc --noEmit` + build. Commit `feat: populate dashboard with trips/requests + role CTAs`.

---

### Task 10: End-to-end verification + HANDOFF update

**Files:** Modify `HANDOFF.md` (+ any fixes surfaced).

- [ ] **Step 1: Static gates:** `npx tsc --noEmit && npm test && npm run build` all green.
- [ ] **Step 2: Boot** `docker start cb-pg` (already up), `PORT=3100 npm run start`.
- [ ] **Step 3: Browser flow (Playwright), two accounts:**
  - As the existing BOTH user (`ollie.p2test@example.com` / `traveler123`): dashboard shows both CTAs; post a trip (USA→India, future dates) → redirect to dashboard → appears under "Your trips". Post a request (title, USA→India, productPrice 4000, reward 150, localPrice 5000, USD) → **preview shows Total = $4,357.50 and "You save $642.50"** before submit → after submit appears under "Your requests".
  - Create a second BUYER-only account → `/trips/new` shows the nudge (no form); `/trips` browse shows the BOTH user's trip. Create/confirm a TRAVELER-only account → `/requests/new` nudge; `/requests` browse shows the BOTH user's request.
  - `POST /api/trips` as a buyer → 403; any POST logged out → 401.
  - `/` landing still animates; no new console errors (favicon 404 is fine).
- [ ] **Step 4: DB spot-check:** `docker exec cb-pg psql -U postgres -d crossborder -c 'SELECT title, "productPrice", "localPrice", currency FROM "Request" ORDER BY "createdAt" DESC LIMIT 3;'` — confirm minor units (e.g. 400000) stored.
- [ ] **Step 5: Update `HANDOFF.md`** — mark Phase 2 complete; note new files/routes; note the commit-identity switch to placeholder (and that Phase 1 commits used a real email); tag `phase-2-complete`.
- [ ] **Step 6: Commit** `docs: HANDOFF for phase 2` and `git tag phase-2-complete`.

---

## Self-Review Notes

- **Spec coverage:** schema field (T1) · money math (T2) · validators (T3) · trips API (T4) · requests API (T5) · shared UI+CSS (T6) · trip pages (T7) · request pages + live preview (T8) · dashboard (T9) · e2e + HANDOFF (T10). Every spec section maps to a task.
- **One source of truth for money:** `lib/money.ts` is imported by both the client preview (T8) and server `RequestCard` (T6) — no duplicated math.
- **Role gating** enforced in both API routes (403) and page-level nudges (T7/T8); logged-out → 401 (API) / redirect (pages, via middleware).
- **No schema churn:** single nullable additive column; `db push` safe.
- **Reuse:** `Field`, `auth()`, `prisma` singleton, `signupError` return-shape, existing `.cb-*` tokens — consistent with Phase 1.
