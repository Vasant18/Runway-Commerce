import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import StageChip from "@/components/app/StageChip";
import OrderCard from "@/components/app/OrderCard";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function TripDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      traveler: { select: { fullName: true, ratingAvg: true, ratingCount: true } },
      matches: {
        include: {
          request: { select: { id: true, title: true, status: true } },
          order: {
            include: {
              buyer: { select: { fullName: true } },
              traveler: { select: { fullName: true } },
              match: { include: { request: true, trip: true } },
            },
          },
        },
      },
    },
  });
  if (!trip) notFound();

  return (
    <>
      <AppNav />
      <main className="cb-dash">
        <header className="cb-order-head">
          <div>
            <h1>{trip.departAirport ?? trip.fromCountry} → {trip.arriveAirport ?? trip.toCountry}</h1>
            <p className="cb-dash-sub">
              {trip.airline && <>{trip.airline} {trip.flightNumber} · {trip.aircraft} · </>}
              {fmtDate(trip.departDate)} – {fmtDate(trip.arriveDate)}
              {trip.luggageCapacityKg != null && <> · up to {trip.luggageCapacityKg} kg spare</>}
              {" · "}{trip.traveler.fullName}
              {trip.traveler.ratingCount > 0 && <> · ★ {trip.traveler.ratingAvg.toFixed(1)} ({trip.traveler.ratingCount})</>}
            </p>
          </div>
          <StageChip value={trip.status} />
        </header>

        <section className="cb-dash-card">
          <h2>Carrying</h2>
          {trip.matches.length === 0 && <p>No offers or orders on this trip yet.</p>}
          {trip.matches.map(m => (
            m.order
              ? <div key={m.id} className="cb-cards"><OrderCard order={m.order as any} /></div>
              : <p key={m.id} className="cb-instr">
                  <a href={`/requests/${m.request.id}`}>{m.request.title}</a> — offer <StageChip value={m.status} label={m.status.toLowerCase()} />
                </p>
          ))}
        </section>
      </main>
    </>
  );
}
