import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import TopBar from "@/components/layout/TopBar";
import BalanceCard from "@/components/dashboard/BalanceCard";
import SpendingChart from "@/components/dashboard/SpendingChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import FinancialHealthScore from "@/components/dashboard/FinancialHealthScore";
import AIInsights from "@/components/dashboard/AIInsights";
import QuickActions from "@/components/dashboard/QuickActions";
import { formatCurrency, getCategoryColor, calculateFinancialHealthScore } from "@/lib/utils";
import { TrendUp, TrendDown, CurrencyDollar, PiggyBank } from "@phosphor-icons/react/dist/ssr";
import type { Account, SpendingByCategory, MonthlyTrend } from "@/types";

async function getDashboardData(userId: string) {
  const [user, accounts, recentTxs, allTxs, savingsGoals] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.account.findMany({ where: { userId, status: { not: "closed" } }, orderBy: { createdAt: "asc" } }),
    prisma.transaction.findMany({
      where: { OR: [{ fromAccount: { userId } }, { toAccount: { userId } }] },
      include: { fromAccount: true, toAccount: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.transaction.findMany({
      where: {
        OR: [{ fromAccount: { userId } }, { toAccount: { userId } }],
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1) },
      },
      include: { fromAccount: true, toAccount: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.savingsGoal.findMany({ where: { userId, status: "active" } }),
  ]);

  const primaryAccount = accounts[0];
  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const totalSavings = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonthTxs = allTxs.filter((t) => new Date(t.createdAt) >= monthStart);
  const prevMonthTxs = allTxs.filter(
    (t) => new Date(t.createdAt) >= prevMonthStart && new Date(t.createdAt) < monthStart,
  );

  function getMonthlyStats(txs: typeof allTxs, uid: string) {
    let income = 0, expenses = 0;
    for (const tx of txs) {
      if (tx.type === "deposit" || tx.toAccount?.userId === uid) income += tx.amount;
      if (tx.fromAccount?.userId === uid) expenses += tx.amount;
    }
    return { income, expenses };
  }

  const { income: monthlyIncome, expenses: monthlyExpenses } = getMonthlyStats(thisMonthTxs, userId);
  const { income: prevIncome, expenses: prevExpenses } = getMonthlyStats(prevMonthTxs, userId);

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;
  const healthScore = calculateFinancialHealthScore(totalBalance, monthlyIncome, monthlyExpenses, savingsRate);

  const balanceChange =
    prevExpenses > 0
      ? ((monthlyIncome - monthlyExpenses - (prevIncome - prevExpenses)) / Math.abs(prevIncome - prevExpenses)) * 100
      : 0;

  const categoryMap: Record<string, number> = {};
  for (const tx of thisMonthTxs) {
    if (tx.fromAccount?.userId === userId) {
      categoryMap[tx.category] = (categoryMap[tx.category] ?? 0) + tx.amount;
    }
  }
  const totalCatSpend = Object.values(categoryMap).reduce((s, v) => s + v, 0);
  const spendingByCategory: SpendingByCategory[] = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalCatSpend > 0 ? (amount / totalCatSpend) * 100 : 0,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.amount - a.amount);

  const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const trendMap: Record<string, { income: number; expenses: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trendMap[monthLabels[d.getMonth()]] = { income: 0, expenses: 0 };
  }
  for (const tx of allTxs) {
    const key = monthLabels[new Date(tx.createdAt).getMonth()];
    if (!trendMap[key]) continue;
    if (tx.toAccount?.userId === userId || tx.type === "deposit") trendMap[key].income += tx.amount;
    if (tx.fromAccount?.userId === userId) trendMap[key].expenses += tx.amount;
  }
  const monthlyTrends: MonthlyTrend[] = Object.entries(trendMap).map(([month, d]) => ({ month, ...d }));

  return {
    user, primaryAccount, totalBalance, totalSavings,
    monthlyIncome, monthlyExpenses, savingsRate, healthScore,
    balanceChange, spendingByCategory, monthlyTrends, recentTxs,
  };
}

export default async function DashboardPage() {
  const auth = await getAuthUser();
  if (!auth) redirect("/login");

  const d = await getDashboardData(auth.userId);
  if (!d.user) redirect("/login");

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Monthly Income",
      value: formatCurrency(d.monthlyIncome),
      icon: TrendUp,
      color: "#10b981",
      bg: "rgba(16,185,129,0.08)",
      border: "rgba(16,185,129,0.15)",
    },
    {
      label: "Monthly Expenses",
      value: formatCurrency(d.monthlyExpenses),
      icon: TrendDown,
      color: "#ef4444",
      bg: "rgba(239,68,68,0.08)",
      border: "rgba(239,68,68,0.15)",
    },
    {
      label: "Total Balance",
      value: formatCurrency(d.totalBalance),
      icon: CurrencyDollar,
      color: "#4361ee",
      bg: "rgba(67,97,238,0.08)",
      border: "rgba(67,97,238,0.15)",
    },
    {
      label: "Total Savings",
      value: formatCurrency(d.totalSavings),
      icon: PiggyBank,
      color: "#a855f7",
      bg: "rgba(168,85,247,0.08)",
      border: "rgba(168,85,247,0.15)",
    },
  ];

  return (
    <>
      <TopBar
        title={`${greeting}, ${d.user.name.split(" ")[0]}`}
        userName={d.user.name}
      />

      <main className="flex-1 p-5 md:p-6 space-y-5 max-w-[1400px] mx-auto w-full mesh-bg">

        {/* ── Row 1: Balance + Stats ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            {d.primaryAccount ? (
              <BalanceCard account={d.primaryAccount as Account} monthlyChange={d.balanceChange} />
            ) : (
              <div
                className="rounded-2xl p-6 flex items-center justify-center min-h-[200px] animate-fade-up"
                style={{ background: "#111114", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                  No account found. Contact support.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="rounded-2xl p-5 flex items-center gap-4 animate-fade-up"
                style={{
                  background: "#111114",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                  animationDelay: `${(i + 1) * 60}ms`,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: s.bg, border: `1px solid ${s.border}` }}
                >
                  <s.icon size={18} style={{ color: s.color }} />
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide mb-0.5" style={{ color: "var(--text-muted)" }}>
                    {s.label}
                  </p>
                  <p className="text-[18px] font-semibold font-data tabular-nums tracking-tight" style={{ color: "var(--text)" }}>
                    {s.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Row 2: Chart + Health ──────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <SpendingChart
              monthlyTrends={d.monthlyTrends}
              spendingByCategory={d.spendingByCategory}
            />
          </div>
          <div>
            <FinancialHealthScore
              score={d.healthScore}
              savingsRate={d.savingsRate}
              monthlyIncome={d.monthlyIncome}
              monthlyExpenses={d.monthlyExpenses}
            />
          </div>
        </div>

        {/* ── Row 3: Transactions + Actions + Insights ───────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentTransactions
              transactions={d.recentTxs as Parameters<typeof RecentTransactions>[0]["transactions"]}
              currentAccountId={d.primaryAccount?.id ?? ""}
            />
          </div>
          <div className="space-y-4">
            <QuickActions />
            <AIInsights
              spendingByCategory={d.spendingByCategory}
              monthlyTrends={d.monthlyTrends}
              savingsRate={d.savingsRate}
            />
          </div>
        </div>
      </main>
    </>
  );
}
