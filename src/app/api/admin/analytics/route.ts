import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [
    totalUsers, activeUsers, frozenUsers, newUsersThisMonth,
    totalTransactions, monthlyTransactions, flaggedTransactions,
    recentTransactions, fraudAlerts, dailyVolume, topUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true, isFrozen: false } }),
    prisma.user.count({ where: { isFrozen: true } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),

    prisma.transaction.count(),
    prisma.transaction.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.transaction.count({ where: { isFlagged: true } }),

    prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { fromAccount: { select: { userId: true } } } }),
    prisma.fraudAlert.count({ where: { status: "open" } }),

    prisma.transaction.groupBy({
      by: ["createdAt"],
      _sum: { amount: true },
      where: { createdAt: { gte: sixMonthsAgo }, status: "completed" },
      orderBy: { createdAt: "asc" },
    }),

    prisma.user.findMany({
      take: 5,
      include: { _count: { select: { accounts: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalVolume = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { status: "completed" },
  });

  const monthlyVolumeRes = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: { status: "completed", createdAt: { gte: monthStart } },
  });

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const volumeByMonth: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    volumeByMonth[monthLabels[d.getMonth()]] = 0;
  }
  for (const row of dailyVolume) {
    const key = monthLabels[new Date(row.createdAt).getMonth()];
    if (key in volumeByMonth) volumeByMonth[key] = (volumeByMonth[key] ?? 0) + (row._sum.amount ?? 0);
  }
  const volumeTrend = Object.entries(volumeByMonth).map(([month, amount]) => ({ month, amount }));

  return NextResponse.json({
    data: {
      users: { total: totalUsers, active: activeUsers, frozen: frozenUsers, newThisMonth: newUsersThisMonth },
      transactions: { total: totalTransactions, thisMonth: monthlyTransactions, flagged: flaggedTransactions },
      volume: { total: totalVolume._sum.amount ?? 0, thisMonth: monthlyVolumeRes._sum.amount ?? 0 },
      fraudAlerts,
      volumeTrend,
      recentTransactions,
      topUsers,
    },
  });
}
