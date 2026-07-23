"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Role-appropriate action buttons for one order, driven by the server-provided
// list of available actions (computed via lib/orders on the server page).

export type AvailableAction = { action: string; label: string };

export default function OrderActions({
  orderId, actions, showOtp, canRate,
}: {
  orderId: string;
  actions: AvailableAction[];
  showOtp: string | null;   // buyer sees the OTP while out for delivery
  canRate: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  async function advance(action: string) {
    setBusy(true); setError(null);
    const res = await fetch(`/api/orders/${orderId}/advance`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Action failed."); return; }
    router.refresh();
  }

  async function rate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch(`/api/orders/${orderId}/rate`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ stars, comment }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Rating failed."); return; }
    router.refresh();
  }

  if (actions.length === 0 && !showOtp && !canRate) return null;

  return (
    <div className="cb-actions">
      {showOtp && (
        <div className="cb-otp">
          <span className="cb-otp-label">Your delivery OTP — share it only with the courier at your door</span>
          <span className="cb-otp-code">{showOtp}</span>
        </div>
      )}
      <div className="cb-actions-row">
        {actions.map(a => (
          <button key={a.action} className="cb-cta" disabled={busy} onClick={() => advance(a.action)}>
            {a.label}
          </button>
        ))}
      </div>
      {canRate && (
        <form className="cb-rate" onSubmit={rate}>
          <span className="cb-rate-label">Rate your counterpart</span>
          <div className="cb-rate-stars" role="radiogroup" aria-label="Stars">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" aria-label={`${n} stars`}
                className={n <= stars ? "cb-star on" : "cb-star"} onClick={() => setStars(n)}>★</button>
            ))}
          </div>
          <textarea className="cb-field-input cb-textarea" placeholder="How did it go? (shown on their profile)"
            value={comment} onChange={e => setComment(e.target.value)} />
          <button className="cb-submit cb-submit-sm" disabled={busy}>{busy ? "Sending…" : "Submit rating"}</button>
        </form>
      )}
      {error && <p className="cb-error">{error}</p>}
    </div>
  );
}
