import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(searchParams.get("limit") ?? "20"));
  const search = searchParams.get("search") ?? "";

  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] }
    : {};

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true, email: true, name: true, role: true,
        isActive: true, isFrozen: true, createdAt: true, lastLoginAt: true,
        accounts: { select: { balance: true, status: true }, take: 5 },
        _count: { select: { accounts: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({ data: users, total, page, limit, totalPages: Math.ceil(total / limit) });
}
