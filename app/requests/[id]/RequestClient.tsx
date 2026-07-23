"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";

export function DecideOffer({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function decide(action: "accept" | "decline") {
    setBusy(true); setError(null);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }),
    });
    setBusy(false);
    const d = await res.json().catch(() => ({}));
    if (!res.ok) { setError(d.error ?? "Failed."); return; }
    if (action === "accept" && d.orderId) { router.push(`/orders/${d.orderId}`); return; }
    router.refresh();
  }
  return (
    <div className="cb-actions-row">
      <button className="cb-cta" disabled={busy} onClick={() => decide("accept")}>Accept offer</button>
      <button className="cb-cta ghost-ink" disabled={busy} onClick={() => decide("decline")}>Decline</button>
      {error && <p className="cb-error">{error}</p>}
    </div>
  );
}

export function OfferToCarry({ requestId, trips }: { requestId: string; trips: Array<{ id: string; label: string }> }) {
  const router = useRouter();
  const [tripId, setTripId] = useState(trips[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function offer(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/matches", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ requestId, tripId }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed."); return; }
    router.refresh();
  }
  if (trips.length === 0) {
    return <p className="cb-instr">Post an upcoming trip first, then come back to offer to carry this. <a href="/trips/new">Post a trip →</a></p>;
  }
  return (
    <form className="cb-offer" onSubmit={offer}>
      <Select label="Carry it on" value={tripId} onChange={e => setTripId(e.target.value)}>
        {trips.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
      </Select>
      <button className="cb-submit cb-submit-sm" disabled={busy}>{busy ? "Offering…" : "Offer to carry"}</button>
      {error && <p className="cb-error">{error}</p>}
    </form>
  );
}
