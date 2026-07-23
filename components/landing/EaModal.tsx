const BP_HOLO = `<span class="bp-holo"><svg class="bp-holo-arrow" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 31"><path d="M32.7188 30.2092L25.6611 30.1823L29.01 13.9866L12.2259 29.4822C11.7383 29.9323 11.099 30.1823 10.4353 30.1823H0.350586L24.5691 7.7427L9.97643 7.72816L12.817 1.29864C13.0989 0.660689 13.7309 0.24938 14.4283 0.250001L34.8251 0.268164C37.6565 0.269449 39.7495 2.90594 39.1084 5.66374L34.4507 28.7968C34.2848 29.6208 33.5593 30.2124 32.7188 30.2092Z" fill="#192227"></path></svg></span>`;

const FLIGHT_TICKER = `<div class="flight-ticker ft-dark ft-bp" aria-hidden="true"><span class="ft-code">XLS</span><span class="ft-track"><span class="ft-plane"><svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 15"><path d="M0.0199581 3.8732C0.0095118 3.81065 0.0577426 3.7537 0.121158 3.7537L0.652631 3.7537C0.6814 3.7537 0.708847 3.76578 0.728281 3.78699L3.08289 6.35694C3.10232 6.37815 3.12977 6.39023 3.15854 6.39023L6.05767 6.39023C6.12533 6.39023 6.17447 6.32588 6.15665 6.26061L4.48321 0.129618C4.46539 0.0643445 4.51452 0 4.58219 0L5.66139 0C5.69351 0 5.72377 0.0150377 5.74317 0.0406346L10.5542 6.38954C10.5545 6.38997 10.555 6.39023 10.5555 6.39023L15.2859 6.39023C15.8988 6.39023 16.3956 6.88709 16.3956 7.5C16.3956 8.11291 15.8988 8.60977 15.2859 8.60977L10.5555 8.60977C10.555 8.60977 10.5545 8.61003 10.5542 8.61046L5.74317 14.9594C5.72377 14.985 5.69351 15 5.66139 15L4.58219 15C4.51452 15 4.46539 14.9357 4.48321 14.8704L6.15665 8.73939C6.17447 8.67412 6.12533 8.60977 6.05767 8.60977L3.15854 8.60977C3.12977 8.60977 3.10232 8.62185 3.08289 8.64306L0.728281 11.213C0.708847 11.2342 0.6814 11.2463 0.652631 11.2463L0.121158 11.2463C0.0577426 11.2463 0.00951179 11.1893 0.0199581 11.1268L0.622844 7.5169C0.624713 7.50571 0.624713 7.49429 0.622844 7.4831L0.0199581 3.8732Z" fill="#192227"></path></svg></span></span><span class="ft-code">RNW</span></div>`;

const GA_CIRCLE = `<span class="ga-circle"><svg class="ga-arrow" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.086 0.424667L32.4375 15.8262L17.0847 31.2277L8.37224 31.2277L20.6941 18.9058L0.408366 18.9058L0.408367 12.7452L20.6941 12.7452L8.37361 0.424666L17.086 0.424667Z" fill="#F9A600"></path></svg></span>`;

export default function EaModal() {
  return (
    <div className="ea-modal" id="eaModal" aria-hidden="true">
      <button className="ea-back" id="eaBack">Back to site</button>
      <div className="ea-modal-inner">
        <div className="boarding-pass">
          <div className="bp-left-card">
            <div className="bp-stub-l" aria-hidden="true"><img src="/assets/img/barcode.webp" alt="" /></div>
            <div className="bp-main">
              <div className="bp-main-top">
                <h2>Get Early<br />Access</h2>
                <span dangerouslySetInnerHTML={{ __html: BP_HOLO }} />
              </div>
              <div dangerouslySetInnerHTML={{ __html: FLIGHT_TICKER }} />
              <div className="bp-labels" aria-hidden="true"><span>Status</span><span>Seat</span><span>Group</span></div>
              <div className="bp-values"><b>NOW BOARDING</b><b>1A</b><b>FIRST CLASS</b></div>
              <div className="bp-qr-row">
                <img className="bp-qr" src="/assets/img/qrcode.webp" alt="" />
                <p>CrossBorder&#8217;s verified travelers and secure escrow get your order moving in days &#8212; not weeks. Post a request and match with someone flying your way.</p>
              </div>
            </div>
          </div>{/* /bp-left-card */}
          <form className="bp-stub-r" id="accessFormM" noValidate>
            <div className="bp-meta">
              <span className="bp-num"><i className="bp-hash">#</i> <b id="bpNumM">RNW8799</b></span>
              <span className="bp-date"><label>Date</label> <b id="bpDateM">22 JUL. 2026</b></span>
            </div>
            <div className="bp-fields">
              <div className="bp-field"><input id="fnameM" name="name" type="text" autoComplete="name" placeholder="First &amp; Last Name" required /></div>
              <div className="bp-field"><input id="femailM" name="email" type="email" autoComplete="email" placeholder="Work Email" required /></div>
            </div>
            <a className="btn-getaccess" href="/signup">Get Access <span dangerouslySetInnerHTML={{ __html: GA_CIRCLE }} /></a>
            <p className="bp-done" id="bpDoneM" hidden>&#10003; You&#8217;re on the list. Boarding soon.</p>
          </form>
          <div className="bp-perf" aria-hidden="true"><img src="/assets/img/bp-dots.webp" alt="" /><img src="/assets/img/bp-dots.webp" alt="" /></div>
        </div>
      </div>
    </div>
  );
}
