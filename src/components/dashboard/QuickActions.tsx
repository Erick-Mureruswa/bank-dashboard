"use client";
import Link from "next/link";
import {
  PaperPlaneTilt, Plus, ClockCounterClockwise,
  PiggyBank, DownloadSimple, ShieldCheck,
} from "@phosphor-icons/react";

const actions = [
  { href: "/transfer",     icon: PaperPlaneTilt,        label: "Send",      color: "#4361ee", glow: "rgba(67,97,238,0.2)" },
  { href: "/transfer",     icon: Plus,                  label: "Add",       color: "#10b981", glow: "rgba(16,185,129,0.2)" },
  { href: "/transactions", icon: ClockCounterClockwise, label: "History",   color: "#a855f7", glow: "rgba(168,85,247,0.2)" },
  { href: "/savings",      icon: PiggyBank,             label: "Savings",   color: "#f59e0b", glow: "rgba(245,158,11,0.2)" },
  { href: "/transactions", icon: DownloadSimple,        label: "Statement", color: "#06b6d4", glow: "rgba(6,182,212,0.2)"  },
  { href: "/security",     icon: ShieldCheck,           label: "Security",  color: "#ef4444", glow: "rgba(239,68,68,0.2)"  },
];

export default function QuickActions() {
  return (
    <div
      className="rounded-2xl p-5 animate-fade-up delay-250"
      style={{
        background: "#111114",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <h3
        className="text-[14px] font-semibold tracking-tight mb-4"
        style={{ color: "var(--text)" }}
      >
        Quick Actions
      </h3>

      <div className="grid grid-cols-3 gap-2.5">
        {actions.map((a) => (
          <Link
            key={a.label}
            href={a.href}
            className="flex flex-col items-center gap-2 p-3.5 rounded-xl btn-press transition-colors group"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = `${a.color}10`;
              (e.currentTarget as HTMLElement).style.borderColor = `${a.color}25`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform"
              style={{
                background: `${a.color}14`,
                border: `1px solid ${a.color}25`,
              }}
            >
              <a.icon size={17} weight="regular" style={{ color: a.color }} />
            </div>
            <span
              className="text-[10px] font-medium text-center leading-tight"
              style={{ color: "var(--text-secondary)" }}
            >
              {a.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
