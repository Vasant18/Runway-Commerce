import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import StageChip from "@/components/app/StageChip";
import OrderTracker from "@/components/app/OrderTracker";
import OrderActions, { type AvailableAction } from "./OrderActions";
import WorldMapSvg from "@/components/app/WorldMapSvg";
import OrderLeafletMap from "@/components/app/OrderLeafletMap";
import { formatMoney, computeSavings } from "@/lib/money";
import { airportByIata } from "@/lib/geo";
import { ACTIONS, TRANSITIONS, canTransition, type ActorRole } from "@/lib/orders";

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const role = (session.user as any).role;

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      buyer: { select: { id: true, fullName: true, ratingAvg: true, ratingCount: true } },
      traveler: { select: { id: true, fullName: true, ratingAvg: true, ratingCount: true } },
      match: { include: { request: true, trip: true } },
      ratings: { include: { rater: { select: { fullName: true } } } },
    },
  });
  if (!order) notFound();
  const isOps = role === "OPS";
  const isBuyer = order.buyerId === uid;
  const isTraveler = order.travelerId === uid;
  if (!isOps && !isBuyer && !isTraveler) redirect("/orders");

  const req = order.match.request;
  const trip = order.match.trip;
  const actor: ActorRole = isOps ? "ops" : isBuyer ? "buyer" : "traveler";

  // Which actions can THIS viewer take right now? (ops-only actions live on /ops,
  // but showing them here too costs nothing and helps demos.)
  const available: AvailableAction[] = ACTIONS
    .filter(a => a !== "assign_courier" && a !== "deliver") // those need extra input → /ops console
    .filter(a => canTransition(order, a, actor) === null)
    .map(a => ({ action: a, label: TRANSITIONS[a].label }));

  const savings = computeSavings(req.localPrice, order.totalAmount);
  const from = airportByIata(trip.departAirport);
  const to = airportByIata(trip.arriveAirport);

  // synthetic dropoff: small offset from the destination airport toward the city
  const dropoff = to && order.deliveryAddress
    ? { lat: to.lat - 0.18, lng: to.lng - 0.12, label: order.deliveryAddress }
    : undefined;

  return (
    <>
      <AppNav />
      <main className="cb-dash cb-order">
        <header className="cb-order-head">
          <div>
            <h1>{req.title}{req.quantity > 1 ? ` ×${req.quantity}` : ""}</h1>
            <p className="cb-dash-sub">
              {trip.departAirport && trip.arriveAirport
                ? `${trip.departAirport} → ${trip.arriveAirport}`
                : `${req.originCountry} → ${req.destinationCountry}`}
              {trip.airline && <> · {trip.airline} {trip.flightNumber}</>}
              {trip.aircraft && <> · {trip.aircraft}</>}
              {" · "}{fmtDate(trip.departDate)}
            </p>
            <p className="cb-dash-sub">Buyer: {order.buyer.fullName} · Traveler: {order.traveler.fullName}</p>
          </div>
          <div className="cb-order-chips">
            <StageChip value={order.status} />
            <StageChip value={order.escrowStatus} label={`escrow: ${order.escrowStatus.replaceAll("_", " ").toLowerCase()}`} />
          </div>
        </header>

        <OrderTracker status={order.status} escrowStatus={order.escrowStatus} />

        <OrderActions
          orderId={order.id}
          actions={available}
          showOtp={isBuyer && order.status === "OUT_FOR_DELIVERY" ? order.deliveryOtp : null}
          canRate={!isOps && order.status === "CONFIRMED" && !order.ratings.some(r => r.raterId === uid)}
        />

        <div className="cb-order-grid">
          <section className="cb-dash-card">
            <h2>Cost breakdown</h2>
            <dl className="cb-card-costs">
              <div><dt>Product{req.quantity > 1 ? ` ×${req.quantity}` : ""}</dt><dd>{formatMoney(order.productPrice, order.currency)}</dd></div>
              <div><dt>Traveler reward</dt><dd>{formatMoney(order.travelerReward, order.currency)}</dd></div>
              <div><dt>Platform fee</dt><dd>{formatMoney(order.platformFee, order.currency)}</dd></div>
              <div><dt>Delivery fee{order.deliveryPartner ? ` (${order.deliveryPartner})` : ""}</dt><dd>{formatMoney(order.deliveryFee, order.currency)}</dd></div>
              <div className="cb-card-total"><dt>Total</dt><dd>{formatMoney(order.totalAmount, order.currency)}</dd></div>
            </dl>
            {savings != null && savings > 0 && <div className="cb-card-savings">Buyer saves {formatMoney(savings, order.currency)} vs local price</div>}
          </section>

          <section className="cb-dash-card">
            <h2>Purchase instructions</h2>
            {req.purchaseAt && <p className="cb-instr"><strong>Where to buy:</strong> {req.purchaseAt}</p>}
            {req.productUrl && <p className="cb-instr"><strong>Link:</strong> <a href={req.productUrl} target="_blank" rel="noopener noreferrer">{req.productUrl}</a></p>}
            {req.notes && <p className="cb-instr"><strong>Spec / notes:</strong> {req.notes}</p>}
            <p className="cb-instr"><strong>Deliver to:</strong> {order.deliveryAddress ?? req.deliveryAddress ?? req.destinationCountry}{order.deliveryCity ? `, ${order.deliveryCity}` : ""}</p>
            {order.deliveryPartner && (
              <p className="cb-instr"><strong>Courier:</strong> {order.deliveryPartner} · {order.deliveryTrackingCode}</p>
            )}
          </section>
        </div>

        {from && to && (
          <>
            <WorldMapSvg
              title="Journey"
              journeys={[{
                from: { lat: from.lat, lng: from.lng, label: from.iata },
                to: { lat: to.lat, lng: to.lng, label: to.iata },
                active: !["DELIVERED", "CONFIRMED"].includes(order.status),
              }]}
            />
            <OrderLeafletMap
              journey={{
                origin: { lat: from.lat, lng: from.lng, label: `${from.city} (${from.iata})` },
                destination: { lat: to.lat, lng: to.lng, label: `${to.city} (${to.iata})` },
                hub: { lat: to.lat - 0.08, lng: to.lng + 0.06, label: `Runway hub, ${to.city}` },
                dropoff,
                flightLabel: trip.airline ? `${trip.airline} ${trip.flightNumber ?? ""} · ${trip.aircraft ?? ""}` : undefined,
                courierLabel: order.deliveryPartner ? `${order.deliveryPartner} · ${order.deliveryTrackingCode}` : undefined,
              }}
            />
          </>
        )}

        {order.ratings.length > 0 && (
          <section className="cb-dash-card">
            <h2>Ratings</h2>
            {order.ratings.map(r => (
              <p key={r.id} className="cb-instr">
                <strong>{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</strong> — {r.comment} <em>({r.rater.fullName})</em>
              </p>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
