import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import OrderCard from "@/components/app/OrderCard";

export default async function Orders() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const orders = await prisma.order.findMany({
    where: { OR: [{ buyerId: uid }, { travelerId: uid }] },
    orderBy: { updatedAt: "desc" },
    include: {
      buyer: { select: { fullName: true } },
      traveler: { select: { fullName: true } },
      match: { include: { request: true, trip: true } },
    },
  });
  return (
    <>
      <AppNav />
      <main className="cb-dash">
        <h1>Your orders</h1>
        <p className="cb-dash-sub">Every order you&apos;re part of — as a buyer or a traveler.</p>
        {orders.length === 0
          ? <p className="cb-dash-sub">No orders yet. Accept an offer on a request, or offer to carry one.</p>
          : <div className="cb-cards">{orders.map(o => <OrderCard key={o.id} order={o as any} />)}</div>}
      </main>
    </>
  );
}
