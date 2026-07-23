import { formatMoney } from "@/lib/money";
import StageChip from "./StageChip";

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
  return (
    <a className="cb-card cb-card-link-wrap" href={`/orders/${order.id}`}>
      <div className="cb-card-title">{req?.title ?? "Order"}</div>
      <div className="cb-card-meta">
        {trip?.departAirport && trip?.arriveAirport
          ? `${trip.departAirport} → ${trip.arriveAirport}${trip.flightNumber ? ` · ${trip.flightNumber}` : ""}`
          : req ? `${req.originCountry} → ${req.destinationCountry}` : ""}
      </div>
      {(order.buyer || order.traveler) && (
        <div className="cb-card-meta">
          {order.buyer && <>Buyer: {order.buyer.fullName}</>}
          {order.buyer && order.traveler && " · "}
          {order.traveler && <>Traveler: {order.traveler.fullName}</>}
        </div>
      )}
      <div className="cb-card-foot">
        <StageChip value={order.status} />
        <span className="cb-card-total-inline">{formatMoney(order.totalAmount, order.currency)}</span>
      </div>
    </a>
  );
}
