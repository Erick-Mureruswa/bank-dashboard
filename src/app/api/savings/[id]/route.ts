import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  targetAmount: z.number().positive().optional(),
  currentAmount: z.number().min(0).optional(),
  deadline: z.string().datetime().optional().nullable(),
  status: z.enum(["active", "completed", "paused"]).optional(),
  color: z.string().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const goal = await prisma.savingsGoal.findFirst({ where: { id, userId: auth.userId } });
  if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  const updated = await prisma.savingsGoal.update({
    where: { id },
    data: {
      ...parsed.data,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : parsed.data.deadline === null ? null : undefined,
    },
  });

  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { id } = await params;
  const goal = await prisma.savingsGoal.findFirst({ where: { id, userId: auth.userId } });
  if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });

  await prisma.savingsGoal.delete({ where: { id } });
  return NextResponse.json({ message: "Goal deleted." });
}
