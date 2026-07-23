import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";

const CAN_TRAVEL = new Set(["TRAVELER", "BOTH"]);

// Traveler proposes to carry a request on one of their trips.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const uid = (session.user as any).id;
  const role = (session.user as any).role;
  if (!CAN_TRAVEL.has(role)) return NextResponse.json({ error: "Only travelers can offer to carry." }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body?.requestId || !body?.tripId) return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const [request, trip] = await Promise.all([
    prisma.request.findUnique({ where: { id: String(body.requestId) }, include: { match: true } }),
    prisma.trip.findUnique({ where: { id: String(body.tripId) } }),
  ]);
  if (!request || !trip) return NextResponse.json({ error: "Request or trip not found." }, { status: 400 });
  if (trip.travelerId !== uid) return NextResponse.json({ error: "That's not your trip." }, { status: 403 });
  if (request.buyerId === uid) return NextResponse.json({ error: "You can't carry your own request." }, { status: 400 });
  if (request.status !== "OPEN") return NextResponse.json({ error: "This request is no longer open." }, { status: 400 });
  if (trip.status !== "UPCOMING") return NextResponse.json({ error: "Pick an upcoming trip." }, { status: 400 });
  // Request has a 1:1 match slot — an existing non-declined match blocks a new offer.
  if (request.match && request.match.status !== "DECLINED") {
    return NextResponse.json({ error: "This request already has a pending offer." }, { status: 400 });
  }
  if (request.match) await prisma.match.delete({ where: { id: request.match.id } });

  const match = await prisma.match.create({
    data: { requestId: request.id, tripId: trip.id, status: "PROPOSED" },
    select: { id: true },
  });
  return NextResponse.json({ id: match.id }, { status: 201 });
}
