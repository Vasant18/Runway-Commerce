import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { hashPassword } from "@/lib/hash";
import { signupError } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { fullName, email, password, role } = body ?? {};
  const err = signupError({ fullName: fullName ?? "", email: email ?? "", password: password ?? "", role: role ?? "" });
  if (err) return NextResponse.json({ error: err }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });
  if (existing) return NextResponse.json({ error: "That email is already registered." }, { status: 400 });
  const user = await prisma.user.create({
    data: { fullName, email: String(email).toLowerCase(), passwordHash: await hashPassword(password), role },
    select: { id: true },
  });
  return NextResponse.json({ id: user.id }, { status: 201 });
}
