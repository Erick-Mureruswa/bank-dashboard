import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const search = searchParams.get("search") ?? "";

  const where = search
    ? {
        OR: [
          { description: { contains: search, mode: "insensitive" as const } },
          { reference: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        fromAccount: {
          include: { user: { select: { name: true, email: true } } },
        },
        toAccount: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    data: transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
