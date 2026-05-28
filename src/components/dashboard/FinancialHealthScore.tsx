"use client";
import { useEffect, useRef } from "react";
import { TrendUp, TrendDown, Minus } from "@phosphor-icons/react";

interface FinancialHealthScoreProps {
  score: number;
  savingsRate: number;
  monthlyIncome: number;
  monthlyExpenses: number;
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const filled = (score / 100) * circumference;

  const color =
    score >= 75 ? "#10b981" :
    score >= 50 ? "#4361ee" :
    score >= 25 ? "#f59e0b" :
    "#ef4444";

  const label =
    score >= 75 ? "Excellent" :
    score >= 50 ? "Good" :
    score >= 25 ? "Fair" :
    "Poor";

  const circleRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDasharray = `0 ${circumference}`;
    const timer = setTimeout(() => {
      if (el) {
        el.style.transition = "stroke-dasharray 1.4s cubic-bezier(0.32, 0.72, 0, 1)";
        el.style.strokeDasharray = `${filled} ${circumference}`;
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [filled, circumference]);

  return (
    <div className="relative w-[132px] h-[132px] shrink-0 flex items-center justify-center">
      <svg width="132" height="132" className="-rotate-90" style={{ overflow: "visible" }}>
        {/* Track */}
        <circle
          cx="66" cy="66" r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        {/* Progress */}
        <circle
          ref={circleRef}
          cx="66" cy="66" r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[28px]" style={{ color }}>{score}</span>
        <span className="text-[10px] font-medium uppercase tracking-wider mt-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </span>
      </div>
    </div>
  );
}

export default function FinancialHealthScore({
  score, savingsRate, monthlyIncome, monthlyExpenses,
}: FinancialHealthScoreProps) {
  const expenseRatio = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;

  const metrics = [
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(0)}%`,
      status: savingsRate >= 20 ? "good" : savingsRate >= 10 ? "ok" : "poor",
    },
    {
      label: "Expense Ratio",
      value: `${expenseRatio.toFixed(0)}%`,
      status: expenseRatio < 60 ? "good" : expenseRatio < 80 ? "ok" : "poor",
    },
    {
      label: "Balance Trend",
      value: "+4.2%",
      status: "good",
    },
  ];

  const statusColor: Record<string, string> = {
    good: "var(--success)",
    ok:   "var(--warning)",
    poor: "var(--danger)",
  };

  const StatusIcon = ({ s }: { s: string }) =>
    s === "good"
      ? <TrendUp size={11} weight="bold" />
      : s === "ok"
      ? <Minus size={11} weight="bold" />
      : <TrendDown size={11} weight="bold" />;

  return (
    <div
      className="rounded-2xl p-5 h-full animate-fade-up delay-150"
      style={{
        background: "#111114",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <h3 className="text-[14px] font-semibold tracking-tight mb-5" style={{ color: "var(--text)" }}>
        Financial Health
      </h3>

      <div className="flex flex-col items-center gap-5">
        <ScoreRing score={score} />

        <div className="w-full space-y-2">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                {m.label}
              </span>
              <div
                className="flex items-center gap-1 text-[11px] font-semibold font-data"
                style={{ color: statusColor[m.status] }}
              >
                <StatusIcon s={m.status} />
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
