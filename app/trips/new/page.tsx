import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import TripForm from "./TripForm";

export default async function NewTrip() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  return (
    <main className="cb-auth">
      {role === "BUYER" ? (
        <div className="cb-nudge">
          You&apos;re registered as a buyer — <a href="/requests/new">post a request</a> instead.
        </div>
      ) : (
        <TripForm />
      )}
    </main>
  );
}
