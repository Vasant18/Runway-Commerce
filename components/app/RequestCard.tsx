import { computeTotals, computeSavings, formatMoney } from "@/lib/money";
import { isSafeHttpUrl } from "@/lib/validation";

export type RequestCardData = {
  id: string; title: string; category: string | null; productUrl: string | null;
  originCountry: string; destinationCountry: string;
  productPrice: number; travelerReward: number; localPrice: number | null;
  currency: string; notes: string | null; buyer?: { fullName: string };
};

export default function RequestCard({ request }: { request: RequestCardData }) {
  const { platformFee, totalCost } = computeTotals(request);
  const savings = computeSavings(request.localPrice, totalCost);
  const c = request.currency;
  // defensive: never emit an href for a non-http(s) scheme (stored-XSS guard)
  const safeUrl = request.productUrl && isSafeHttpUrl(request.productUrl) ? request.productUrl : null;
  return (
    <article className="cb-card">
      <div className="cb-card-title">{request.title}</div>
      <div className="cb-card-meta">
        {request.originCountry} → {request.destinationCountry}{request.category ? ` · ${request.category}` : ""}
      </div>
      <dl className="cb-card-costs">
        <div><dt>Product</dt><dd>{formatMoney(request.productPrice, c)}</dd></div>
        <div><dt>Traveler reward</dt><dd>{formatMoney(request.travelerReward, c)}</dd></div>
        <div><dt>Est. platform fee</dt><dd>{formatMoney(platformFee, c)}</dd></div>
        <div className="cb-card-total"><dt>Total</dt><dd>{formatMoney(totalCost, c)}</dd></div>
      </dl>
      {savings != null && savings > 0 && <div className="cb-card-savings">You save {formatMoney(savings, c)}</div>}
      {safeUrl && <a className="cb-card-link" href={safeUrl} target="_blank" rel="noopener noreferrer">Product link ↗</a>}
      {request.buyer && <div className="cb-card-by">Buyer: {request.buyer.fullName}</div>}
    </article>
  );
}
