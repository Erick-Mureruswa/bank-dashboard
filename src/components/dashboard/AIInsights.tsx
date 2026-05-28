"use client";
import { Sparkle, TrendUp, TrendDown, Warning, Lightbulb } from "@phosphor-icons/react";
import type { SpendingByCategory, MonthlyTrend } from "@/types";

interface AIInsightsProps {
  spendingByCategory: SpendingByCategory[];
  monthlyTrends: MonthlyTrend[];
  savingsRate: number;
}

interface Insight {
  type: "positive" | "warning" | "tip";
  text: string;
}

function generateInsights(
  spending: SpendingByCategory[],
  trends: MonthlyTrend[],
  savingsRate: number,
): Insight[] {
  const insights: Insight[] = [];
  const last = trends[trends.length - 1];
  const prev = trends[trends.length - 2];

  if (last && prev) {
    const expChange = ((last.expenses - prev.expenses) / (prev.expenses || 1)) * 100;
    if (expChange > 20) {
      insights.push({
        type: "warning",
        text: `Spending jumped ${expChange.toFixed(0)}% vs last month. Review recent transactions to identify unusual charges.`,
      });
    } else if (expChange < -10) {
      insights.push({
        type: "positive",
        text: `You cut expenses by ${Math.abs(expChange).toFixed(0)}% compared to last month. Excellent financial discipline.`,
      });
    }
  }

  const food = spending.find((s) => s.category === "food");
  if (food && food.percentage > 30) {
    insights.push({
      type: "warning",
      text: `Food & dining is ${food.percentage.toFixed(0)}% of spending — above the 15% benchmark. Consider meal planning.`,
    });
  }

  if (savingsRate < 10) {
    insights.push({
      type: "tip",
      text: `You're saving ${savingsRate.toFixed(0)}% of income. Targeting 20% builds a 6-month emergency fund within 2 years.`,
    });
  } else if (savingsRate >= 20) {
    insights.push({
      type: "positive",
      text: `Saving ${savingsRate.toFixed(0)}% of income places you ahead of 80% of account holders. Compounding is working.`,
    });
  }

  const entertainment = spending.find((s) => s.category === "entertainment");
  if (entertainment && entertainment.percentage > 15) {
    insights.push({
      type: "tip",
      text: `Entertainment at ${entertainment.percentage.toFixed(0)}% of spending. Reducing by 5% adds ~$${(entertainment.amount * 0.05).toFixed(0)}/mo to savings.`,
    });
  }

  insights.push({
    type: "tip",
    text: "Automating transfers to savings on payday — before discretionary spending — is the most reliable wealth-building habit.",
  });

  return insights.slice(0, 3);
}

const config = {
  positive: {
    icon: TrendUp,
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.15)",
    dot: "#10b981",
  },
  warning: {
    icon: Warning,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.15)",
    dot: "#f59e0b",
  },
  tip: {
    icon: Lightbulb,
    color: "#4361ee",
    bg: "rgba(67,97,238,0.08)",
    border: "rgba(67,97,238,0.15)",
    dot: "#4361ee",
  },
};

export default function AIInsights({ spendingByCategory, monthlyTrends, savingsRate }: AIInsightsProps) {
  const insights = generateInsights(spendingByCategory, monthlyTrends, savingsRate);

  return (
    <div
      className="rounded-2xl p-5 animate-fade-up delay-300"
      style={{
        background: "#111114",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(67,97,238,0.12)", border: "1px solid rgba(67,97,238,0.2)" }}
        >
          <Sparkle size={14} weight="fill" style={{ color: "#7b9cf0" }} />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>
            AI Insights
          </h3>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Based on your spending patterns
          </p>
        </div>
      </div>

      {/* Insight cards */}
      <div className="space-y-2.5">
        {insights.map((insight, i) => {
          const { icon: Icon, color, bg, border } = config[insight.type];
          return (
            <div
              key={i}
              className="flex gap-3 p-3.5 rounded-xl"
              style={{ background: bg, border: `1px solid ${border}` }}
            >
              <div
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${color}20` }}
              >
                <Icon size={13} weight="fill" style={{ color }} />
              </div>
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {insight.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
