import { computeTotals, computeSavings, formatMoney } from "@/lib/money";
import { isSafeHttpUrl } from "@/lib/validation";
import StarRating from "./StarRating";

export type RequestCardData = {
  id: string; title: string; category: string | null; productUrl: string | null;
  originCountry: string; destinationCountry: string;
  productPrice: number; travelerReward: number; localPrice: number | null;
  currency: string; notes: string | null;
  buyer?: { fullName: string; ratingAvg?: number; ratingCount?: number };
};

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function RequestCard({ request, href }: { request: RequestCardData; href?: string }) {
  const { platformFee, totalCost } = computeTotals(request);
  const savings = computeSavings(request.localPrice, totalCost);
  const c = request.currency;
  // defensive: never emit an href for a non-http(s) scheme (stored-XSS guard)
  const safeUrl = request.productUrl && isSafeHttpUrl(request.productUrl) ? request.productUrl : null;
  const body = (
    <>
      <div className="cb-ticket-main">
        <div className="cb-ticket-title">{request.title}</div>
        <div className="cb-ticket-meta">
          {request.originCountry} → {request.destinationCountry}
          {request.category && <span className="cb-ticket-chip">{request.category}</span>}
        </div>
        <dl className="cb-card-costs">
          <div><dt>Product</dt><dd>{formatMoney(request.productPrice, c)}</dd></div>
          <div><dt>Traveler reward</dt><dd>{formatMoney(request.travelerReward, c)}</dd></div>
          <div><dt>Est. platform fee</dt><dd>{formatMoney(platformFee, c)}</dd></div>
          <div className="cb-card-total"><dt>Total</dt><dd>{formatMoney(totalCost, c)}</dd></div>
        </dl>
        {!href && safeUrl && <a className="cb-card-link" href={safeUrl} target="_blank" rel="noopener noreferrer">Product link ↗</a>}
        {request.buyer && (
          <div className="cb-ticket-who">
            <span className="cb-ticket-avatar" aria-hidden>{initials(request.buyer.fullName)}</span>
            <span className="cb-ticket-name">{request.buyer.fullName}</span>
            <StarRating avg={request.buyer.ratingAvg} count={request.buyer.ratingCount} />
          </div>
        )}
      </div>
      <div className="cb-ticket-stub">
        {savings != null && savings > 0 ? (
          <>
            <span className="cb-ticket-fig">{formatMoney(savings, c)}</span>
            <span className="cb-ticket-fig-label">You save</span>
          </>
        ) : (
          <>
            <span className="cb-ticket-fig">{formatMoney(totalCost, c)}</span>
            <span className="cb-ticket-fig-label">Total</span>
          </>
        )}
      </div>
    </>
  );
  if (href) return <a className="cb-ticket cb-card-link-wrap" href={href}>{body}</a>;
  return <article className="cb-ticket">{body}</article>;
}
