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
      <p className="cb-dash-sub">Post a trip or a request, and browse what others have posted.</p>
      <div className="cb-dash-actions">
        {canBuy && <a className="cb-cta" href="/requests/new">Post a request</a>}
        {canTravel && <a className="cb-cta" href="/trips/new">Post a trip</a>}
        <a className="cb-cta ghost" href="/requests">Browse requests</a>
        <a className="cb-cta ghost" href="/trips">Browse trips</a>
      </div>
      <div className="cb-dash-grid">
        <section className="cb-dash-card">
          <h2>Your trips</h2>
          {trips.length === 0
            ? <p>No trips yet.</p>
            : <div className="cb-cards">{trips.map(t => <TripCard key={t.id} trip={t as any} />)}</div>}
        </section>
        <section className="cb-dash-card">
          <h2>Your requests</h2>
          {requests.length === 0
            ? <p>No requests yet.</p>
            : <div className="cb-cards">{requests.map(r => <RequestCard key={r.id} request={r as any} />)}</div>}
        </section>
      </div>
    </main>
  );
}
