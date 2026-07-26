const HO_SUBSVG = `<svg class="ho-subsvg" viewBox="0 0 353 504" preserveAspectRatio="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M353 0H0V504H353V0ZM176.5 27C97.7994 27 34 90.7994 34 169.5V334.5C34 413.201 97.7994 477 176.5 477C255.201 477 319 413.201 319 334.5V169.5C319 90.7994 255.201 27 176.5 27Z" fill="#FDFCFC"/></svg>`;

const HO_RIM = `<svg class="ho-rim" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293 458"><g filter="url(#rimf)"><rect x="2" y="2" width="289" height="454" rx="144.5" stroke="url(#rimg)" stroke-width="4"/></g><defs><filter id="rimf" x="0" y="0" width="293" height="461.506" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/><feOffset dy="3.50617"/><feGaussianBlur stdDeviation="1.75308"/><feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/><feColorMatrix type="matrix" values="0 0 0 0 0.107083 0 0 0 0 0.0929167 0 0 0 0 0.0929167 0 0 0 0.05 0"/><feBlend mode="normal" in2="shape" result="effect1_innerShadow"/></filter><linearGradient id="rimg" x1="146.5" y1="4" x2="146.5" y2="454" gradientUnits="userSpaceOnUse"><stop stop-color="#E0DEDE"/><stop offset="1" stop-color="white"/></linearGradient></defs></svg>`;

// Hero flip-boards now cycle our delivery-partner logos (courier SVGs, tinted
// white via .fb-logo CSS). Structure/ids are the GSAP flip rig's hooks — same
// 8-card layout as the original, only the img sources changed.
function fbLogo(name: string) {
  return `<img class="fb-logo" src="/assets/img/partners/${name}.svg" alt="${name}">`;
}
function fbInner(id: string, seq: string[]) {
  let html = `<div class="fb-line"></div>`;
  html += `<div class="fb-card" id="${id}-card-0" style="z-index:8"><div class="fb-front"></div><div class="fb-back" id="${id}-back-0">${fbLogo(seq[0])}</div></div>`;
  for (let k = 1; k <= seq.length; k++) {
    const back = k < seq.length ? fbLogo(seq[k]) : "";
    html += `<div class="fb-card ${id}-card" id="${id}-card-${k}" style="z-index:${seq.length - k}"><div class="fb-front">${fbLogo(seq[k - 1])}</div><div class="fb-back" id="${id}-back-${k}">${back}</div></div>`;
  }
  return html;
}

const FB1_INNER = fbInner("fb1", ["fedex", "ups", "dhl", "usps", "dpd", "hermes", "deutschepost"]);
const FB2_INNER = fbInner("fb2", ["dpd", "fedex", "deutschepost", "hermes", "dhl", "ups", "usps"]);
const FB3_INNER = fbInner("fb3", ["usps", "hermes", "ups", "dpd", "deutschepost", "fedex", "dhl"]);

export default function Hero() {
  return (
    <>
      <div className="hero-overlay" id="heroOverlay" aria-label="Intro">
        <div className="ho-inner">
          <div className="ho-black ho-black-top"></div>
          <div className="ho-black ho-black-bottom"></div>
          <div className="ho-black ho-black-right"></div>
          <div className="ho-black ho-black-left"></div>
          <div className="ho-content">
            <div className="ho-left">
              <div className="ho-kicker">
                <span className="ho-ktext">XLS</span>
                <span className="ho-track">
                  <span className="ho-pill" id="hoPill"><svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 15"><path d="M0.0199581 3.8732C0.0095118 3.81065 0.0577426 3.7537 0.121158 3.7537L0.652631 3.7537C0.6814 3.7537 0.708847 3.76578 0.728281 3.78699L3.08289 6.35694C3.10232 6.37815 3.12977 6.39023 3.15854 6.39023L6.05767 6.39023C6.12533 6.39023 6.17447 6.32588 6.15665 6.26061L4.48321 0.129618C4.46539 0.0643445 4.51452 0 4.58219 0L5.66139 0C5.69351 0 5.72377 0.0150377 5.74317 0.0406346L10.5542 6.38954C10.5545 6.38997 10.555 6.39023 10.5555 6.39023L15.2859 6.39023C15.8988 6.39023 16.3956 6.88709 16.3956 7.5C16.3956 8.11291 15.8988 8.60977 15.2859 8.60977L10.5555 8.60977C10.555 8.60977 10.5545 8.61003 10.5542 8.61046L5.74317 14.9594C5.72377 14.985 5.69351 15 5.66139 15L4.58219 15C4.51452 15 4.46539 14.9357 4.48321 14.8704L6.15665 8.73939C6.17447 8.67412 6.12533 8.60977 6.05767 8.60977L3.15854 8.60977C3.12977 8.60977 3.10232 8.62185 3.08289 8.64306L0.728281 11.213C0.708847 11.2342 0.6814 11.2463 0.652631 11.2463L0.121158 11.2463C0.0577426 11.2463 0.00951179 11.1893 0.0199581 11.1268L0.622844 7.5169C0.624713 7.50571 0.624713 7.49429 0.622844 7.4831L0.0199581 3.8732Z" fill="#D1CECE" /></svg></span>
                  <span className="ho-kline"></span>
                </span>
                <span className="ho-ktext">RNW</span>
              </div>
              <h1 className="ho-title">Shop the world. Carried by travelers.</h1>
              <p className="ho-text">Runway connects you with travelers heading your way — get products that are cheaper abroad, delivered by real people.</p>
            </div>
            <div className="ho-subtract">
              <span dangerouslySetInnerHTML={{ __html: HO_SUBSVG }} />
              <span dangerouslySetInnerHTML={{ __html: HO_RIM }} />
              <div className="ho-white ho-white-left"></div>
              <div className="ho-white ho-white-right"></div>
              <div className="ho-white ho-white-top" id="hoWhiteTop"></div>
              <div className="ho-white ho-white-bottom" id="hoWhiteBottom"></div>
            </div>
          </div>
          <div className="ho-bottomrow">
            <div className="ho-logos">
              <div className="ho-flipboard" id="fb1" dangerouslySetInnerHTML={{ __html: FB1_INNER }} />
              <div className="ho-flipboard" id="fb2" dangerouslySetInnerHTML={{ __html: FB2_INNER }} />
              <div className="ho-flipboard" id="fb3" dangerouslySetInnerHTML={{ __html: FB3_INNER }} />
            </div>
            <a href="/signup" className="ho-btn early-access-tile">Early Access<span className="ho-btn-circle"><svg viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.086 0.424667L32.4375 15.8262L17.0847 31.2277L8.37224 31.2277L20.6941 18.9058L0.408366 18.9058L0.408367 12.7452L20.6941 12.7452L8.37361 0.424666L17.086 0.424667Z" fill="#FDFCFC" /></svg></span></a>
          </div>
        </div>
      </div>

      <section className="iproduct" id="iproduct">
        <div className="ip-inner" id="ipInner">
          <div className="ip-imgwrap" id="ipImgwrap">
            <img src="/assets/img/product-ui-desktop.webp" alt="Runway product interface" />
          </div>
        </div>
      </section>
    </>
  );
}
