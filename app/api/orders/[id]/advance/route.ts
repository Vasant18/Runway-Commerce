import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { canTransition, applyTransition, type Action, type ActorRole, ACTIONS } from "@/lib/orders";
import { partnerByName } from "@/lib/partners";

// Advance an order through the lifecycle. The state machine decides legality;
// this route decides WHO the session is relative to the order.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const uid = (session.user as any).id;
  const role = (session.user as any).role;

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const action = body?.action as Action;
  if (!ACTIONS.includes(action)) return NextResponse.json({ error: "Unknown action." }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 400 });

  // Resolve the session's actor role for THIS order.
  let actor: ActorRole | null = null;
  if (role === "OPS") actor = "ops";
  else if (order.buyerId === uid && order.travelerId === uid) actor = null; // impossible by construction
  else if (order.buyerId === uid) actor = "buyer";
  else if (order.travelerId === uid) actor = "traveler";
  if (!actor) return NextResponse.json({ error: "This isn't your order." }, { status: 403 });

  const input = { otp: body?.otp ? String(body.otp) : undefined, partner: body?.partner ? String(body.partner) : undefined };
  if (action === "assign_courier" && input.partner && !partnerByName(input.partner)) {
    return NextResponse.json({ error: "Unknown delivery partner." }, { status: 400 });
  }

  const err = canTransition(order, action, actor, input);
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  const next = applyTransition(order, action, actor, input);

  // If ops picked a partner, refresh the delivery fee + total to that partner's rate.
  let feePatch = {};
  if (action === "assign_courier" && input.partner) {
    const p = partnerByName(input.partner)!;
    feePatch = { deliveryFee: p.feeMinor, totalAmount: order.productPrice + order.travelerReward + order.platformFee + p.feeMinor };
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      status: next.status as any, escrowStatus: next.escrowStatus as any,
      deliveryOtp: next.deliveryOtp, deliveryPartner: next.deliveryPartner,
      deliveryTrackingCode: next.deliveryTrackingCode, ...feePatch,
    },
    select: { id: true, status: true, escrowStatus: true },
  });
  return NextResponse.json(updated);
}
