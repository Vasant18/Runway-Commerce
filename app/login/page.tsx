"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Field from "@/components/ui/Field";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError(null);
    const s = await signIn("credentials", { email, password, redirect: false });
    setBusy(false);
    if (s?.error) { setError("Wrong email or password."); return; }
    router.push("/dashboard");
  }

  return (
    <main className="cb-auth">
      <form className="cb-auth-card" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <Field label="Work Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="cb-error">{error}</p>}
        <button className="cb-submit" disabled={busy}>{busy ? "Boarding…" : "Log in"}</button>
        <p className="cb-alt">New here? <a href="/signup">Get early access</a></p>
      </form>
    </main>
  );
}
