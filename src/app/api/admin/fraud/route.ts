import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  const userId = new URL(req.url).searchParams.get("userId");

  if (userId === "me" && auth) {
    const alerts = await prisma.fraudAlert.findMany({
      where: { userId: auth.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    return NextResponse.json({ data: alerts });
  }

  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const alerts = await prisma.fraudAlert.findMany({
    include: { user: { select: { name: true, email: true } }, transaction: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ data: alerts });
}

export async function PATCH(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { id, status } = await req.json();
  if (!["investigating", "resolved", "dismissed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const alert = await prisma.fraudAlert.update({
    where: { id },
    data: { status, resolvedAt: ["resolved", "dismissed"].includes(status) ? new Date() : null, resolvedBy: auth.userId },
  });

  await prisma.adminLog.create({
    data: { adminId: auth.userId, action: `fraud_alert_${status}`, targetType: "fraud_alert", targetId: id },
  });

  return NextResponse.json({ data: alert });
}
