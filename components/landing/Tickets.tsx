// Testimonials as DOM tickets recreating the original runway.com two-panel art:
// left stub = oval avatar + NAME + role, right panel = oversized quote.
// CRITICAL: the .pass wrappers (count=6, DOM order, data-i) are the GSAP conveyor's
// hooks (LandingEffects "tickets" rig) — only the INNER card content may change.

type Pass = {
  initials: string;
  name: string;
  role: string;
  quote: string;
  variant: "amber" | "dark";
};

const PASSES: Pass[] = [
  {
    initials: "AR", name: "Ananya Rao", role: "Buyer · Bengaluru", variant: "amber",
    quote: "I saved almost half on a camera that isn't even sold here yet. Payment only released when I typed the OTP at my door.",
  },
  {
    initials: "FS", name: "Farhan Souza", role: "Traveler · Dubai", variant: "dark",
    quote: "I already fly this route every month. Carrying one sealed box paid for my checked bag and dinner — no surprises.",
  },
  {
    initials: "HS", name: "Hana Sato", role: "Buyer · Tokyo", variant: "amber",
    quote: "What sold me was the escrow. My money didn't move until the item was in my hands. Sealed, exactly the spec I asked for.",
  },
  {
    initials: "LO", name: "Liam O'Connor", role: "Traveler · London", variant: "dark",
    quote: "I landed, dropped the parcel at the hub, and a local courier took the last mile. Zero friction, rated like a pro.",
  },
  {
    initials: "PS", name: "Priya Sharma", role: "Buyer · Delhi", variant: "amber",
    quote: "Watching it move like a flight — purchased, boarded, landed, out for delivery — was addictive. Three days door to door.",
  },
  {
    initials: "DM", name: "Diego Martins", role: "Traveler · São Paulo", variant: "dark",
    quote: "Two trips a month, two carries a month. The math is transparent and the buyers are verified. My flights became income.",
  },
];

function PassCard({ p }: { p: Pass }) {
  return (
    <div className={`cb-tk cb-tk--${p.variant}`}>
      <div className="cb-tk-stub">
        <span className="cb-tk-avatar" aria-hidden>{p.initials}</span>
        <span className="cb-tk-name">{p.name}</span>
        <span className="cb-tk-role">{p.role}</span>
      </div>
      <div className="cb-tk-main">
        <p className="cb-tk-quote">“{p.quote}”</p>
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
