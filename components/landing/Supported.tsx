// "Our delivery network" — same marquee rig (.inv-row/.inv-strip classes are the
// animation hooks), now with real courier brand logos (monochrome SVGs, tinted
// paper-white via CSS like the original investor strips) + capability pills.

const ROW1 = [
  ["fedex", "FedEx"],
  ["ups", "UPS"],
  ["dhl", "DHL"],
  ["usps", "USPS"],
] as const;

const ROW2 = [
  ["dpd", "DPD"],
  ["hermes", "Hermes"],
  ["deutschepost", "Deutsche Post"],
  ["dhl", "DHL"],
] as const;

function Logos({ items }: { items: readonly (readonly [string, string])[] }) {
  // content duplicated once, like the original strips, so the marquee loops seamlessly
  return (
    <>
      {items.map(([f, name], i) => <img className="inv-logo" key={`a${i}`} src={`/assets/img/partners/${f}.svg`} alt={name} />)}
      {items.map(([f, name], i) => <img className="inv-logo" key={`b${i}`} src={`/assets/img/partners/${f}.svg`} alt="" aria-hidden />)}
    </>
  );
}

function Pills({ names }: { names: string[] }) {
  return (
    <>
      {names.map((n, i) => <span className="inv-pill" key={`a${i}`}>{n}</span>)}
      {names.map((n, i) => <span className="inv-pill" key={`b${i}`} aria-hidden>{n}</span>)}
    </>
  );
}

export default function Supported() {
  return (
    <section className="supported" id="investors">
      <div className="sup-box">
        <div className="sup-card">
          <span className="sup-circle"><span className="sup-fire"><svg className="sup-arrow" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.086 0.424667L32.4375 15.8262L17.0847 31.2277L8.37224 31.2277L20.6941 18.9058L0.408366 18.9058L0.408367 12.7452L20.6941 12.7452L8.37361 0.424666L17.086 0.424667Z" fill="#F9A600"></path></svg></span></span>
          <h2>Our Delivery Network</h2>
          <p>After your traveler lands, we take over — local partners carry the last mile to your door</p>
        </div>
        <div className="sup-marquees">
          <div className="inv-row"><div className="inv-strip strip-l">
            <Logos items={ROW1} />
          </div></div>
          <div className="inv-row"><div className="inv-strip strip-r">
            <Logos items={ROW2} />
          </div></div>
          <div className="inv-row"><div className="inv-strip strip-l strip-slow">
            <Pills names={["OTP-verified handoff", "Live tracking", "Hub receiving", "Escrow protected", "Door-to-door", "Customs-aware"]} />
          </div></div>
        </div>
      </div>
    </section>
  );
}
