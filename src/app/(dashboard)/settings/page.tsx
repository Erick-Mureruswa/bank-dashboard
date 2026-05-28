"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { Save, User, Bell, Lock, Loader2, CheckCircle, AlertTriangle } from "lucide-react";

interface UserProfile { name: string; email: string; phone: string; mfaEnabled: boolean; }

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "", phone: "", mfaEnabled: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.data) setProfile({ name: d.data.name, email: d.data.email, phone: d.data.phone ?? "", mfaEnabled: d.data.mfaEnabled });
    }).finally(() => setLoading(false));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: profile.name, phone: profile.phone }),
      });
      if (res.ok) { setMessage({ type: "success", text: "Profile updated successfully." }); }
      else { setMessage({ type: "error", text: "Failed to update profile." }); }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center opacity-40">
      <Loader2 size={28} className="animate-spin" />
    </div>
  );

  const sections = [
    {
      id: "profile",
      icon: User,
      title: "Profile Information",
      content: (
        <form onSubmit={saveProfile} className="space-y-4">
          {message && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: message.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: message.type === "success" ? "#10B981" : "#EF4444" }}>
              {message.type === "success" ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
              {message.text}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs opacity-50 mb-1.5">Full Name</label>
              <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div>
              <label className="block text-xs opacity-50 mb-1.5">Phone Number</label>
              <input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 555 0100"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
            </div>
            <div className="col-span-2">
              <label className="block text-xs opacity-50 mb-1.5">Email Address</label>
              <input type="email" value={profile.email} disabled
                className="w-full px-4 py-3 rounded-xl text-sm opacity-40 cursor-not-allowed"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }} />
              <p className="text-xs opacity-30 mt-1">Email cannot be changed. Contact support.</p>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="flex items-center gap-2 gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save Changes
          </button>
        </form>
      ),
    },
    {
      id: "notifications",
      icon: Bell,
      title: "Notification Preferences",
      content: (
        <div className="space-y-3">
          {[
            { label: "Transaction Alerts", desc: "Get notified for every transaction", enabled: true },
            { label: "Security Alerts", desc: "Login attempts and security events", enabled: true },
            { label: "Fraud Warnings", desc: "Suspicious activity detection alerts", enabled: true },
            { label: "Marketing Emails", desc: "Product updates and offers", enabled: false },
          ].map((pref) => (
            <div key={pref.label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--muted)" }}>
              <div>
                <p className="text-sm font-semibold">{pref.label}</p>
                <p className="text-xs opacity-40 mt-0.5">{pref.desc}</p>
              </div>
              <button className="relative w-11 h-6 rounded-full transition-colors"
                style={{ background: pref.enabled ? "#4361EE" : "var(--border)" }}>
                <span className="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"
                  style={{ left: pref.enabled ? "calc(100% - 20px)" : "4px" }} />
              </button>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "security",
      icon: Lock,
      title: "Security Settings",
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--muted)" }}>
            <div>
              <p className="text-sm font-semibold">Two-Factor Authentication</p>
              <p className="text-xs opacity-40 mt-0.5">{profile.mfaEnabled ? "MFA is active." : "Add extra security to your account."}</p>
            </div>
            <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${profile.mfaEnabled ? "text-green-500 bg-green-500/10" : "text-yellow-500 bg-yellow-500/10"}`}>
              {profile.mfaEnabled ? "Enabled" : "Not set up"}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold mb-3">Change Password</p>
            <div className="space-y-3">
              {[
                { label: "Current Password", key: "current" as const, placeholder: "••••••••" },
                { label: "New Password", key: "next" as const, placeholder: "••••••••" },
                { label: "Confirm New Password", key: "confirm" as const, placeholder: "••••••••" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-xs opacity-50 mb-1.5">{f.label}</label>
                  <input type="password" value={passwords[f.key]} placeholder={f.placeholder}
                    onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                    style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                    onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
                </div>
              ))}
              <button className="gradient-primary text-white px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2">
                <Lock size={14} /> Update Password
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <TopBar title="Settings" userName={profile.name} />
      <main className="flex-1 p-6 space-y-5 max-w-2xl mx-auto w-full">
        {sections.map((s) => (
          <div key={s.id} className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <s.icon size={17} className="text-white" />
              </div>
              <h3 className="font-bold">{s.title}</h3>
            </div>
            {s.content}
          </div>
        ))}
      </main>
    </>
  );
}
