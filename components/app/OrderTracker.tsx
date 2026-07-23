import { STAGE_ORDER, STAGE_LABELS } from "@/lib/orders";

// Amazon-style stage stepper rendered as a flight-itinerary strip.
// Pure presentational: derives done/active/pending from order.status.
const ICONS: Record<string, React.ReactNode> = {
  CREATED: <path d="M4 7h16v13H4z M4 7l8-4 8 4" />,
  PURCHASED: <path d="M6 6h12l-1.5 9h-9L6 6z M9 20a1.5 1.5 0 1 0 0-.01M16 20a1.5 1.5 0 1 0 0-.01" />,
  IN_TRANSIT: <path d="M2 16l20-6-9 4-2 6-2-4-7 0z" />,
  LANDED: <path d="M2 20h20M4 16l16-4M14 12l-3-7" />,
  AT_HUB: <path d="M3 20h18M5 20V9l7-5 7 5v11M9 20v-6h6v6" />,
  OUT_FOR_DELIVERY: <path d="M3 16V6h10v10M13 10h5l3 4v2h-2M6 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01" />,
  DELIVERED: <path d="M4 12l5 5L20 6" />,
  CONFIRMED: <path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.5-.8L12 3z" />,
};

export default function OrderTracker({ status, escrowStatus }: { status: string; escrowStatus: string }) {
  const activeIdx = STAGE_ORDER.indexOf(status as (typeof STAGE_ORDER)[number]);
  return (
    <div className="cb-tracker" role="list" aria-label="Order progress">
      {STAGE_ORDER.map((stage, i) => {
        const state = i < activeIdx ? "done" : i === activeIdx ? "active" : "pending";
        return (
          <div key={stage} role="listitem" className={`cb-tracker-step ${state}`}>
            <div className="cb-tracker-dot">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                {ICONS[stage]}
              </svg>
            </div>
            <span className="cb-tracker-label">{STAGE_LABELS[stage]}</span>
            {stage === "CREATED" && escrowStatus === "AWAITING_DEPOSIT" && (
              <span className="cb-tracker-note">awaiting escrow deposit</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
