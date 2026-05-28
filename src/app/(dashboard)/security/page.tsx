"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { Shield, AlertTriangle, CheckCircle, Clock, Lock, Eye, Bell, Smartphone, Loader2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { Notification, FraudAlert } from "@/types";

export default function SecurityPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [mfaEnabled, setMfaEnabled] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/notifications?limit=20").then((r) => r.json()),
      fetch("/api/admin/fraud?userId=me").then((r) => r.json()).catch(() => ({ data: [] })),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([notifs, fraud, me]) => {
      setNotifications(notifs.data?.filter((n: Notification) => n.type === "security" || n.type === "fraud") ?? []);
      setFraudAlerts(fraud.data ?? []);
      setUserName(me.data?.name ?? "User");
      setMfaEnabled(me.data?.mfaEnabled ?? false);
    }).finally(() => setLoading(false));
  }, []);

  const securityItems = [
    { icon: Lock, label: "Password Protection", status: "active", desc: "Your account is protected with a strong password." },
    { icon: Eye, label: "Session Monitoring", status: "active", desc: "All login sessions are monitored and logged." },
    { icon: Bell, label: "Fraud Detection", status: "active", desc: "Real-time fraud analysis on every transaction." },
    { icon: Smartphone, label: "Two-Factor Authentication", status: mfaEnabled ? "active" : "inactive", desc: mfaEnabled ? "MFA is enabled on your account." : "Enable MFA for stronger account protection." },
  ];

  const severityIcon = { info: CheckCircle, success: CheckCircle, warning: AlertTriangle, error: AlertTriangle };
  const severityColor = { info: "#4361EE", success: "#10B981", warning: "#F59E0B", error: "#EF4444" };

  return (
    <>
      <TopBar title="Security Center" userName={userName} />
      <main className="flex-1 p-6 space-y-6 max-w-3xl mx-auto w-full">
        {/* Security Score */}
        <div className="rounded-2xl p-6 gradient-primary text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 -translate-y-1/4 translate-x-1/4"
            style={{ background: "radial-gradient(circle, white, transparent)" }} />
          <div className="relative flex items-center gap-5">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Shield size={36} />
            </div>
            <div>
              <p className="text-white/70 text-sm mb-1">Security Score</p>
              <p className="text-5xl font-bold">{mfaEnabled ? 98 : 72}<span className="text-2xl opacity-60">/100</span></p>
              <p className="text-white/70 text-sm mt-1">{mfaEnabled ? "Your account is highly secure." : "Enable MFA to reach 98/100."}</p>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <h3 className="font-bold mb-4">Security Status</h3>
          <div className="space-y-3">
            {securityItems.map((item) => (
              <div key={item.label} className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "var(--muted)" }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: item.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)" }}>
                  <item.icon size={18} style={{ color: item.status === "active" ? "#10B981" : "#EF4444" }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-xs opacity-50 mt-0.5">{item.desc}</p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                  item.status === "active" ? "text-green-500 bg-green-500/10" : "text-red-500 bg-red-500/10"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Fraud Alerts */}
        {fraudAlerts.length > 0 && (
          <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid rgba(239,68,68,0.3)" }}>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} style={{ color: "#EF4444" }} />
              <h3 className="font-bold text-sm">Fraud Alerts</h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#EF4444" }}>
                {fraudAlerts.length}
              </span>
            </div>
            <div className="space-y-3">
              {fraudAlerts.map((alert) => (
                <div key={alert.id} className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-red-500">Risk Score: {alert.riskScore}/100</p>
                    <span className="text-xs opacity-40">{formatDateTime(alert.createdAt)}</span>
                  </div>
                  <p className="text-xs opacity-70">{alert.reason}</p>
                  <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded font-medium capitalize"
                    style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                    {alert.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security Log */}
        <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="opacity-50" />
            <h3 className="font-bold text-sm">Security Log</h3>
          </div>
          {loading ? (
            <div className="py-6 flex justify-center opacity-40"><Loader2 size={20} className="animate-spin" /></div>
          ) : notifications.length === 0 ? (
            <p className="text-sm opacity-40 py-4 text-center">No security events recorded.</p>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => {
                const Icon = severityIcon[n.severity] ?? CheckCircle;
                const color = severityColor[n.severity] ?? "#94A3B8";
                return (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors">
                    <Icon size={16} className="shrink-0 mt-0.5" style={{ color }} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{n.title}</p>
                      <p className="text-xs opacity-50 mt-0.5">{n.message}</p>
                    </div>
                    <p className="text-[10px] opacity-30 shrink-0 whitespace-nowrap">{formatDateTime(n.createdAt)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
