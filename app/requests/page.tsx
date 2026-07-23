import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import RequestCard from "@/components/app/RequestCard";

export default async function BrowseRequests() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const requests = await prisma.request.findMany({
    where: { buyerId: { not: uid }, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { buyer: { select: { fullName: true } } },
  });
  return (
    <main className="cb-dash">
      <h1>Open requests</h1>
      <p className="cb-dash-sub">Buyers waiting for a traveler — carry one on a trip you&apos;re already taking.</p>
      {requests.length === 0
        ? <p className="cb-dash-sub">No open requests yet.</p>
        : <div className="cb-cards">{requests.map(r => <RequestCard key={r.id} request={r as any} />)}</div>}
    </main>
  );
}
