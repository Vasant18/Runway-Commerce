export type TripCardData = {
  id: string; fromCountry: string; toCountry: string;
  departDate: string | Date; arriveDate: string | Date;
  luggageCapacityKg: number | null; traveler?: { fullName: string };
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default function TripCard({ trip }: { trip: TripCardData }) {
  return (
    <article className="cb-card">
      <div className="cb-card-route">{trip.fromCountry} → {trip.toCountry}</div>
      <div className="cb-card-meta">{fmtDate(trip.departDate)} – {fmtDate(trip.arriveDate)}</div>
      {trip.luggageCapacityKg != null && <div className="cb-card-meta">Up to {trip.luggageCapacityKg} kg spare</div>}
      {trip.traveler && <div className="cb-card-by">Traveler: {trip.traveler.fullName}</div>}
    </article>
  );
}
