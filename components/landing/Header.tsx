import AuthNavLink from "./AuthNavLink";

function NavArrow() {
  return (
    <svg className="nav-thin-arrow" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 10">
      <path fillRule="evenodd" clipRule="evenodd" d="M4.08954 0H5.60221L10.5 4.99998L5.60174 10H4.08906L8.45709 5.55531L0.5 5.55531V4.4442L8.45709 4.4442L4.08954 0Z" fill="#192227" />
    </svg>
  );
}

export default function Header() {
  return (
    <>
    <header className="site-header" id="siteHeader">
      <a className="brand" href="#top" aria-label="Runway Home">
        <span className="brand-logo">Runway</span>
      </a>
      <nav className="main-nav" id="mainNav" aria-label="Primary">
        <AuthNavLink />
        <a className="nav-link" href="#betterway"><NavArrow /> How it works</a>
        <a className="nav-link" href="#builtfor"><NavArrow /> Travelers</a>
        <a className="nav-link" href="#footer"><NavArrow /> Contact</a>
      </nav>
      <div className="header-right">
        <button className="burger" id="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span><span></span></button>
        <a href="/signup" className="btn btn-amber btn-header">Get Early Access <svg className="btn-arrow-svg" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.086 0.424667L32.4375 15.8262L17.0847 31.2277L8.37224 31.2277L20.6941 18.9058L0.408366 18.9058L0.408367 12.7452L20.6941 12.7452L8.37361 0.424666L17.086 0.424667Z" fill="#F9A600"></path></svg></a>
      </div>
    </header>
    <div className="mobile-menu" id="mobileMenu">
      <a href="/login">Log In</a><a href="#amenities">How it works</a><a href="#builtfor">Travelers</a><a href="#footer">Contact</a>
    </div>
    </>
  );
}
