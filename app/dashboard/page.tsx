import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const name = session.user.name ?? "traveler";
  return (
    <main className="cb-dash">
      <h1>Welcome aboard, {name}.</h1>
      <p className="cb-dash-sub">Your journey starts here. Trips and requests are coming in the next update.</p>
      <div className="cb-dash-grid">
        <section className="cb-dash-card"><h2>Your trips</h2><p>No trips yet.</p></section>
        <section className="cb-dash-card"><h2>Your requests</h2><p>No requests yet.</p></section>
      </div>
    </main>
  );
}
