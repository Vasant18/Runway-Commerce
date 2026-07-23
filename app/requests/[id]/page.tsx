import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import StageChip from "@/components/app/StageChip";
import RequestCard from "@/components/app/RequestCard";
import { DecideOffer, OfferToCarry } from "./RequestClient";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function RequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const role = (session.user as any).role;

  const { id } = await params;
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, fullName: true, ratingAvg: true, ratingCount: true } },
      match: { include: { trip: { include: { traveler: { select: { fullName: true, ratingAvg: true, ratingCount: true } } } }, order: { select: { id: true } } } },
    },
  });
  if (!request) notFound();

  const isOwner = request.buyer.id === uid;
  const canTravel = role === "TRAVELER" || role === "BOTH";
  const m = request.match;

  // Traveler's own upcoming trips (for the offer form)
  const myTrips = !isOwner && canTravel
    ? await prisma.trip.findMany({ where: { travelerId: uid, status: "UPCOMING" }, orderBy: { departDate: "asc" } })
    : [];

  return (
    <>
      <AppNav />
      <main className="cb-dash">
        <header className="cb-order-head">
          <div>
            <h1>{request.title}{request.quantity > 1 ? ` ×${request.quantity}` : ""}</h1>
            <p className="cb-dash-sub">
              {request.originCountry} → {request.destinationCountry}
              {request.category ? ` · ${request.category}` : ""} · by {request.buyer.fullName}
              {request.buyer.ratingCount > 0 && <> · ★ {request.buyer.ratingAvg.toFixed(1)} ({request.buyer.ratingCount})</>}
            </p>
          </div>
          <StageChip value={request.status} />
        </header>

        <div className="cb-order-grid">
          <div><RequestCard request={request as any} /></div>
          <section className="cb-dash-card">
            <h2>Buying instructions</h2>
            {request.purchaseAt && <p className="cb-instr"><strong>Where to buy:</strong> {request.purchaseAt}</p>}
            {request.productUrl && <p className="cb-instr"><strong>Link:</strong> <a href={request.productUrl} target="_blank" rel="noopener noreferrer">{request.productUrl}</a></p>}
            {request.notes && <p className="cb-instr"><strong>Spec / notes:</strong> {request.notes}</p>}
            {request.deliveryCity && <p className="cb-instr"><strong>Deliver to:</strong> {request.deliveryAddress}, {request.deliveryCity}</p>}
          </section>
        </div>

        {/* buyer: pending offer to decide */}
        {isOwner && m && m.status === "PROPOSED" && (
          <section className="cb-dash-card">
            <h2>Offer from {m.trip.traveler.fullName}</h2>
            <p className="cb-instr">
              {m.trip.departAirport} → {m.trip.arriveAirport}
              {m.trip.airline && <> · {m.trip.airline} {m.trip.flightNumber} ({m.trip.aircraft})</>}
              {" · departs "}{fmtDate(m.trip.departDate)}
              {m.trip.traveler.ratingCount > 0 && <> · ★ {m.trip.traveler.ratingAvg.toFixed(1)} ({m.trip.traveler.ratingCount})</>}
            </p>
            <DecideOffer matchId={m.id} />
          </section>
        )}
        {isOwner && m && m.status === "ACCEPTED" && m.order && (
          <section className="cb-dash-card">
            <h2>Matched!</h2>
            <p className="cb-instr">Carried by {m.trip.traveler.fullName}. <a href={`/orders/${m.order.id}`}>Track the order →</a></p>
          </section>
        )}

        {/* traveler: offer to carry */}
        {!isOwner && canTravel && request.status === "OPEN" && (!m || m.status === "DECLINED") && (
          <section className="cb-dash-card">
            <h2>Offer to carry this</h2>
            <OfferToCarry
              requestId={request.id}
              trips={myTrips.map(t => ({
                id: t.id,
                label: `${t.departAirport ?? t.fromCountry} → ${t.arriveAirport ?? t.toCountry} · ${t.airline ?? ""} ${t.flightNumber ?? ""} · ${fmtDate(t.departDate)}`,
              }))}
            />
          </section>
        )}
        {!isOwner && m && m.status === "PROPOSED" && (
          <p className="cb-dash-sub">This request has a pending offer awaiting the buyer&apos;s decision.</p>
        )}
      </main>
    </>
  );
}
