// Testimonials as DOM tickets recreating the original runway.com two-panel art:
// left stub = oval portrait photo + NAME + role, right panel = oversized quote.
// Photos are cropped from the original baked ticket art (pass-face-N.png) and each
// card keeps its original background color; startup logos removed, copy re-skinned.
// CRITICAL: the .pass wrappers (count=6, DOM order, data-i) are the GSAP conveyor's
// hooks (LandingEffects "tickets" rig) — only the INNER card content may change.

type Pass = {
  img: string;
  name: string;
  role: string;
  quote: string;
  bg: string;
};

const PASSES: Pass[] = [
  {
    img: "/assets/img/pass-face-0.png", bg: "#DE8410",
    name: "Kunal Saini", role: "Buyer · Bengaluru",
    quote: "The savings, tracking, and escrow are unlike any other way to shop abroad right now.",
  },
  {
    img: "/assets/img/pass-face-1.png", bg: "#FFC655",
    name: "Mike Madden", role: "Traveler · New York",
    quote: "You're flying with empty kilos if you don't have Runway. One carry pays for my checked bag.",
  },
  {
    img: "/assets/img/pass-face-2.png", bg: "#F9A600",
    name: "Prabhdeep Chawla", role: "Buyer · Dubai",
    quote: "For everything not sold here yet, we've moved entirely to Runway.",
  },
  {
    img: "/assets/img/pass-face-3.png", bg: "#F9A600",
    name: "Chris Gadek", role: "Buyer · London",
    quote: "Not paying import markups ever again is extraordinary.",
  },
  {
    img: "/assets/img/pass-face-4.png", bg: "#F9A600",
    name: "Tom Impallomeni", role: "Traveler · London",
    quote: "Escrow plus OTP delivery is magic. So much worry is saved having it all in one place.",
  },
  {
    img: "/assets/img/pass-face-5.png", bg: "#FFC655",
    name: "Tamasin Ford", role: "Buyer · Tokyo",
    quote: "I watched my order like a flight — purchased, boarded, landed, delivered. Three days door to door.",
  },
];

function PassCard({ p }: { p: Pass }) {
  // Two separate rounded panels with the dotted perforation running in the gap
  // between them — matching the original baked ticket art.
  return (
    <div className="cb-tk">
      <div className="cb-tk-stub" style={{ background: p.bg }}>
        <img className="cb-tk-photo" src={p.img} alt={`Portrait of ${p.name}`} />
        <span className="cb-tk-name">{p.name}</span>
        <span className="cb-tk-role">{p.role}</span>
      </div>
      <span className="cb-tk-dots" aria-hidden />
      <div className="cb-tk-main" style={{ background: p.bg }}>
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
