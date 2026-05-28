"use client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { useState } from "react";
import { ChartLine, ChartDonut } from "@phosphor-icons/react";
import { formatCurrency } from "@/lib/utils";
import type { MonthlyTrend, SpendingByCategory } from "@/types";

interface SpendingChartProps {
  monthlyTrends: MonthlyTrend[];
  spendingByCategory: SpendingByCategory[];
}

function CustomTooltip({
  active, payload, label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 text-[12px]"
      style={{
        background: "#18181c",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
      }}
    >
      <p className="font-medium mb-2" style={{ color: "var(--text-muted)" }}>{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="capitalize" style={{ color: "var(--text-secondary)" }}>{p.name}:</span>
          <span className="font-semibold font-data" style={{ color: "var(--text)" }}>
            {formatCurrency(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function SpendingChart({ monthlyTrends, spendingByCategory }: SpendingChartProps) {
  const [view, setView] = useState<"trend" | "category">("trend");

  return (
    <div
      className="rounded-2xl p-6 h-full animate-fade-up delay-100"
      style={{
        background: "#111114",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3
            className="text-[14px] font-semibold tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Financial Overview
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            Income vs Expenses · Last 6 months
          </p>
        </div>

        {/* Tab toggle */}
        <div
          className="flex p-0.5 rounded-lg gap-0.5"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {(["trend", "category"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold btn-press transition-colors"
              style={{
                background: view === v ? "rgba(255,255,255,0.09)" : "transparent",
                color: view === v ? "var(--text)" : "var(--text-muted)",
                border: view === v ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
              }}
            >
              {v === "trend"
                ? <ChartLine size={13} weight="regular" />
                : <ChartDonut size={13} weight="regular" />
              }
              {v === "trend" ? "Trend" : "Breakdown"}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      {view === "trend" ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyTrends} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4361ee" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4361ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "rgba(248,250,252,0.3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(248,250,252,0.3)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#4361ee"
              strokeWidth={1.5}
              fill="url(#incomeGrad)"
              name="Income"
              dot={false}
              activeDot={{ r: 4, fill: "#4361ee", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={1.5}
              fill="url(#expenseGrad)"
              name="Expenses"
              dot={false}
              activeDot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center gap-6 h-[220px]">
          <ResponsiveContainer width="45%" height="100%">
            <PieChart>
              <Pie
                data={spendingByCategory}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                strokeWidth={0}
              >
                {spendingByCategory.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => formatCurrency(Number(v))}
                contentStyle={{
                  background: "#18181c",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--text)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
            {spendingByCategory.slice(0, 7).map((c) => (
              <div key={c.category} className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                <span
                  className="text-[11px] capitalize flex-1 truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {c.category}
                </span>
                <span
                  className="text-[11px] font-semibold font-data tabular-nums"
                  style={{ color: "var(--text)" }}
                >
                  {c.percentage.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
