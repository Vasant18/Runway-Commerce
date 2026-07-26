import type { CSSProperties } from "react";
import { formatMoney } from "@/lib/money";
import { airlineThemeVars } from "@/lib/airlines";
import StageChip from "./StageChip";
import { PlaneGlyph } from "./TripCard";

export type OrderCardData = {
  id: string; status: string; escrowStatus: string;
  totalAmount: number; currency: string;
  deliveryCity: string | null;
  buyer?: { fullName: string };
  traveler?: { fullName: string };
  match?: {
    request?: { title: string; originCountry: string; destinationCountry: string };
    trip?: { airline: string | null; flightNumber: string | null; departAirport: string | null; arriveAirport: string | null };
  };
};

export default function OrderCard({ order }: { order: OrderCardData }) {
  const req = order.match?.request;
  const trip = order.match?.trip;
  const themeVars = airlineThemeVars(trip?.airline) as CSSProperties;
  return (
    <a className="cb-ticket cb-card-link-wrap" style={themeVars} href={`/orders/${order.id}`}>
      <div className="cb-ticket-main">
        <div className="cb-ticket-title">{req?.title ?? "Order"}</div>
        {trip?.departAirport && trip?.arriveAirport ? (
          <div className="cb-ticket-route cb-ticket-route-sm">
            <span className="cb-ticket-iata">{trip.departAirport}</span><PlaneGlyph /><span className="cb-ticket-iata">{trip.arriveAirport}</span>
            {trip.flightNumber && <span className="cb-ticket-badge">{trip.airline ? `${trip.airline} · ` : ""}{trip.flightNumber}</span>}
          </div>
        ) : req ? (
          <div className="cb-ticket-meta">{req.originCountry} → {req.destinationCountry}</div>
        ) : null}
        {(order.buyer || order.traveler) && (
          <div className="cb-ticket-meta">
            {order.buyer && <>Buyer: {order.buyer.fullName}</>}
            {order.buyer && order.traveler && " · "}
            {order.traveler && <>Traveler: {order.traveler.fullName}</>}
          </div>
        )}
        <StageChip value={order.status} />
      </div>
      <div className="cb-ticket-stub">
        <span className="cb-ticket-fig">{formatMoney(order.totalAmount, order.currency)}</span>
        <span className="cb-ticket-fig-label">Total</span>
      </div>
    </a>
  );
}
