const RUNWAY_PATH = `<svg class="runway-path" viewBox="0 0 1359 1015" preserveAspectRatio="xMinYMax meet" aria-hidden="true">
        <path class="rp-grey"  d="M17.1 1199.5L17.1 613.5C17.1 392.586 196.186 213.5 417.1 213.5L1581.43 213.5" stroke="#4A5357" stroke-width="30" fill="none"/>
        <path class="rp-grey2" d="M17.1 1199.5L17.1 0" stroke="#4A5357" stroke-width="30" fill="none"/>
        <path class="rp-amber" d="M17.1 1199.5L17.1 613.5C17.1 392.586 196.186 213.5 417.1 213.5L1581.43 213.5" stroke="#FFC655" stroke-width="30" stroke-linecap="round" fill="none"/>
        <path class="rp-orange" d="M17.1 1199.5L17.1 0" stroke="#DD8411" stroke-width="30" stroke-linecap="round" fill="none"/>
      </svg>`;

const TB_PLANE = `<svg class="tb-plane" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75"><path d="M27.734 44.2969L19.541 37.6847L21.6478 35.3888L29.6848 37.6847L33.8983 33.4602L23.2864 25.4705L26.5636 23.2664L42.8716 28.2255C46.4934 25.639 47.3339 25.0221 50.3288 23.563C50.7359 23.3647 51.1666 23.2185 51.6095 23.1236L53.8861 22.6359C54.8395 22.4316 55.8203 22.8355 56.3534 23.6519C57.0244 24.6794 56.7962 26.0515 55.8103 26.7822C46.7735 33.4802 33.5411 41.138 27.734 44.2969Z" fill="#192227"></path></svg>`;

const TB_GROUND = `<svg class="tb-ground" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75"><rect x="23.5938" y="48.6406" width="25" height="4" fill="#192227"></rect></svg>`;

export default function Takeoff() {
  return (
    <div className="takeoff" id="takeoff">
      <div dangerouslySetInnerHTML={{ __html: RUNWAY_PATH }} />
      <div className="takeoff-inner">
        <div className="takeoff-badge">
          <span dangerouslySetInnerHTML={{ __html: TB_PLANE }} />
          <span dangerouslySetInnerHTML={{ __html: TB_GROUND }} />
        </div>
        <h2 className="takeoff-title"><span className="line"><span>Ready for</span></span><span className="line"><span>Takeoff?</span></span></h2>
        <p className="takeoff-sub">Join CrossBorder and start shopping the world &#8212; or earning on your next trip.</p>
      </div>
    </div>
  );
}
