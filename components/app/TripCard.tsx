import type { CSSProperties } from "react";
import { airlineThemeVars } from "@/lib/airlines";
import StarRating from "./StarRating";

export type TripCardData = {
  id: string; fromCountry: string; toCountry: string;
  departDate: string | Date; arriveDate: string | Date;
  luggageCapacityKg: number | null;
  airline?: string | null; flightNumber?: string | null;
  departAirport?: string | null; arriveAirport?: string | null;
  traveler?: { fullName: string; ratingAvg?: number; ratingCount?: number };
};

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export function PlaneGlyph() {
  return (
    <svg className="cb-ticket-plane" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 16l20-6-9 4-2 6-2-4-7 0z" />
    </svg>
  );
}

export default function TripCard({ trip, href }: { trip: TripCardData; href?: string }) {
  const themeVars = airlineThemeVars(trip.airline) as CSSProperties;
  const body = (
    <>
      <div className="cb-ticket-main">
        <div className="cb-ticket-route">
          {trip.departAirport && trip.arriveAirport
            ? <><span className="cb-ticket-iata">{trip.departAirport}</span><PlaneGlyph /><span className="cb-ticket-iata">{trip.arriveAirport}</span></>
            : <><span>{trip.fromCountry}</span><PlaneGlyph /><span>{trip.toCountry}</span></>}
        </div>
        {trip.airline && (
          <div className="cb-ticket-badge">{trip.airline}{trip.flightNumber ? ` · ${trip.flightNumber}` : ""}</div>
        )}
        <div className="cb-ticket-meta">{fmtDate(trip.departDate)} – {fmtDate(trip.arriveDate)}</div>
        {trip.traveler && (
          <div className="cb-ticket-who">
            <span className="cb-ticket-avatar" aria-hidden>{initials(trip.traveler.fullName)}</span>
            <span className="cb-ticket-name">{trip.traveler.fullName}</span>
            <StarRating avg={trip.traveler.ratingAvg} count={trip.traveler.ratingCount} />
          </div>
        )}
      </div>
      <div className="cb-ticket-stub">
        <span className="cb-ticket-fig">{trip.luggageCapacityKg != null ? `${trip.luggageCapacityKg} kg` : "—"}</span>
        <span className="cb-ticket-fig-label">Spare capacity</span>
      </div>
    </>
  );
  if (href) return <a className="cb-ticket cb-card-link-wrap" style={themeVars} href={href}>{body}</a>;
  return <article className="cb-ticket" style={themeVars}>{body}</article>;
}
