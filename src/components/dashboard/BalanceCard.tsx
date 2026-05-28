"use client";
import { useState, useEffect, useRef } from "react";
import { Eye, EyeSlash, CopySimple, Check, TrendUp, TrendDown } from "@phosphor-icons/react";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import type { Account } from "@/types";
import gsap from "gsap";

interface BalanceCardProps {
  account: Account;
  monthlyChange: number;
}

export default function BalanceCard({ account, monthlyChange }: BalanceCardProps) {
  const [hidden, setHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /* GSAP counter animation on mount */
  useEffect(() => {
    if (!counterRef.current || hidden) return;
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: account.balance,
      duration: 1.6,
      ease: "power3.out",
      onUpdate() {
        if (counterRef.current) {
          counterRef.current.textContent = formatCurrency(obj.val, account.currency);
        }
      },
    });
    return () => { tween.kill(); };
  }, [account.balance, account.currency, hidden]);

  function copyAccount() {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const positive = monthlyChange >= 0;
  const accountLabel =
    account.type === "checking" ? "Checking"
    : account.type === "savings" ? "Savings"
    : "Business";

  return (
    <div
      ref={cardRef}
      className="relative overflow-hidden rounded-2xl p-6 h-full min-h-[200px] flex flex-col justify-between animate-fade-up"
      style={{
        background: "linear-gradient(145deg, #131520 0%, #0e1019 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 24px 48px rgba(0,0,0,0.5)",
      }}
    >
      {/* Ambient accent glow — fixed position, no scroll repaint */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 15% 0%, rgba(67,97,238,0.18) 0%, transparent 65%)",
        }}
      />

      {/* Top row */}
      <div className="relative flex items-start justify-between">
        <div>
          {/* Account type pill */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase mb-3"
            style={{
              background: "rgba(67,97,238,0.12)",
              border: "1px solid rgba(67,97,238,0.25)",
              color: "#7b9cf0",
            }}
          >
            <span className="status-dot active" style={{ width: 5, height: 5 }} />
            {accountLabel}
          </div>

          {/* Account number */}
          <button
            onClick={copyAccount}
            className="flex items-center gap-1.5 btn-press"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="font-data text-xs">{maskAccountNumber(account.accountNumber)}</span>
            {copied
              ? <Check size={12} weight="bold" style={{ color: "var(--success)" }} />
              : <CopySimple size={12} weight="regular" />
            }
          </button>
        </div>

        {/* Eye toggle */}
        <button
          onClick={() => setHidden(!hidden)}
          className="w-8 h-8 rounded-lg flex items-center justify-center btn-press"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "var(--text-secondary)",
          }}
        >
          {hidden ? <EyeSlash size={15} weight="regular" /> : <Eye size={15} weight="regular" />}
        </button>
      </div>

      {/* Balance */}
      <div className="relative mt-2">
        <p className="text-[11px] font-medium uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>
          Available Balance
        </p>
        <p className="font-display text-4xl tracking-tight" style={{ color: "var(--text)" }}>
          {hidden
            ? <span className="tracking-wider opacity-60">••••••</span>
            : <span ref={counterRef}>
                {formatCurrency(account.balance, account.currency)}
              </span>
          }
        </p>
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between mt-4">
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
          style={{
            background: positive ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
            color: positive ? "var(--success)" : "var(--danger)",
            border: `1px solid ${positive ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {positive
            ? <TrendUp size={12} weight="bold" />
            : <TrendDown size={12} weight="bold" />
          }
          {positive ? "+" : ""}{monthlyChange.toFixed(1)}% this month
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="status-dot"
            style={{ background: account.status === "active" ? "var(--success)" : "var(--danger)" }}
          />
          <span className="text-[11px] capitalize" style={{ color: "var(--text-muted)" }}>
            {account.status}
          </span>
        </div>
      </div>
    </div>
  );
}
