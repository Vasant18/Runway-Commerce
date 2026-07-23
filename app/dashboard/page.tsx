import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import TripCard from "@/components/app/TripCard";
import RequestCard from "@/components/app/RequestCard";
import OrderCard from "@/components/app/OrderCard";
import WorldMapSvg, { type Journey } from "@/components/app/WorldMapSvg";
import { airportByIata } from "@/lib/geo";
import { formatMoney, computeSavings } from "@/lib/money";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const role = (session.user as any).role;
  const name = session.user.name ?? "traveler";
  if (role === "OPS") redirect("/ops");

  const [trips, requests, orders, me] = await Promise.all([
    prisma.trip.findMany({ where: { travelerId: uid }, orderBy: { createdAt: "desc" } }),
    prisma.request.findMany({ where: { buyerId: uid }, orderBy: { createdAt: "desc" }, include: { match: { select: { status: true } } } }),
    prisma.order.findMany({
      where: { OR: [{ buyerId: uid }, { travelerId: uid }] },
      orderBy: { updatedAt: "desc" },
      include: {
        buyer: { select: { fullName: true } },
        traveler: { select: { fullName: true } },
        match: { include: { request: true, trip: true } },
      },
    }),
    prisma.user.findUnique({ where: { id: uid }, select: { ratingAvg: true, ratingCount: true } }),
  ]);

  const canTravel = role === "TRAVELER" || role === "BOTH";
  const canBuy = role === "BUYER" || role === "BOTH";

  const activeOrders = orders.filter(o => o.status !== "CONFIRMED");
  const inFlight = orders.filter(o => ["IN_TRANSIT", "LANDED", "AT_HUB", "OUT_FOR_DELIVERY"].includes(o.status));
  const totalSaved = orders
    .filter(o => o.status === "CONFIRMED" && o.buyerId === uid)
    .reduce((sum, o) => sum + Math.max(0, computeSavings(o.match.request.localPrice, o.totalAmount) ?? 0), 0);
  const savedCurrency = orders.find(o => o.buyerId === uid)?.currency ?? "USD";

  // Journeys for the map hero: my active orders' flight legs (fallback: my upcoming trips)
  const journeys: Journey[] = [];
  for (const o of activeOrders) {
    const f = airportByIata(o.match.trip.departAirport);
    const t = airportByIata(o.match.trip.arriveAirport);
    if (f && t) journeys.push({
      from: { lat: f.lat, lng: f.lng, label: f.iata },
      to: { lat: t.lat, lng: t.lng, label: t.iata },
      active: ["IN_TRANSIT", "LANDED", "AT_HUB", "OUT_FOR_DELIVERY"].includes(o.status),
    });
  }
  if (journeys.length === 0) {
    for (const trip of trips.filter(t => t.status === "UPCOMING").slice(0, 3)) {
      const f = airportByIata(trip.departAirport);
      const t = airportByIata(trip.arriveAirport);
      if (f && t) journeys.push({ from: { lat: f.lat, lng: f.lng, label: f.iata }, to: { lat: t.lat, lng: t.lng, label: t.iata } });
    }
  }

  const pendingOffers = requests.filter(r => r.match?.status === "PROPOSED").length;

  return (
    <>
      <AppNav />
      <main className="cb-dash">
        <h1>Welcome aboard, {name}.</h1>
        {pendingOffers > 0 && (
          <p className="cb-dash-sub cb-dash-alert">
            ✈︎ You have {pendingOffers} offer{pendingOffers > 1 ? "s" : ""} from travelers waiting — check your requests below.
          </p>
        )}

        <div className="cb-stats">
          <div className="cb-stat"><span className="cb-stat-n">{activeOrders.length}</span><span className="cb-stat-l">active orders</span></div>
          <div className="cb-stat"><span className="cb-stat-n">{inFlight.length}</span><span className="cb-stat-l">in transit</span></div>
          <div className="cb-stat"><span className="cb-stat-n">{totalSaved > 0 ? formatMoney(totalSaved, savedCurrency) : "—"}</span><span className="cb-stat-l">total saved</span></div>
          <div className="cb-stat"><span className="cb-stat-n">{me && me.ratingCount > 0 ? `★ ${me.ratingAvg.toFixed(1)}` : "—"}</span><span className="cb-stat-l">your rating</span></div>
        </div>

        {journeys.length > 0 && <WorldMapSvg title="Your journeys" journeys={journeys} />}

        <div className="cb-dash-actions">
          {canBuy && <a className="cb-cta" href="/requests/new">Post a request</a>}
          {canTravel && <a className="cb-cta" href="/trips/new">Post a trip</a>}
          <a className="cb-cta ghost" href="/requests">Browse requests</a>
          <a className="cb-cta ghost" href="/trips">Browse trips</a>
          <a className="cb-cta ghost" href="/orders">All orders</a>
        </div>

        {orders.length > 0 && (
          <section className="cb-dash-card">
            <h2>Recent orders</h2>
            <div className="cb-cards">{orders.slice(0, 6).map(o => <OrderCard key={o.id} order={o as any} />)}</div>
          </section>
        )}

        <div className="cb-dash-grid">
          <section className="cb-dash-card">
            <h2>Your trips</h2>
            {trips.length === 0
              ? <p>No trips yet.</p>
              : <div className="cb-cards">{trips.map(t => <TripCard key={t.id} trip={t as any} href={`/trips/${t.id}`} />)}</div>}
          </section>
          <section className="cb-dash-card">
            <h2>Your requests</h2>
            {requests.length === 0
              ? <p>No requests yet.</p>
              : <div className="cb-cards">{requests.map(r => <RequestCard key={r.id} request={r as any} href={`/requests/${r.id}`} />)}</div>}
          </section>
        </div>
      </main>
    </>
  );
}
