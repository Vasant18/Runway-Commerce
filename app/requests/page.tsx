import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import AppNav from "@/components/app/AppNav";
import RequestCard from "@/components/app/RequestCard";
import BrowseControls from "@/components/app/BrowseControls";
import { BrowseHero, QuickChips, PerksStrip } from "@/components/app/BrowsePromo";
import { toMinorUnits } from "@/lib/money";
import type { Prisma } from "@prisma/client";

type SP = Promise<Record<string, string | undefined>>;

export default async function BrowseRequests({ searchParams }: { searchParams: SP }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const uid = (session.user as any).id;
  const sp = await searchParams;

  const where: Prisma.RequestWhereInput = { buyerId: { not: uid }, status: "OPEN" };
  if (sp.category) where.category = sp.category;
  if (sp.from) where.originCountry = sp.from;
  if (sp.to) where.destinationCountry = sp.to;
  const minreward = Number(sp.minreward);
  if (sp.minreward && Number.isFinite(minreward) && minreward > 0) {
    where.travelerReward = { gte: toMinorUnits(minreward) };
  }
  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q } },
      { category: { contains: sp.q } },
      { notes: { contains: sp.q } },
    ];
  }

  const orderBy: Prisma.RequestOrderByWithRelationInput =
    sp.sort === "reward" ? { travelerReward: "desc" }
    : sp.sort === "price" ? { productPrice: "asc" }
    : sp.sort === "rating" ? { buyer: { ratingAvg: "desc" } }
    : { createdAt: "desc" };

  const [requests, categoryRows, fromRows, toRows] = await Promise.all([
    prisma.request.findMany({
      where, orderBy,
      include: { buyer: { select: { fullName: true, ratingAvg: true, ratingCount: true } } },
    }),
    prisma.request.findMany({ where: { status: "OPEN", category: { not: null } }, distinct: ["category"], select: { category: true }, orderBy: { category: "asc" } }),
    prisma.request.findMany({ where: { status: "OPEN" }, distinct: ["originCountry"], select: { originCountry: true } }),
    prisma.request.findMany({ where: { status: "OPEN" }, distinct: ["destinationCountry"], select: { destinationCountry: true } }),
  ]);
  const categories = categoryRows.map(r => r.category!).filter(Boolean);
  const countries = Array.from(new Set([...fromRows.map(r => r.originCountry), ...toRows.map(r => r.destinationCountry)])).sort();

  return (
    <>
      <AppNav />
      <main className="cb-dash">
        <BrowseHero
          title="Open requests"
          sub="Buyers waiting for a traveler — carry one on a trip you're already taking, earn the reward."
          ctaLabel="Post a trip"
          ctaHref="/trips/new"
        />
        <QuickChips items={categories.slice(0, 8)} param="category" base="/requests" active={sp.category} />
        <div className="cb-browse">
          <aside className="cb-browse-side">
            <BrowseControls kind="requests" facets={{ categories, countries }} current={sp} />
          </aside>
          <div className="cb-browse-main">
            <div className="cb-browse-head">
              <span className="cb-browse-count">{requests.length} {requests.length === 1 ? "request" : "requests"}</span>
            </div>
            {requests.length === 0
              ? <p className="cb-dash-sub">No open requests match — try clearing a filter.</p>
              : <div className="cb-cards">{requests.map(r => <RequestCard key={r.id} request={r as any} href={`/requests/${r.id}`} />)}</div>}
          </div>
        </div>
        <PerksStrip />
      </main>
    </>
  );
}
