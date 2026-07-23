"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/ui/Field";

export default function TripForm() {
  const router = useRouter();
  const [form, setForm] = useState({ fromCountry: "", toCountry: "", departDate: "", arriveDate: "", luggageCapacityKg: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/trips", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Could not post trip."); return; }
    router.push("/dashboard");
  }

  return (
    <form className="cb-auth-card cb-form" onSubmit={onSubmit}>
      <h1>Post a trip</h1>
      <div className="cb-form-row">
        <Field label="From country" value={form.fromCountry} onChange={e => setForm({ ...form, fromCountry: e.target.value })} />
        <Field label="To country" value={form.toCountry} onChange={e => setForm({ ...form, toCountry: e.target.value })} />
      </div>
      <div className="cb-form-row">
        <Field label="Departure" type="date" value={form.departDate} onChange={e => setForm({ ...form, departDate: e.target.value })} />
        <Field label="Arrival" type="date" value={form.arriveDate} onChange={e => setForm({ ...form, arriveDate: e.target.value })} />
      </div>
      <Field label="Spare luggage (kg, optional)" type="number" min="0" step="0.5" value={form.luggageCapacityKg} onChange={e => setForm({ ...form, luggageCapacityKg: e.target.value })} />
      {error && <p className="cb-error">{error}</p>}
      <button className="cb-submit" disabled={busy}>{busy ? "Posting…" : "Post trip"}</button>
    </form>
  );
}
