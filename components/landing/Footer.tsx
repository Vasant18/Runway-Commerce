const FC_BIG_ARROW = `<span class="fc-fire"><svg class="fc-big-arrow" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.086 0.424667L32.4375 15.8262L17.0847 31.2277L8.37224 31.2277L20.6941 18.9058L0.408366 18.9058L0.408367 12.7452L20.6941 12.7452L8.37361 0.424666L17.086 0.424667Z" fill="#F9A600"></path></svg></span>`;

const FC_MINI_ARROW = `<svg class="fc-mini-arrow" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 10"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.08954 0H5.60221L10.5 4.99998L5.60174 10H4.08906L8.45709 5.55531L0.5 5.55531V4.4442L8.45709 4.4442L4.08954 0Z" fill="#192227"></path></svg>`;

const FL_THIN = `<svg class="fl-thin" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.086 0.424667L32.4375 15.8262L17.0847 31.2277L8.37224 31.2277L20.6941 18.9058L0.408366 18.9058L0.408367 12.7452L20.6941 12.7452L8.37361 0.424666L17.086 0.424667Z" fill="#FDFCFC"></path></svg>`;

export default function Footer() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-stripes" aria-hidden="true"><span></span><span></span><span></span></div>
      <div className="footer-word" aria-hidden="true"><span className="footer-logo">Runway</span></div>
      <div className="footer-grid">
        <div className="footer-card">
          <div className="fc-head">
            <div className="fc-icon" dangerouslySetInnerHTML={{ __html: FC_BIG_ARROW }} />
            <p className="fc-tag">Shop the world,<br />for humans.</p>
          </div>
          <div className="fc-legal">
            <div className="fc-row">&#169; 2026 Runway Marketplace</div>
            <div className="fc-row fc-links"><a href="#top"><span dangerouslySetInnerHTML={{ __html: FC_MINI_ARROW }} /> Terms</a><a href="#top"><span dangerouslySetInnerHTML={{ __html: FC_MINI_ARROW }} /> Privacy</a></div>
          </div>
        </div>
        <nav className="footer-list" aria-label="Footer">
          <a href="#amenities">How it works <span dangerouslySetInnerHTML={{ __html: FL_THIN }} /></a>
          <a href="#builtfor">Travelers <span dangerouslySetInnerHTML={{ __html: FL_THIN }} /></a>
          <a href="#betterway">Buyers <span dangerouslySetInnerHTML={{ __html: FL_THIN }} /></a>
          <a href="#builtfor">Trust &amp; Safety <span dangerouslySetInnerHTML={{ __html: FL_THIN }} /></a>
          <a href="#footer">Contact <span dangerouslySetInnerHTML={{ __html: FL_THIN }} /></a>
          <a href="#top">Twitter <span dangerouslySetInnerHTML={{ __html: FL_THIN }} /></a>
          <a href="#top">LinkedIn <span dangerouslySetInnerHTML={{ __html: FL_THIN }} /></a>
        </nav>
      </div>
    </footer>
  );
}
