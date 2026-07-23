import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import RequestForm from "./RequestForm";

export default async function NewRequest() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as any).role;
  return (
    <main className="cb-auth">
      {role === "TRAVELER" ? (
        <div className="cb-nudge">
          You&apos;re registered as a traveler — <a href="/trips/new">post a trip</a> instead.
        </div>
      ) : (
        <RequestForm />
      )}
    </main>
  );
}
