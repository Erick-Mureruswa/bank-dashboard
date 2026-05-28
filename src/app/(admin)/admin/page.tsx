"use client";
import { useEffect, useState } from "react";
import { Users, DollarSign, AlertTriangle, TrendingUp, Activity, Shield, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface AnalyticsData {
  users: { total: number; active: number; frozen: number; newThisMonth: number };
  transactions: { total: number; thisMonth: number; flagged: number };
  volume: { total: number; thisMonth: number };
  fraudAlerts: number;
  volumeTrend: { month: string; amount: number }[];
  recentTransactions: { id: string; amount: number; type: string; status: string; createdAt: string }[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics").then((r) => r.json())
      .then((d) => setData(d.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64 opacity-40"><Loader2 size={32} className="animate-spin" /></div>;
  }
  if (!data) return <div className="text-center opacity-40 py-20">Failed to load analytics.</div>;

  const stats = [
    { label: "Total Users", value: data.users.total.toLocaleString(), sub: `+${data.users.newThisMonth} this month`, icon: Users, color: "#4361EE" },
    { label: "Platform Volume", value: formatCurrency(data.volume.total), sub: formatCurrency(data.volume.thisMonth) + " this month", icon: DollarSign, color: "#10B981" },
    { label: "Total Transactions", value: data.transactions.total.toLocaleString(), sub: `${data.transactions.thisMonth} this month`, icon: Activity, color: "#7C3AED" },
    { label: "Open Fraud Alerts", value: data.fraudAlerts.toString(), sub: `${data.transactions.flagged} flagged transactions`, icon: AlertTriangle, color: "#EF4444" },
  ];

  return (
    <div className="space-y-8 fade-in-up">
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="opacity-40 text-sm mt-1">Real-time banking platform analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <div key={s.label} className="p-6 rounded-2xl card-hover" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15` }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <TrendingUp size={14} className="opacity-30" />
            </div>
            <p className="text-2xl font-bold mb-0.5">{s.value}</p>
            <p className="text-xs opacity-40">{s.label}</p>
            <p className="text-xs mt-1" style={{ color: s.color }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-bold mb-1">Transaction Volume</h3>
          <p className="text-xs opacity-40 mb-5">Monthly platform volume (USD)</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data.volumeTrend}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361EE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v))} />
              <Area type="monotone" dataKey="amount" stroke="#4361EE" strokeWidth={2} fill="url(#volGrad)" name="Volume" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-bold mb-1">User Distribution</h3>
          <p className="text-xs opacity-40 mb-5">Account status breakdown</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Active", value: data.users.active, color: "#10B981" },
              { label: "Frozen", value: data.users.frozen, color: "#EF4444" },
              { label: "New (Month)", value: data.users.newThisMonth, color: "#4361EE" },
            ].map((item) => (
              <div key={item.label} className="p-4 rounded-xl text-center" style={{ background: "var(--muted)" }}>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-xs opacity-40 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
          <div>
            <div className="flex items-center justify-between text-xs opacity-40 mb-2">
              <span>Active users</span>
              <span>{data.users.total > 0 ? ((data.users.active / data.users.total) * 100).toFixed(0) : 0}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--muted)" }}>
              <div className="h-full rounded-full" style={{
                width: `${data.users.total > 0 ? (data.users.active / data.users.total) * 100 : 0}%`,
                background: "linear-gradient(90deg, #4361EE, #10B981)",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--border)" }}>
          <h3 className="font-bold">Recent Platform Transactions</h3>
          <span className="text-xs opacity-40">{data.recentTransactions.length} shown</span>
        </div>
        <div className="divide-y" style={{ borderColor: "var(--border)" }}>
          {data.recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-6 py-3 hover:bg-white/3 transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--muted)" }}>
                <DollarSign size={14} className="opacity-50" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium font-mono opacity-60">{tx.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs opacity-30">{formatDateTime(tx.createdAt)}</p>
              </div>
              <span className="text-xs capitalize px-2 py-0.5 rounded font-medium"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>{tx.type}</span>
              <span className="font-bold text-sm">{formatCurrency(tx.amount)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                tx.status === "completed" ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10"
              }`}>{tx.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
