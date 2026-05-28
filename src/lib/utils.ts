import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

export function maskAccountNumber(accountNumber: string): string {
  return `•••• ${accountNumber.slice(-4)}`;
}

export function generateReference(): string {
  return `NXB${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function calculateFinancialHealthScore(
  balance: number,
  monthlyIncome: number,
  monthlyExpenses: number,
  savingsRate: number
): number {
  let score = 0;
  if (balance > 0) score += 20;
  if (balance > monthlyIncome) score += 15;
  if (monthlyExpenses < monthlyIncome) score += 20;
  const expenseRatio = monthlyIncome > 0 ? monthlyExpenses / monthlyIncome : 1;
  if (expenseRatio < 0.5) score += 20;
  else if (expenseRatio < 0.7) score += 10;
  else if (expenseRatio < 0.9) score += 5;
  if (savingsRate >= 20) score += 25;
  else if (savingsRate >= 10) score += 15;
  else if (savingsRate > 0) score += 5;
  return Math.min(100, score);
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    food: "#F59E0B",
    transport: "#3B82F6",
    shopping: "#8B5CF6",
    entertainment: "#EC4899",
    utilities: "#6B7280",
    health: "#10B981",
    travel: "#06B6D4",
    education: "#6366F1",
    salary: "#22C55E",
    investment: "#14B8A6",
    other: "#94A3B8",
  };
  return colors[category] ?? "#94A3B8";
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    food: "🍔",
    transport: "🚗",
    shopping: "🛍️",
    entertainment: "🎬",
    utilities: "⚡",
    health: "💊",
    travel: "✈️",
    education: "📚",
    salary: "💰",
    investment: "📈",
    other: "💳",
  };
  return icons[category] ?? "💳";
}

export function getTransactionSign(type: string, isOutgoing: boolean): "+" | "-" {
  if (type === "deposit" || type === "refund") return "+";
  if (type === "salary") return "+";
  if (isOutgoing) return "-";
  return "+";
}

export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
}
