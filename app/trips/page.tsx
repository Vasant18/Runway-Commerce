import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import TripCard from "@/components/app/TripCard";

export default async function BrowseTrips() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const trips = await prisma.trip.findMany({
    where: { travelerId: { not: uid }, status: "UPCOMING" },
    orderBy: { createdAt: "desc" },
    include: { traveler: { select: { fullName: true } } },
  });
  return (
    <main className="cb-dash">
      <h1>Upcoming trips</h1>
      <p className="cb-dash-sub">Travelers heading somewhere soon — post a request they can carry.</p>
      {trips.length === 0
        ? <p className="cb-dash-sub">No trips posted yet.</p>
        : <div className="cb-cards">{trips.map(t => <TripCard key={t.id} trip={t as any} />)}</div>}
    </main>
  );
}
