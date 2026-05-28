import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const search = searchParams.get("search") ?? "";
  const category = searchParams.get("category") ?? "";
  const type = searchParams.get("type") ?? "";
  const status = searchParams.get("status") ?? "";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const userAccounts = await prisma.account.findMany({
    where: { userId: auth.userId },
    select: { id: true },
  });
  const accountIds = userAccounts.map((a) => a.id);

  const where: Record<string, unknown> = {
    OR: [
      { fromAccountId: { in: accountIds } },
      { toAccountId: { in: accountIds } },
    ],
  };

  if (search) {
    where.OR = [
      { description: { contains: search, mode: "insensitive" } },
      { reference: { contains: search, mode: "insensitive" } },
    ];
    where.AND = [{ OR: [{ fromAccountId: { in: accountIds } }, { toAccountId: { in: accountIds } }] }];
  }
  if (category) where.category = category;
  if (type) where.type = type;
  if (status) where.status = status;
  if (from || to) {
    where.createdAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { fromAccount: true, toAccount: true },
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
