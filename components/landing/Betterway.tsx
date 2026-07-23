const BW_PATHS = `<svg class="bw-paths" viewBox="0 0 1440 3325" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M928.999 1070.39L928.999 863C928.999 642.086 1108.09 463 1329 463L1440.22 463" stroke="#4A5357" stroke-width="30"/>
      <path d="M929 1001L929 415.001C929 194.087 749.913 15.0002 528.999 15.0005L-0.0078125 15.0012" stroke="#4A5357" stroke-width="30"/>
      <path d="M96.3359 3289.47V1549.47C96.3359 1439.01 185.879 1349.47 296.336 1349.47H728.997C839.454 1349.47 928.997 1259.87 928.997 1149.41C928.998 897.4 928.999 707.809 929 415C929 194.086 1108.09 15 1329 15H1439.99" stroke="#4A5357" stroke-width="30"/>
      <path class="runway-is-better-path-0" d="M928.999 1070.39L928.999 863C928.999 642.086 1108.09 463 1329 463L1440.22 463" stroke-linecap="round" stroke="#FFC655" stroke-width="30"/>
      <path class="runway-is-better-path-1" d="M929 1001L929 415.001C929 194.087 749.913 15.0002 528.999 15.0005L-0.0078125 15.0012" stroke="#DD8411" stroke-linecap="round" stroke-width="30"/>
      <path class="runway-is-better-path-2" d="M96.3359 3289.47V1549.47C96.3359 1439.01 185.879 1349.47 296.336 1349.47H728.997C839.454 1349.47 928.997 1259.87 928.997 1149.41C928.998 897.4 928.999 707.809 929 415C929 194.086 1108.09 15 1329 15H1439.99" stroke="#F9A600" stroke-linecap="round" stroke-width="30"/>
      <circle class="circle circle-1" cx="96.3359" cy="3287.36" r="37.5" fill="#4A5357"/>
      <g class="check check-1">
        <rect x="63.8359" y="3254.86" width="65" height="65" rx="32.5" fill="#192227"/>
        <path d="M79.0313 3288.77L95.3675 3302.15" stroke="#FDFCFC" stroke-width="5.2"/>
        <path d="M115.375 3274.34L91.7476 3302.45" stroke="#FDFCFC" stroke-width="5.2"/>
      </g>
      <circle class="circle circle-2" cx="96.334" cy="2442.84" r="37.5" fill="#4A5357"/>
      <g class="check check-2">
        <rect x="63.834" y="2410.34" width="65" height="65" rx="32.5" fill="#192227"/>
        <path d="M79.0293 2444.25L95.3656 2457.63" stroke="#FDFCFC" stroke-width="5.2"/>
        <path d="M115.373 2429.82L91.7456 2457.94" stroke="#FDFCFC" stroke-width="5.2"/>
      </g>
      <circle class="circle circle-3" cx="96.3359" cy="1596.2" r="37.5" fill="#4A5357"/>
      <g class="check check-3">
        <rect x="63.8359" y="1563.7" width="65" height="65" rx="32.5" fill="#192227"/>
        <path d="M79.0313 1597.61L95.3675 1610.99" stroke="#FDFCFC" stroke-width="5.2"/>
        <path d="M115.375 1583.18L91.7476 1611.3" stroke="#FDFCFC" stroke-width="5.2"/>
      </g>
    </svg>`;

const BADGE = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 31"><path d="M32.7188 30.2092L25.6611 30.1823L29.01 13.9866L12.2259 29.4822C11.7383 29.9323 11.099 30.1823 10.4353 30.1823H0.350586L24.5691 7.7427L9.97643 7.72816L12.817 1.29864C13.0989 0.660689 13.7309 0.24938 14.4283 0.250001L34.8251 0.268164C37.6565 0.269449 39.7495 2.90594 39.1084 5.66374L34.4507 28.7968C34.2848 29.6208 33.5593 30.2124 32.7188 30.2092Z" fill="#192227"/></svg>`;

const CARD_ICON_B1 = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61 60"><path fill-rule="evenodd" clip-rule="evenodd" d="M44.3474 12.8351C44.3474 12.3514 44.057 11.915 43.6108 11.7282L30.3849 6.19176C30.0916 6.06897 29.7615 6.06763 29.4672 6.18803L15.9418 11.7211C15.4908 11.9056 15.1962 12.3445 15.1962 12.8318V25.9583L2.68455 31.1612C2.23696 31.3473 1.94531 31.7845 1.94531 32.2692V46.8016C1.94531 47.2827 2.23274 47.7174 2.67552 47.9058L16.5302 53.8003C16.8299 53.9278 17.1685 53.928 17.4684 53.8009L29.7715 48.585L42.0746 53.8009C42.3745 53.928 42.7131 53.9278 43.0128 53.8003L56.8675 47.9058C57.3103 47.7174 57.5977 47.2827 57.5977 46.8016V32.2692C57.5977 31.7845 57.3061 31.3473 56.8585 31.1612L44.3474 25.9583V12.8351ZM41.1081 49.5532V39.2571L31.6855 35.2624V45.5585L41.1081 49.5532ZM27.8575 20.2663L18.7297 16.3544V26.0324L27.8575 29.6836V20.2663ZM5.4788 34.9644L14.9014 38.9733V49.2673L5.4788 45.2584V34.9644ZM34.1915 32.4869L42.5417 36.027L51.1346 32.3711L42.6665 29.0968L34.1915 32.4869ZM29.6325 17.1827L20.9839 13.4762L29.9113 9.82408L38.5613 13.445L29.6325 17.1827ZM16.8768 29.097L25.3518 32.487L17.0019 36.027L8.40899 32.3711L16.8768 29.097Z" fill="#192227"/></svg>`;

const CARD_ICON_B2 = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 30"><path fill-rule="evenodd" clip-rule="evenodd" d="M20.8636 14.5705L15.721 9.42781L20.4346 4.71419L18.7204 3L14.0068 7.71362L11.0064 4.71319L9.29216 6.42739L23.8628 20.998L25.577 19.2838L22.5778 16.2847L27.2909 11.5716L25.5767 9.85744L20.8636 14.5705ZM21.7206 20.5706L9.7212 8.57128L5.40987 12.8826C4.00405 14.2884 4.00405 16.5677 5.40986 17.9735L6.29255 18.8562L5.42693 19.7218C4.95833 20.1904 4.95833 20.9502 5.42693 21.4188L6.29339 22.2852L3.29297 25.2857L5.00716 26.9999L8.00759 23.9994L8.87255 24.8644C9.34115 25.333 10.1009 25.333 10.5695 24.8644L11.4351 23.9988L12.3183 24.882C13.7241 26.2878 16.0034 26.2878 17.4092 24.882L21.7206 20.5706Z" fill="#192227"/></svg>`;

const CARD_ICON_B3 = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61 60"><path fill-rule="evenodd" clip-rule="evenodd" d="M18.3477 12.9773C20.1559 12.9773 21.6218 11.5114 21.6218 9.70313C21.6218 7.89486 20.1559 6.42898 18.3477 6.42898C16.5394 6.42898 15.0735 7.89486 15.0735 9.70313C15.0735 11.5114 16.5394 12.9773 18.3477 12.9773ZM20.7474 16.4968C23.5458 15.5084 25.5508 12.8399 25.5508 9.70313C25.5508 5.72495 22.3258 2.5 18.3477 2.5C14.3695 2.5 11.1445 5.72495 11.1445 9.70313C11.1445 12.8397 13.1493 15.5081 15.9474 16.4967V35.1234C16.6277 34.0094 17.5288 33.1119 18.6319 32.4118C19.2951 31.991 20.0106 31.6599 20.7474 31.3944V16.4968ZM18.3477 53.5763C20.1559 53.5763 21.6218 52.1105 21.6218 50.3022C21.6218 48.4939 20.1559 47.0281 18.3477 47.0281C16.5394 47.0281 15.0735 48.4939 15.0735 50.3022C15.0735 52.1105 16.5394 53.5763 18.3477 53.5763ZM18.3477 57.5053C22.3258 57.5053 25.5508 54.2804 25.5508 50.3022C25.5508 47.1654 23.5458 44.497 20.7474 43.5085V42.2012C20.7474 40.6507 21.0566 39.6321 21.4614 38.9306C21.8619 38.2366 22.4498 37.6898 23.278 37.2293C25.0059 36.2688 27.3676 35.8644 30.3454 35.3544L30.8 35.2765C33.7282 34.7735 37.2671 34.1305 40.0246 32.2564C42.583 30.5175 44.2689 27.8862 44.719 24.0825C47.6917 23.1953 49.8589 20.4404 49.8589 17.1793C49.8589 13.2011 46.634 9.97614 42.6558 9.97614C38.6776 9.97614 35.4527 13.2011 35.4527 17.1793C35.4527 20.1857 37.2946 22.762 39.9115 23.8412C39.5625 26.207 38.5408 27.4611 37.3264 28.2865C35.5665 29.4826 33.0823 30.0141 29.9873 30.5458C29.7564 30.5855 29.521 30.6253 29.2818 30.6656C26.5899 31.1202 23.4277 31.6543 20.9457 33.0341C19.5154 33.8293 18.221 34.9423 17.3039 36.5316C16.5061 37.9142 16.0666 39.531 15.9686 41.3851H15.9474V42.2012V43.5087C13.1493 44.4973 11.1445 47.1656 11.1445 50.3022C11.1445 54.2804 14.3695 57.5053 18.3477 57.5053ZM45.9299 17.1793C45.9299 18.9875 44.464 20.4534 42.6558 20.4534C40.8475 20.4534 39.3816 18.9875 39.3816 17.1793C39.3816 15.371 40.8475 13.9051 42.6558 13.9051C44.464 13.9051 45.9299 15.371 45.9299 17.1793Z" fill="#192227"/></svg>`;

const CARD_ICON_E1 = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61 60"><path fill-rule="evenodd" clip-rule="evenodd" d="M12.8305 6C10.8422 6 9.23047 7.61177 9.23047 9.59998V50.3998C9.23047 52.3881 10.8422 53.9998 12.8305 53.9998H48.8303C50.8185 53.9998 52.4303 52.3881 52.4303 50.3998V9.59999C52.4303 7.61177 50.8185 6 48.8303 6H12.8305ZM14.0282 17.9976C14.0282 14.0212 17.2517 10.7977 21.228 10.7976V17.9974H28.4281V17.9976C28.4281 21.974 25.2046 25.1976 21.2282 25.1976C17.2517 25.1976 14.0282 21.974 14.0282 17.9976ZM14.0306 29.9997H38.0305V34.7997H14.0306V29.9997ZM47.6305 39.5996H14.0306V44.3996H47.6305V39.5996Z" fill="#192227"/></svg>`;

const CARD_ICON_E2 = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"><path fill-rule="evenodd" clip-rule="evenodd" d="M37.1991 17.9968C37.1991 19.3223 38.2736 20.3968 39.5991 20.3968L56.399 20.3968C57.7245 20.3968 58.799 19.3223 58.799 17.9968L58.799 13.1969C58.799 11.8714 57.7245 10.7969 56.399 10.7969L39.5991 10.7969C38.2736 10.7969 37.1991 11.8714 37.1991 13.1969L37.1991 13.7969L37.1991 17.3969L37.1991 17.9968ZM34.7991 13.7969L23.769 13.7969C20.7867 13.7969 18.369 16.2145 18.369 19.1968L18.369 26.3968C18.369 27.3909 17.5631 28.1968 16.569 28.1968L7.48783 28.1968L7.48222 28.1968L3.59921 28.1968L1.19922 28.1968L1.19922 31.7968L3.59921 31.7968L7.48222 31.7968L7.48409 31.7968C8.47734 31.7978 9.28221 32.6033 9.28221 33.5968L9.28221 40.7968C9.28221 43.7791 11.6999 46.1968 14.6822 46.1968L19.454 46.1968L19.454 42.5968L14.6822 42.5968C13.6881 42.5968 12.8822 41.7909 12.8822 40.7968L12.8822 33.5968C12.8822 32.9657 12.7739 32.3598 12.5749 31.7968L16.569 31.7968L26.3991 31.7968L26.3991 28.1968L21.6617 28.1968C21.8607 27.6338 21.969 27.028 21.969 26.3968L21.969 19.1968C21.969 18.2027 22.7749 17.3969 23.769 17.3969L34.7991 17.3969L34.7991 13.7969ZM28.7991 32.3968L28.7991 31.7968L28.7991 28.1968L28.7991 27.5968C28.7991 26.2713 29.8736 25.1968 31.1991 25.1968L47.9991 25.1968C49.3245 25.1968 50.3991 26.2713 50.3991 27.5968L50.3991 32.3968C50.3991 33.7223 49.3245 34.7968 47.9991 34.7968L31.1991 34.7968C29.8736 34.7968 28.7991 33.7223 28.7991 32.3968ZM21.5991 46.7968C21.5991 48.1222 22.6737 49.1967 23.9991 49.1967L40.7991 49.1967C42.1246 49.1967 43.1991 48.1222 43.1991 46.7968L43.1991 41.9968C43.1991 40.6713 42.1246 39.5968 40.7991 39.5968L23.9991 39.5968C22.6737 39.5968 21.5991 40.6713 21.5991 41.9968L21.5991 46.7968Z" fill="#192227"/></svg>`;

const CARD_ICON_E3 = `<svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 61 60"><path fill-rule="evenodd" clip-rule="evenodd" d="M41.0961 4.99545L23.7513 4.79687L18.9812 9.66035L32.8782 9.79687L9.49609 33.6365L13.072 37.1437L36.454 13.3041L36.8599 27.1974L41.63 22.3339L41.0961 4.99545ZM21.3219 55.4563L20.7613 38.1194L25.5241 33.2487L25.9508 47.1399L49.297 23.2652L52.8782 26.7671L29.5319 50.6418L43.4306 50.7574L38.6678 55.6281L21.3219 55.4563Z" fill="#192227"/></svg>`;

export default function Betterway() {
  return (
    <section className="bw-rig" id="betterway">
      <span dangerouslySetInnerHTML={{ __html: BW_PATHS }} />

      <div className="bw-badge" dangerouslySetInnerHTML={{ __html: BADGE }} />
      <div className="bw-hide"><h2 className="bw-title runway-is-better-text">A better way to shop across borders.</h2></div>
      <div className="bw-hide"><p className="bw-sub runway-is-better-text">Buyers save, travelers earn, and every order is protected — a marketplace built for everyone involved.</p></div>

      <div className="bw-sections">
        <div className="bw-section" id="builtfor">
          <div className="bw-titlewrap"><h3 className="bw-h3 title-0">Built for Buyers</h3></div>
          <div className="bw-cards">
            <article className="bw-card card-Designed-for-Finance">
              <div className="bwc-top">
                <div className="bwc-icon" dangerouslySetInnerHTML={{ __html: CARD_ICON_B1 }} />
                <h4 className="bwc-title">Save on every order</h4>
              </div>
              <p className="bwc-text">Get products that are cheaper abroad and skip import markups — pay the origin price plus a small reward and fee.</p>
              <img className="bwc-img" src="/assets/img/card-modeling.webp" alt="Save on every order" loading="eager" />
            </article>
            <article className="bw-card card-Designed-for-Finance">
              <div className="bwc-top">
                <div className="bwc-icon" dangerouslySetInnerHTML={{ __html: CARD_ICON_B2 }} />
                <h4 className="bwc-title">Access the unavailable</h4>
              </div>
              <p className="bwc-text">Reach products not sold in your country at all, carried back by someone already making the trip.</p>
              <img className="bwc-img" src="/assets/img/card-keymetrics.webp" alt="Access the unavailable" loading="eager" />
            </article>
            <article className="bw-card card-Designed-for-Finance">
              <div className="bwc-top">
                <div className="bwc-icon" dangerouslySetInnerHTML={{ __html: CARD_ICON_B3 }} />
                <h4 className="bwc-title">Pay with confidence</h4>
              </div>
              <p className="bwc-text">Your money sits in escrow until you confirm delivery, so you&#8217;re never out of pocket for an order that doesn&#8217;t arrive.</p>
              <img className="bwc-img" src="/assets/img/card-scenarios.webp" alt="Pay with confidence" loading="eager" />
            </article>
          </div>
        </div>

        <div className="bw-section">
          <div className="bw-titlewrap"><h3 className="bw-h3 title-1">Built for Travelers</h3></div>
          <div className="bw-cards">
            <article className="bw-card card-Built-for-Executives">
              <div className="bwc-top">
                <div className="bwc-icon" dangerouslySetInnerHTML={{ __html: CARD_ICON_E1 }} />
                <h4 className="bwc-title">Earn on trips you&#8217;re taking</h4>
              </div>
              <p className="bwc-text">Turn spare luggage space into income on journeys you&#8217;re already making — no extra travel required.</p>
              <img className="bwc-img" src="/assets/img/card-plans.webp" alt="Earn on trips you're taking" loading="eager" />
            </article>
            <article className="bw-card card-Built-for-Executives">
              <div className="bwc-top">
                <div className="bwc-icon" dangerouslySetInnerHTML={{ __html: CARD_ICON_E2 }} />
                <h4 className="bwc-title">Accept what suits you</h4>
              </div>
              <p className="bwc-text">Browse nearby requests and accept only the ones that fit your route, dates, and comfort.</p>
              <img className="bwc-img" src="/assets/img/card-investor.webp" alt="Accept what suits you" loading="eager" />
            </article>
            <article className="bw-card card-Built-for-Executives">
              <div className="bwc-top">
                <div className="bwc-icon" dangerouslySetInnerHTML={{ __html: CARD_ICON_E3 }} />
                <h4 className="bwc-title">Build a reputation</h4>
              </div>
              <p className="bwc-text">Great ratings unlock more requests and higher rewards as you become a trusted traveler.</p>
              <img className="bwc-img" src="/assets/img/card-headcount.webp" alt="Build a reputation" loading="eager" />
            </article>
          </div>
        </div>

        <div className="bw-section">
          <div className="bw-titlewrap"><h3 className="bw-h3 title-2">Built on Trust</h3></div>
          <div className="bw-titlewrap"><p className="bw-humans text-2">Identity verification, escrow payments, ratings, and dispute resolution keep every exchange safe — so buyers and travelers can transact with confidence, legally and transparently.</p></div>
        </div>
      </div>
    </section>
  );
}
