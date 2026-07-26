import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import TripCard from "@/components/app/TripCard";
import BrowseControls from "@/components/app/BrowseControls";
import type { Prisma } from "@prisma/client";

type SP = Promise<Record<string, string | undefined>>;

export default async function BrowseTrips({ searchParams }: { searchParams: SP }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const sp = await searchParams;

  const where: Prisma.TripWhereInput = { travelerId: { not: uid }, status: "UPCOMING" };
  if (sp.airline) where.airline = sp.airline;
  if (sp.from) where.fromCountry = sp.from;
  if (sp.to) where.toCountry = sp.to;
  const minkg = Number(sp.minkg);
  if (sp.minkg && Number.isFinite(minkg) && minkg > 0) where.luggageCapacityKg = { gte: minkg };
  if (sp.q) {
    where.OR = [
      { airline: { contains: sp.q } },
      { departAirport: { contains: sp.q } },
      { arriveAirport: { contains: sp.q } },
      { fromCountry: { contains: sp.q } },
      { toCountry: { contains: sp.q } },
    ];
  }

  const orderBy: Prisma.TripOrderByWithRelationInput =
    sp.sort === "depart" ? { departDate: "asc" }
    : sp.sort === "kg" ? { luggageCapacityKg: "desc" }
    : sp.sort === "rating" ? { traveler: { ratingAvg: "desc" } }
    : { createdAt: "desc" };

  const [trips, airlineRows, fromRows, toRows] = await Promise.all([
    prisma.trip.findMany({
      where, orderBy,
      include: { traveler: { select: { fullName: true, ratingAvg: true, ratingCount: true } } },
    }),
    prisma.trip.findMany({ where: { status: "UPCOMING", airline: { not: null } }, distinct: ["airline"], select: { airline: true }, orderBy: { airline: "asc" } }),
    prisma.trip.findMany({ where: { status: "UPCOMING" }, distinct: ["fromCountry"], select: { fromCountry: true } }),
    prisma.trip.findMany({ where: { status: "UPCOMING" }, distinct: ["toCountry"], select: { toCountry: true } }),
  ]);
  const airlines = airlineRows.map(r => r.airline!).filter(Boolean);
  const countries = Array.from(new Set([...fromRows.map(r => r.fromCountry), ...toRows.map(r => r.toCountry)])).sort();

  return (
    <>
      <AppNav />
      <main className="cb-dash">
        <h1>Upcoming trips</h1>
        <p className="cb-dash-sub">Travelers heading somewhere soon — post a request they can carry.</p>
        <div className="cb-browse">
          <aside className="cb-browse-side">
            <BrowseControls kind="trips" facets={{ airlines, countries }} current={sp} />
          </aside>
          <div className="cb-browse-main">
            <div className="cb-browse-head">
              <span className="cb-browse-count">{trips.length} {trips.length === 1 ? "trip" : "trips"}</span>
            </div>
            {trips.length === 0
              ? <p className="cb-dash-sub">No trips match — try clearing a filter.</p>
              : <div className="cb-cards">{trips.map(t => <TripCard key={t.id} trip={t as any} href={`/trips/${t.id}`} />)}</div>}
          </div>
        </div>
      </main>
    </>
  );
}
