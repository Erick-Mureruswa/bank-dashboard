import { Transaction } from "@/types";

interface FraudSignal {
  triggered: boolean;
  reason: string;
  riskScore: number;
}

export function analyzeTransaction(
  transaction: { amount: number; type: string; description?: string },
  recentTransactions: Transaction[],
  accountBalance: number
): FraudSignal {
  const signals: { reason: string; score: number }[] = [];

  if (transaction.amount > 5000) {
    signals.push({ reason: "Large transfer amount exceeding $5,000", score: 30 });
  }
  if (transaction.amount > 10000) {
    signals.push({ reason: "High-value transaction exceeding $10,000", score: 50 });
  }

  const lastHour = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = recentTransactions.filter(
    (t) => new Date(t.createdAt) > lastHour
  ).length;
  if (recentCount >= 5) {
    signals.push({ reason: `Rapid succession: ${recentCount} transactions in the last hour`, score: 35 });
  }

  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dailyVolume = recentTransactions
    .filter((t) => new Date(t.createdAt) > last24h)
    .reduce((sum, t) => sum + t.amount, 0);
  if (dailyVolume + transaction.amount > 20000) {
    signals.push({ reason: "Daily transaction volume exceeds $20,000", score: 40 });
  }

  if (transaction.amount > accountBalance * 0.9) {
    signals.push({ reason: "Transaction amount exceeds 90% of available balance", score: 25 });
  }

  const hour = new Date().getHours();
  if (hour >= 0 && hour < 5) {
    signals.push({ reason: "Transaction attempted during unusual hours (midnight–5am)", score: 15 });
  }

  const totalScore = signals.reduce((sum, s) => sum + s.score, 0);
  const cappedScore = Math.min(100, totalScore);
  const triggered = cappedScore >= 50;
  const reason = signals.map((s) => s.reason).join("; ") || "No fraud signals detected";

  return { triggered, reason, riskScore: cappedScore };
}

export function calculateRiskLevel(score: number): "low" | "medium" | "high" | "critical" {
  if (score < 25) return "low";
  if (score < 50) return "medium";
  if (score < 75) return "high";
  return "critical";
}

export function getRiskColor(level: string): string {
  const colors: Record<string, string> = {
    low: "#10B981",
    medium: "#F59E0B",
    high: "#EF4444",
    critical: "#7C3AED",
  };
  return colors[level] ?? "#94A3B8";
}
