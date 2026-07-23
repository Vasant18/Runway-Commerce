import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { requestError } from "@/lib/validation";
import { toMinorUnits } from "@/lib/money";

const CAN_BUY = new Set(["BUYER", "BOTH"]);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const role = (session.user as any).role;
  if (!CAN_BUY.has(role)) return NextResponse.json({ error: "Only buyers can post requests." }, { status: 403 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { title, productUrl, category, originCountry, destinationCountry, productPrice, travelerReward, localPrice, currency, notes,
    quantity, purchaseAt, deliveryCity, deliveryAddress } = body ?? {};

  // productPrice/travelerReward/localPrice arrive as MAJOR-unit numbers
  const err = requestError({
    title: title ?? "", originCountry: originCountry ?? "", destinationCountry: destinationCountry ?? "",
    productPrice: Number(productPrice), travelerReward: Number(travelerReward),
    localPrice: localPrice != null && localPrice !== "" ? Number(localPrice) : null,
    currency: currency ?? "", productUrl: productUrl ?? null,
  });
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const created = await prisma.request.create({
    data: {
      buyerId: (session.user as any).id,
      title: String(title).trim(),
      productUrl: productUrl?.trim() || null,
      category: category?.trim() || null,
      originCountry: String(originCountry).trim(),
      destinationCountry: String(destinationCountry).trim(),
      productPrice: toMinorUnits(Number(productPrice)),
      travelerReward: toMinorUnits(Number(travelerReward)),
      localPrice: localPrice != null && localPrice !== "" ? toMinorUnits(Number(localPrice)) : null,
      currency: String(currency).trim().toUpperCase(),
      notes: notes?.trim() || null,
      quantity: Number.isInteger(Number(quantity)) && Number(quantity) > 0 ? Number(quantity) : 1,
      purchaseAt: purchaseAt?.trim() || null,
      deliveryCity: deliveryCity?.trim() || null,
      deliveryAddress: deliveryAddress?.trim() || null,
    },
    select: { id: true },
  });
  return NextResponse.json({ id: created.id }, { status: 201 });
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const uid = (session.user as any).id;
  const mine = new URL(req.url).searchParams.get("mine") === "1";
  const requests = await prisma.request.findMany({
    where: mine ? { buyerId: uid } : { buyerId: { not: uid }, status: "OPEN" },
    orderBy: { createdAt: "desc" },
    include: { buyer: { select: { fullName: true } } },
  });
  return NextResponse.json({ requests });
}
