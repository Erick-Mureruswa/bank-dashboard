import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).default(0),
  deadline: z.string().datetime().optional(),
  icon: z.string().default("piggy-bank"),
  color: z.string().default("#4361EE"),
});

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const goals = await prisma.savingsGoal.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ data: goals });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const goal = await prisma.savingsGoal.create({
    data: { ...parsed.data, userId: auth.userId, deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined },
  });

  return NextResponse.json({ data: goal }, { status: 201 });
}
