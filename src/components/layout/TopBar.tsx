"use client";
import { useState, useEffect, useRef } from "react";
import { Sun, Moon, Bell, List } from "@phosphor-icons/react";
import { formatRelativeTime } from "@/lib/utils";
import type { Notification } from "@/types";

interface TopBarProps {
  title: string;
  userName: string;
  onMenuToggle?: () => void;
}

const severityDot: Record<string, string> = {
  info:    "#4361ee",
  success: "#10b981",
  warning: "#f59e0b",
  error:   "#ef4444",
};

export default function TopBar({ title, userName, onMenuToggle }: TopBarProps) {
  const [dark, setDark] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Close panel on outside click */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    }
    if (showNotifs) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotifs]);

  useEffect(() => {
    fetch("/api/notifications?limit=6")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.data ?? []);
        setUnread(d.data?.filter((n: Notification) => !n.read).length ?? 0);
      })
      .catch(() => {});
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const initials = userName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <header
      className="h-[60px] flex items-center justify-between px-6 sticky top-0 z-30 shrink-0"
      style={{
        background: "rgba(9,9,11,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden btn-press"
          style={{ color: "var(--text-secondary)" }}
        >
          <List size={22} weight="regular" />
        </button>
        <h1
          className="text-[15px] font-semibold tracking-tight"
          style={{ color: "rgba(248,250,252,0.85)" }}
        >
          {title}
        </h1>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center btn-press"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
        >
          {dark
            ? <Sun size={15} weight="regular" />
            : <Moon size={15} weight="regular" />
          }
        </button>

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setShowNotifs((s) => !s)}
            className="w-8 h-8 rounded-lg flex items-center justify-center btn-press relative"
            style={{
              background: showNotifs ? "var(--surface-hover)" : "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            <Bell size={15} weight={unread > 0 ? "fill" : "regular"} />
            {unread > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center"
                style={{ background: "var(--danger)", border: "2px solid #09090b" }}
              >
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {showNotifs && (
            <div
              className="absolute right-0 top-11 w-[340px] rounded-2xl overflow-hidden z-50 animate-fade-up"
              style={{
                background: "#111114",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold" style={{ color: "var(--text)" }}>
                    Notifications
                  </span>
                  {unread > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}
                    >
                      {unread} new
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-medium btn-press"
                    style={{ color: "var(--accent)" }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div
                    className="py-10 text-center text-[13px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    No notifications
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <div
                      key={n.id}
                      className="flex gap-3 px-4 py-3 transition-colors cursor-default"
                      style={{
                        borderBottom: i < notifications.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : undefined,
                        opacity: n.read ? 0.5 : 1,
                        background: n.read ? "transparent" : "rgba(255,255,255,0.015)",
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0 mt-1"
                        style={{ background: severityDot[n.severity] ?? "var(--text-muted)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold mb-0.5" style={{ color: "var(--text)" }}>
                          {n.title}
                        </p>
                        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                          {n.message}
                        </p>
                        <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold cursor-default"
          style={{
            background: "linear-gradient(135deg, #4361ee, #5b7af0)",
            color: "#fff",
            boxShadow: "0 2px 8px rgba(67,97,238,0.25)",
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}
