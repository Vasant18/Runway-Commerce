import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import StageChip from "@/components/app/StageChip";
import { formatMoney } from "@/lib/money";
import { partnersForCountry } from "@/lib/partners";
import { ReceiveAtHub, AssignCourier, DeliverWithOtp } from "./OpsActions";

// The middleman console: everything from touchdown to the buyer's door.
export default async function OpsConsole() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  if (role !== "OPS") {
    return (
      <>
        <AppNav />
        <main className="cb-auth">
          <div className="cb-nudge">The Ops console is for the CrossBorder operations team.</div>
        </main>
      </>
    );
  }

  const active = await prisma.order.findMany({
    where: { status: { in: ["LANDED", "AT_HUB", "OUT_FOR_DELIVERY", "IN_TRANSIT", "PURCHASED", "CREATED", "DELIVERED"] } },
    orderBy: { updatedAt: "desc" },
    include: {
      buyer: { select: { fullName: true } },
      traveler: { select: { fullName: true } },
      match: { include: { request: true, trip: true } },
    },
  });

  const queues = [
    { key: "LANDED", title: "Landed — receive at hub", hint: "Traveler has touched down; collect the parcel." },
    { key: "AT_HUB", title: "At hub — assign a courier", hint: "Pick a local delivery partner; fee is added to the order." },
    { key: "OUT_FOR_DELIVERY", title: "Out for delivery — OTP handoff", hint: "Courier enters the buyer's 6-digit OTP at the door." },
  ] as const;

  const rest = active.filter(o => !["LANDED", "AT_HUB", "OUT_FOR_DELIVERY"].includes(o.status));

  return (
    <>
      <AppNav />
      <main className="cb-dash">
        <h1>Ops console</h1>
        <p className="cb-dash-sub">From touchdown to the buyer&apos;s door — the middleman leg is ours.</p>

        {queues.map(q => {
          const orders = active.filter(o => o.status === q.key);
          return (
            <section key={q.key} className="cb-dash-card cb-ops-queue">
              <h2>{q.title} <span className="cb-ops-count">{orders.length}</span></h2>
              <p className="cb-instr">{q.hint}</p>
              {orders.length === 0 && <p className="cb-instr">Queue clear. ✈︎</p>}
              {orders.map(o => {
                const destCountry = o.match.request.destinationCountry;
                return (
                  <div key={o.id} className="cb-ops-row">
                    <div className="cb-ops-info">
                      <a className="cb-ops-title" href={`/orders/${o.id}`}>{o.match.request.title}</a>
                      <span className="cb-card-meta">
                        {o.match.trip.departAirport} → {o.match.trip.arriveAirport}
                        {o.match.trip.flightNumber && <> · {o.match.trip.airline} {o.match.trip.flightNumber}</>}
                        {" · "}buyer {o.buyer.fullName} · traveler {o.traveler.fullName}
                      </span>
                      <span className="cb-card-meta">
                        Deliver to: {o.deliveryAddress ?? "—"}{o.deliveryCity ? `, ${o.deliveryCity}` : ""} ({destCountry})
                        {o.deliveryPartner && <> · {o.deliveryPartner} · {o.deliveryTrackingCode} · fee {formatMoney(o.deliveryFee, o.currency)}</>}
                      </span>
                    </div>
                    <div className="cb-ops-do">
                      {q.key === "LANDED" && <ReceiveAtHub orderId={o.id} />}
                      {q.key === "AT_HUB" && <AssignCourier orderId={o.id} partners={partnersForCountry(destCountry).map(p => ({ name: p.name, feeMinor: p.feeMinor }))} />}
                      {q.key === "OUT_FOR_DELIVERY" && <DeliverWithOtp orderId={o.id} />}
                    </div>
                  </div>
                );
              })}
            </section>
          );
        })}

        <section className="cb-dash-card">
          <h2>All other active orders</h2>
          {rest.length === 0 && <p className="cb-instr">Nothing else in flight.</p>}
          {rest.map(o => (
            <p key={o.id} className="cb-instr">
              <a href={`/orders/${o.id}`}>{o.match.request.title}</a> — <StageChip value={o.status} />
              {" "}· buyer {o.buyer.fullName} · traveler {o.traveler.fullName}
            </p>
          ))}
        </section>
      </main>
    </>
  );
}
