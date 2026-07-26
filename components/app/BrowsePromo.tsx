// E-commerce style browse furniture (Shopure/Amazon-inspired, aviation-skinned):
// promo hero banner + quick-filter chip row + trust-perks strip.

export function BrowseHero({ title, sub, ctaLabel, ctaHref }: {
  title: string; sub: string; ctaLabel: string; ctaHref: string;
}) {
  return (
    <section className="cb-bhero">
      <div className="cb-bhero-copy">
        <h1 className="cb-bhero-title">{title}</h1>
        <p className="cb-bhero-sub">{sub}</p>
        <a className="cb-bhero-cta" href={ctaHref}>{ctaLabel}
          <svg viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden><path d="M17.086 0.424667L32.4375 15.8262L17.0847 31.2277L8.37224 31.2277L20.6941 18.9058L0.408366 18.9058L0.408367 12.7452L20.6941 12.7452L8.37361 0.424666L17.086 0.424667Z" fill="currentColor"/></svg>
        </a>
      </div>
      <svg className="cb-bhero-plane" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M2 16l20-6-9 4-2 6-2-4-7 0z" />
      </svg>
    </section>
  );
}

export function QuickChips({ items, param, base, active }: {
  items: string[]; param: string; base: string; active?: string;
}) {
  if (!items.length) return null;
  return (
    <nav className="cb-chips" aria-label="Quick filters">
      <a className={`cb-chip${!active ? " cb-chip-on" : ""}`} href={base}>All</a>
      {items.map(v => (
        <a key={v} className={`cb-chip${active === v ? " cb-chip-on" : ""}`}
           href={`${base}?${param}=${encodeURIComponent(v)}`}>{v}</a>
      ))}
    </nav>
  );
}

const PERKS = [
  { icon: "✈", title: "Carried on real flights", sub: "Track it like a flight, gate to door" },
  { icon: "🔒", title: "Escrow protected", sub: "Money moves only after OTP handoff" },
  { icon: "★", title: "Rated community", sub: "Verified buyers and travelers" },
];

export function PerksStrip() {
  return (
    <div className="cb-perks">
      {PERKS.map(p => (
        <div className="cb-perk" key={p.title}>
          <span className="cb-perk-icon" aria-hidden>{p.icon}</span>
          <div>
            <div className="cb-perk-title">{p.title}</div>
            <div className="cb-perk-sub">{p.sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
