// Testimonials as DOM boarding-pass tickets built from the platform's seeded reviews.
// CRITICAL: the .pass wrappers (count=6, DOM order, data-i) are the GSAP conveyor's
// hooks (LandingEffects "tickets" rig) — only the INNER card content may change.

type Pass = {
  quote: string;
  name: string;
  place: string;
  route: [string, string];
  flight: string;
  saved?: string;
  earned?: string;
  stars: number;
};

const PASSES: Pass[] = [
  {
    quote: "Saved ₹64,250 on my Sony camera. Traveler sent photos from the store, courier reached my door with an OTP the day the flight landed.",
    name: "Ananya Rao", place: "Bengaluru", route: ["JFK", "BLR"], flight: "AI 102", saved: "₹64,250 saved", stars: 5,
  },
  {
    quote: "I fly DXB–JFK monthly anyway. Carrying one camera paid for my checked bag and dinner. CrossBorder handled everything after landing.",
    name: "Farhan Souza", place: "Dubai", route: ["DXB", "JFK"], flight: "EK 202", earned: "$150 earned", stars: 5,
  },
  {
    quote: "The escrow made it feel safe — money only moved when I typed the OTP at my door. MacBook sealed, exactly the spec I asked for.",
    name: "Hana Sato", place: "Tokyo", route: ["SFO", "NRT"], flight: "UA 837", saved: "¥89,000 saved", stars: 5,
  },
  {
    quote: "Flawless handoff at the hub. I landed, dropped the parcel, and the local courier took the last mile. Zero friction, real reward.",
    name: "Liam O'Connor", place: "London", route: ["LHR", "BLR"], flight: "BA 275", earned: "£120 earned", stars: 5,
  },
  {
    quote: "Tracked my Airwrap like a flight: purchased → boarded → landed → out for delivery. The map is addictive. Arrived in 3 days.",
    name: "Priya Sharma", place: "Delhi", route: ["LHR", "DEL"], flight: "QR 8", saved: "₹18,400 saved", stars: 5,
  },
  {
    quote: "Two trips a month, two carries a month. The reward math is upfront, the platform fee is fair, and buyers rate you like a pro.",
    name: "Diego Martins", place: "São Paulo", route: ["GRU", "JFK"], flight: "LA 8084", earned: "$210 earned", stars: 4,
  },
];

function PassCard({ p }: { p: Pass }) {
  return (
    <div className="cb-pass-card">
      <div className="cb-pass-main">
        <div className="cb-pass-route">
          <span className="cb-pass-iata">{p.route[0]}</span>
          <svg className="cb-pass-plane" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 16l20-6-9 4-2 6-2-4-7 0z" />
          </svg>
          <span className="cb-pass-iata">{p.route[1]}</span>
          <span className="cb-pass-flight">{p.flight}</span>
        </div>
        <p className="cb-pass-quote">“{p.quote}”</p>
        <div className="cb-pass-who">
          <span className="cb-pass-avatar" aria-hidden>{p.name.split(" ").map(w => w[0]).join("")}</span>
          <span className="cb-pass-name">{p.name} · {p.place}</span>
          <span className="cb-pass-stars" aria-label={`${p.stars} stars`}>{"★".repeat(p.stars)}{"☆".repeat(5 - p.stars)}</span>
        </div>
      </div>
      <div className="cb-pass-stub">
        <span className="cb-pass-stub-tag">{p.saved ?? p.earned}</span>
        <div className="cb-pass-barcode" aria-hidden />
      </div>
    </div>
  );
}

export default function Tickets() {
  return (
    <section className="tickets" id="tickets">
      <div className="tickets-stage" id="ticketsStage">
        {/* DOM order matches the original rig: t0,t2,t1,t3,t5,t4 */}
        <article className="pass" data-i="0"><PassCard p={PASSES[0]} /></article>
        <article className="pass" data-i="1"><PassCard p={PASSES[2]} /></article>
        <article className="pass" data-i="2"><PassCard p={PASSES[1]} /></article>
        <article className="pass" data-i="3"><PassCard p={PASSES[3]} /></article>
        <article className="pass" data-i="4"><PassCard p={PASSES[5]} /></article>
        <article className="pass" data-i="5"><PassCard p={PASSES[4]} /></article>
      </div>
    </section>
  );
}
