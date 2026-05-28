import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const limit = parseInt(new URL(req.url).searchParams.get("limit") ?? "20");
  const notifications = await prisma.notification.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: Math.min(limit, 50),
  });

  return NextResponse.json({ data: notifications });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: auth.userId, read: false },
    data: { read: true },
  });

  return NextResponse.json({ message: "All notifications marked as read." });
}
