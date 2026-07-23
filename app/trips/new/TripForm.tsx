"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/ui/Field";
import Select from "@/components/ui/Select";
import { AIRPORTS, airportByIata } from "@/lib/geo";

export default function TripForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    fromCountry: "", toCountry: "", departDate: "", arriveDate: "", luggageCapacityKg: "",
    airline: "", flightNumber: "", aircraft: "", departAirport: "", arriveAirport: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Picking an airport auto-fills the country to keep them consistent.
  function setAirport(key: "departAirport" | "arriveAirport", iata: string) {
    const ap = airportByIata(iata);
    const countryKey = key === "departAirport" ? "fromCountry" : "toCountry";
    setForm({ ...form, [key]: iata, ...(ap ? { [countryKey]: ap.country } : {}) });
  }

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
        <Select label="From airport" value={form.departAirport} onChange={e => setAirport("departAirport", e.target.value)}>
          <option value="">Pick…</option>
          {AIRPORTS.map(a => <option key={a.iata} value={a.iata}>{a.iata} — {a.city}</option>)}
        </Select>
        <Select label="To airport" value={form.arriveAirport} onChange={e => setAirport("arriveAirport", e.target.value)}>
          <option value="">Pick…</option>
          {AIRPORTS.map(a => <option key={a.iata} value={a.iata}>{a.iata} — {a.city}</option>)}
        </Select>
      </div>
      <div className="cb-form-row">
        <Field label="From country" value={form.fromCountry} onChange={e => setForm({ ...form, fromCountry: e.target.value })} />
        <Field label="To country" value={form.toCountry} onChange={e => setForm({ ...form, toCountry: e.target.value })} />
      </div>
      <div className="cb-form-row">
        <Field label="Departure" type="date" value={form.departDate} onChange={e => setForm({ ...form, departDate: e.target.value })} />
        <Field label="Arrival" type="date" value={form.arriveDate} onChange={e => setForm({ ...form, arriveDate: e.target.value })} />
      </div>
      <div className="cb-form-row">
        <Field label="Airline (optional)" value={form.airline} onChange={e => setForm({ ...form, airline: e.target.value })} placeholder="e.g. Emirates" />
        <Field label="Flight no. (optional)" value={form.flightNumber} onChange={e => setForm({ ...form, flightNumber: e.target.value })} placeholder="EK 202" />
      </div>
      <div className="cb-form-row">
        <Field label="Aircraft (optional)" value={form.aircraft} onChange={e => setForm({ ...form, aircraft: e.target.value })} placeholder="Airbus A380" />
        <Field label="Spare luggage (kg, optional)" type="number" min="0" step="0.5" value={form.luggageCapacityKg} onChange={e => setForm({ ...form, luggageCapacityKg: e.target.value })} />
      </div>
      {error && <p className="cb-error">{error}</p>}
      <button className="cb-submit" disabled={busy}>{busy ? "Posting…" : "Post trip"}</button>
    </form>
  );
}
