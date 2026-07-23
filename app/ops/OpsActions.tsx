"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Select from "@/components/ui/Select";
import Field from "@/components/ui/Field";
import { formatMoney } from "@/lib/money";

// Ops actions per queue stage. Each renders the minimal control + button.

export function ReceiveAtHub({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function go() {
    setBusy(true); setError(null);
    const res = await fetch(`/api/orders/${orderId}/advance`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "receive_hub" }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed."); return; }
    router.refresh();
  }
  return <div><button className="cb-cta" disabled={busy} onClick={go}>Receive at hub</button>{error && <p className="cb-error">{error}</p>}</div>;
}

export function AssignCourier({ orderId, partners }: { orderId: string; partners: Array<{ name: string; feeMinor: number }> }) {
  const router = useRouter();
  const [partner, setPartner] = useState(partners[0]?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fee = partners.find(p => p.name === partner)?.feeMinor;
  async function go() {
    setBusy(true); setError(null);
    const res = await fetch(`/api/orders/${orderId}/advance`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "assign_courier", partner }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed."); return; }
    router.refresh();
  }
  return (
    <div className="cb-ops-action">
      <Select label="Delivery partner" value={partner} onChange={e => setPartner(e.target.value)}>
        {partners.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
      </Select>
      {fee != null && <span className="cb-ops-fee">fee {formatMoney(fee, "USD")}</span>}
      <button className="cb-cta" disabled={busy || !partner} onClick={go}>Assign courier</button>
      {error && <p className="cb-error">{error}</p>}
    </div>
  );
}

export function DeliverWithOtp({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch(`/api/orders/${orderId}/advance`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "deliver", otp }),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Failed."); return; }
    router.refresh();
  }
  return (
    <form className="cb-ops-action" onSubmit={go}>
      <Field label="Buyer's OTP" inputMode="numeric" pattern="\d{6}" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="6 digits" />
      <button className="cb-cta" disabled={busy || otp.length !== 6}>Confirm delivered</button>
      {error && <p className="cb-error">{error}</p>}
    </form>
  );
}
