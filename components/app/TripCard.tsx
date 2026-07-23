export type TripCardData = {
  id: string; fromCountry: string; toCountry: string;
  departDate: string | Date; arriveDate: string | Date;
  luggageCapacityKg: number | null; traveler?: { fullName: string };
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function TripCard({ trip, href }: { trip: TripCardData & { airline?: string | null; flightNumber?: string | null; departAirport?: string | null; arriveAirport?: string | null }; href?: string }) {
  const body = (
    <>
      <div className="cb-card-route">
        {trip.departAirport && trip.arriveAirport ? `${trip.departAirport} → ${trip.arriveAirport}` : `${trip.fromCountry} → ${trip.toCountry}`}
      </div>
      {trip.airline && <div className="cb-card-meta">{trip.airline} {trip.flightNumber}</div>}
      <div className="cb-card-meta">{fmtDate(trip.departDate)} – {fmtDate(trip.arriveDate)}</div>
      {trip.luggageCapacityKg != null && <div className="cb-card-meta">Up to {trip.luggageCapacityKg} kg spare</div>}
      {trip.traveler && <div className="cb-card-by">Traveler: {trip.traveler.fullName}</div>}
    </>
  );
  if (href) return <a className="cb-card cb-card-link-wrap" href={href}>{body}</a>;
  return <article className="cb-card">{body}</article>;
}
