import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { computeOrderTotals } from "@/lib/money";
import { estimateDeliveryFee } from "@/lib/partners";

// Buyer accepts or declines a proposed match. Accept creates the Order.
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const uid = (session.user as any).id;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const action = body?.action;
  if (action !== "accept" && action !== "decline") {
    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  }

  const match = await prisma.match.findUnique({
    where: { id },
    include: { request: true, trip: true },
  });
  if (!match) return NextResponse.json({ error: "Match not found." }, { status: 400 });
  if (match.request.buyerId !== uid) return NextResponse.json({ error: "Only the buyer can decide this offer." }, { status: 403 });
  if (match.status !== "PROPOSED") return NextResponse.json({ error: "This offer was already decided." }, { status: 400 });

  if (action === "decline") {
    await prisma.match.update({ where: { id }, data: { status: "DECLINED" } });
    return NextResponse.json({ ok: true });
  }

  // accept → order
  const r = match.request;
  const deliveryFee = estimateDeliveryFee(r.destinationCountry);
  const { platformFee, totalCost } = computeOrderTotals({
    productPrice: r.productPrice, travelerReward: r.travelerReward, deliveryFee,
  });
  const [, , order] = await prisma.$transaction([
    prisma.match.update({ where: { id }, data: { status: "ACCEPTED" } }),
    prisma.request.update({ where: { id: r.id }, data: { status: "MATCHED" } }),
    prisma.order.create({
      data: {
        matchId: match.id, buyerId: r.buyerId, travelerId: match.trip.travelerId,
        productPrice: r.productPrice, travelerReward: r.travelerReward,
        platformFee, deliveryFee, totalAmount: totalCost, currency: r.currency,
        deliveryCity: r.deliveryCity, deliveryAddress: r.deliveryAddress,
      },
      select: { id: true },
    }),
  ]);
  return NextResponse.json({ orderId: order.id }, { status: 201 });
}
