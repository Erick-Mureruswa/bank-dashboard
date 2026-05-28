import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  isFrozen: z.boolean().optional(),
  isActive: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const user = await prisma.user.update({ where: { id }, data: parsed.data });

  const action = parsed.data.isFrozen === true ? "freeze_account"
    : parsed.data.isFrozen === false ? "unfreeze_account"
    : parsed.data.isActive === false ? "deactivate_account"
    : "update_user";

  await prisma.adminLog.create({
    data: { adminId: auth.userId, action, targetType: "user", targetId: id, details: JSON.stringify(parsed.data) },
  });

  if (parsed.data.isFrozen !== undefined) {
    await prisma.notification.create({
      data: {
        userId: id,
        type: "security",
        title: parsed.data.isFrozen ? "Account Frozen" : "Account Unfrozen",
        message: parsed.data.isFrozen
          ? "Your account has been frozen by our security team. Please contact support."
          : "Your account has been unfrozen. You may now access all features.",
        severity: parsed.data.isFrozen ? "error" : "success",
      },
    });
  }

  return NextResponse.json({ data: { id: user.id, isFrozen: user.isFrozen, isActive: user.isActive, role: user.role } });
}
