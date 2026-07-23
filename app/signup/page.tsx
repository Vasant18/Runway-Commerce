"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Field from "@/components/ui/Field";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", password: "", role: "BUYER" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/signup", {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form),
    });
    if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Sign up failed."); setBusy(false); return; }
    const s = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setBusy(false);
    if (s?.error) { setError("Signed up, but sign-in failed. Try logging in."); return; }
    router.push("/dashboard");
  }

  return (
    <main className="cb-auth">
      <form className="cb-auth-card" onSubmit={onSubmit}>
        <h1>Get Early Access</h1>
        <Field label="First & Last Name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} />
        <Field label="Work Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <Field label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        <div className="cb-role" role="radiogroup" aria-label="I am a">
          {["BUYER", "TRAVELER", "BOTH"].map(r => (
            <button type="button" key={r} className={form.role === r ? "cb-role-opt on" : "cb-role-opt"} onClick={() => setForm({ ...form, role: r })}>
              {r === "BUYER" ? "I'm a Buyer" : r === "TRAVELER" ? "I'm a Traveler" : "Both"}
            </button>
          ))}
        </div>
        {error && <p className="cb-error">{error}</p>}
        <button className="cb-submit" disabled={busy}>{busy ? "Booking…" : "Get Access"}</button>
        <p className="cb-alt">Already aboard? <a href="/login">Log in</a></p>
      </form>
    </main>
  );
}
