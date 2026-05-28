"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ArrowDownLeft } from "@phosphor-icons/react";
import { formatCurrency, formatRelativeTime, getCategoryIcon } from "@/lib/utils";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions: Transaction[];
  currentAccountId: string;
}

const categoryColor: Record<string, string> = {
  food:          "#f59e0b",
  transport:     "#4361ee",
  shopping:      "#a855f7",
  entertainment: "#ec4899",
  utilities:     "#64748b",
  health:        "#10b981",
  travel:        "#06b6d4",
  education:     "#8b5cf6",
  salary:        "#10b981",
  investment:    "#4361ee",
  other:         "#94a3b8",
};

export default function RecentTransactions({ transactions, currentAccountId }: RecentTransactionsProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-up delay-200"
      style={{
        background: "#111114",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div>
          <h3 className="text-[14px] font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Recent Transactions
          </h3>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
            Latest activity on your account
          </p>
        </div>
        <Link
          href="/transactions"
          className="flex items-center gap-1 text-[11px] font-semibold btn-press"
          style={{ color: "var(--accent)" }}
        >
          View all <ArrowRight size={11} weight="bold" />
        </Link>
      </div>

      {/* List */}
      {transactions.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-2">
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            No transactions yet
          </p>
          <p className="text-[11px]" style={{ color: "var(--text-muted)", opacity: 0.6 }}>
            Your activity will appear here
          </p>
        </div>
      ) : (
        <div>
          {transactions.map((tx, i) => {
            const isOutgoing = tx.fromAccountId === currentAccountId;
            const color = isOutgoing ? "var(--danger)" : "var(--success)";
            const catColor = categoryColor[tx.category] ?? "#94a3b8";
            const sign = isOutgoing ? "-" : "+";

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3.5 px-5 py-3.5 transition-colors cursor-default"
                style={{
                  borderBottom:
                    i < transactions.length - 1
                      ? "1px solid rgba(255,255,255,0.04)"
                      : undefined,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Category icon pill */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base"
                  style={{
                    background: `${catColor}14`,
                    border: `1px solid ${catColor}25`,
                  }}
                >
                  {getCategoryIcon(tx.category)}
                </div>

                {/* Description */}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ color: "var(--text)" }}
                  >
                    {tx.description ?? (isOutgoing ? "Transfer Sent" : "Transfer Received")}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {formatRelativeTime(tx.createdAt)}
                  </p>
                </div>

                {/* Amount + status */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 justify-end">
                    {isOutgoing
                      ? <ArrowUpRight size={11} weight="bold" style={{ color }} />
                      : <ArrowDownLeft size={11} weight="bold" style={{ color }} />
                    }
                    <span className="text-[13px] font-semibold font-data" style={{ color }}>
                      {sign}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize mt-0.5 inline-block"
                    style={{
                      background:
                        tx.status === "completed" ? "rgba(16,185,129,0.1)" :
                        tx.status === "pending"   ? "rgba(245,158,11,0.1)" :
                        "rgba(239,68,68,0.1)",
                      color:
                        tx.status === "completed" ? "var(--success)" :
                        tx.status === "pending"   ? "var(--warning)" :
                        "var(--danger)",
                    }}
                  >
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
