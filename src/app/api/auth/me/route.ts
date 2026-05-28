import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { id: true, email: true, name: true, role: true, phone: true, mfaEnabled: true, isActive: true, isFrozen: true, lastLoginAt: true, createdAt: true },
  });

  if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json({ data: user });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const allowed = ["name", "phone"] as const;
  const data: Record<string, string> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) data[key] = body[key];
  }

  const user = await prisma.user.update({ where: { id: auth.userId }, data });
  return NextResponse.json({ data: { id: user.id, email: user.email, name: user.name, role: user.role } });
}
