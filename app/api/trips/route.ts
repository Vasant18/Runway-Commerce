import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { tripError } from "@/lib/validation";

const CAN_TRAVEL = new Set(["TRAVELER", "BOTH"]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const role = (session.user as any).role;
  if (!CAN_TRAVEL.has(role)) return NextResponse.json({ error: "Only travelers can post trips." }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { fromCountry, toCountry, departDate, arriveDate, luggageCapacityKg } = body ?? {};
  const err = tripError({
    fromCountry: fromCountry ?? "", toCountry: toCountry ?? "",
    departDate: departDate ?? "", arriveDate: arriveDate ?? "", luggageCapacityKg,
  });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const trip = await prisma.trip.create({
    data: {
      travelerId: (session.user as any).id,
      fromCountry: String(fromCountry).trim(),
      toCountry: String(toCountry).trim(),
      departDate: new Date(departDate),
      arriveDate: new Date(arriveDate),
      luggageCapacityKg: luggageCapacityKg != null && luggageCapacityKg !== "" ? Number(luggageCapacityKg) : null,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: trip.id }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const uid = (session.user as any).id;
  const mine = new URL(req.url).searchParams.get("mine") === "1";
  const trips = await prisma.trip.findMany({
    where: mine ? { travelerId: uid } : { travelerId: { not: uid }, status: "UPCOMING" },
    orderBy: { createdAt: "desc" },
    include: { traveler: { select: { fullName: true } } },
  });
  return NextResponse.json({ trips });
}
