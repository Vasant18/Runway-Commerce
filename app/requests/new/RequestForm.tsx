"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Field from "@/components/ui/Field";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { computeTotals, computeSavings, formatMoney, toMinorUnits } from "@/lib/money";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AUD", "CAD"];

export default function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "", productUrl: "", category: "", originCountry: "", destinationCountry: "",
    productPrice: "", travelerReward: "", localPrice: "", currency: "USD", notes: "",
    quantity: "1", purchaseAt: "", deliveryCity: "", deliveryAddress: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  // live preview (major units in the form → minor units for the math)
  const pp = Number(form.productPrice) || 0;
  const tr = Number(form.travelerReward) || 0;
  const lp = form.localPrice === "" ? null : Number(form.localPrice);
  const { platformFee, totalCost } = computeTotals({ productPrice: toMinorUnits(pp), travelerReward: toMinorUnits(tr) });
  const savings = computeSavings(lp == null ? null : toMinorUnits(lp), totalCost);
  const cur = form.currency || "USD";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/requests", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
    });
    setBusy(false);
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Could not post request."); return; }
    router.push("/dashboard");
  }

  return (
    <form className="cb-auth-card cb-form" onSubmit={onSubmit}>
      <h1>Post a request</h1>
      <Field label="What do you want?" value={form.title} onChange={set("title")} placeholder="e.g. Sony A7 IV camera" />
      <div className="cb-form-row">
        <Field label="Category (optional)" value={form.category} onChange={set("category")} />
        <Field label="Product link (optional)" type="url" value={form.productUrl} onChange={set("productUrl")} />
      </div>
      <div className="cb-form-row">
        <Field label="Buy in (origin)" value={form.originCountry} onChange={set("originCountry")} />
        <Field label="Deliver to (destination)" value={form.destinationCountry} onChange={set("destinationCountry")} />
      </div>
      <Field label="Where to buy it (store / site + location)" value={form.purchaseAt} onChange={set("purchaseAt")} placeholder="e.g. Apple Store, Fifth Avenue NYC — or bhphotovideo.com" />
      <div className="cb-form-row">
        <Field label="Deliver to city" value={form.deliveryCity} onChange={set("deliveryCity")} placeholder="e.g. Bengaluru" />
        <Field label="Delivery address" value={form.deliveryAddress} onChange={set("deliveryAddress")} placeholder="street, area, PIN" />
      </div>
      <div className="cb-form-row">
        <Field label="Product price" type="number" min="0" step="0.01" value={form.productPrice} onChange={set("productPrice")} />
        <Field label="Traveler reward" type="number" min="0" step="0.01" value={form.travelerReward} onChange={set("travelerReward")} />
      </div>
      <Field label="Quantity" type="number" min="1" step="1" value={form.quantity} onChange={set("quantity")} />
      <div className="cb-form-row">
        <Field label="Local price (optional)" type="number" min="0" step="0.01" value={form.localPrice} onChange={set("localPrice")} />
        <Select label="Currency" value={form.currency} onChange={set("currency")}>
          {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>
      <Textarea label="Notes (optional)" value={form.notes} onChange={set("notes")} />

      {pp > 0 && (
        <div className="cb-preview">
          <div className="cb-preview-row"><span>Product</span><span>{formatMoney(toMinorUnits(pp), cur)}</span></div>
          <div className="cb-preview-row"><span>Traveler reward</span><span>{formatMoney(toMinorUnits(tr), cur)}</span></div>
          <div className="cb-preview-row"><span>Est. platform fee</span><span>{formatMoney(platformFee, cur)}</span></div>
          <div className="cb-preview-row total"><span>Total cost</span><span>{formatMoney(totalCost, cur)}</span></div>
          {savings != null && savings > 0 && <div className="cb-preview-savings">You save {formatMoney(savings, cur)}</div>}
        </div>
      )}

      {error && <p className="cb-error">{error}</p>}
      <button className="cb-submit" disabled={busy}>{busy ? "Posting…" : "Post request"}</button>
    </form>
  );
}
