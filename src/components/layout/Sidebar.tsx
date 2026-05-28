"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  House, ArrowsLeftRight, ClockCounterClockwise, PiggyBank,
  ShieldCheck, Gear, SignOut, CaretLeft, CaretRight,
} from "@phosphor-icons/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",    icon: House,                   label: "Overview" },
  { href: "/transfer",     icon: ArrowsLeftRight,         label: "Transfer" },
  { href: "/transactions", icon: ClockCounterClockwise,   label: "Transactions" },
  { href: "/savings",      icon: PiggyBank,               label: "Savings" },
  { href: "/security",     icon: ShieldCheck,             label: "Security" },
  { href: "/settings",     icon: Gear,                    label: "Settings" },
];

interface SidebarProps {
  userName: string;
  userEmail: string;
  unreadCount?: number;
}

export default function Sidebar({ userName, userEmail, unreadCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside
      className="hidden lg:flex flex-col h-screen sticky top-0 shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
      style={{
        width: collapsed ? "68px" : "244px",
        background: "#0c0c0f",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo mark */}
      <div
        className="flex items-center gap-3 px-4 h-[60px] shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Double-bezel logo */}
        <div
          className="shrink-0 w-9 h-9 rounded-[10px] flex items-center justify-center"
          style={{
            background: "rgba(67,97,238,0.15)",
            border: "1px solid rgba(67,97,238,0.3)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          <span
            className="text-sm font-bold"
            style={{ color: "#7b9cf0", fontFamily: "var(--font-geist)" }}
          >
            N
          </span>
        </div>
        {!collapsed && (
          <span
            className="text-[15px] font-semibold tracking-tight truncate"
            style={{ color: "rgba(248,250,252,0.9)" }}
          >
            NexaBank
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn("nav-item", active && "active")}
              style={{ justifyContent: collapsed ? "center" : undefined }}
            >
              <item.icon size={18} weight={active ? "fill" : "regular"} className="shrink-0" />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div
        className="px-2 py-3 space-y-1 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {!collapsed && (
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #4361ee, #5b7af0)",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(67,97,238,0.3)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "rgba(248,250,252,0.9)" }}>
                {userName}
              </p>
              <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                {userEmail}
              </p>
            </div>
            {unreadCount > 0 && (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ background: "var(--danger)", color: "#fff" }}
              >
                {unreadCount}
              </span>
            )}
          </div>
        )}

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? "Sign out" : undefined}
          className="nav-item w-full btn-press"
          style={{
            color: "var(--danger)",
            justifyContent: collapsed ? "center" : undefined,
          }}
        >
          <SignOut size={18} weight="regular" className="shrink-0" />
          {!collapsed && (
            <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[74px] w-6 h-6 rounded-full flex items-center justify-center btn-press z-10"
        style={{
          background: "#1a1a20",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "var(--text-secondary)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
        }}
      >
        {collapsed
          ? <CaretRight size={10} weight="bold" />
          : <CaretLeft size={10} weight="bold" />
        }
      </button>
    </aside>
  );
}
