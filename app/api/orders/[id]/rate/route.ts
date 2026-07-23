import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

// Rate the other party on a CONFIRMED order (once per rater).
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const uid = (session.user as any).id;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const stars = Number(body?.stars);
  const comment = body?.comment ? String(body.comment).trim() : null;
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Stars must be 1–5." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({ where: { id }, include: { ratings: true } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 400 });
  if (order.buyerId !== uid && order.travelerId !== uid) {
    return NextResponse.json({ error: "This isn't your order." }, { status: 403 });
  }
  if (order.status !== "CONFIRMED") return NextResponse.json({ error: "You can rate after the order is confirmed." }, { status: 400 });
  if (order.ratings.some(r => r.raterId === uid)) {
    return NextResponse.json({ error: "You already rated this order." }, { status: 400 });
  }

  const rateeId = order.buyerId === uid ? order.travelerId : order.buyerId;
  const rating = await prisma.rating.create({
    data: { orderId: order.id, raterId: uid, rateeId, stars, comment },
    select: { id: true },
  });
  const agg = await prisma.rating.aggregate({ where: { rateeId }, _avg: { stars: true }, _count: true });
  await prisma.user.update({ where: { id: rateeId }, data: { ratingAvg: agg._avg.stars ?? 0, ratingCount: agg._count } });
  return NextResponse.json({ id: rating.id }, { status: 201 });
}
