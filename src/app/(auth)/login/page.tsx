"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeSlash, CircleNotch, WarningCircle } from "@phosphor-icons/react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }
      router.push(data.data?.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-display mb-2"
          style={{ fontSize: "1.75rem", color: "var(--text)" }}
        >
          Welcome back
        </h1>
        <p className="text-[14px]" style={{ color: "var(--text-secondary)" }}>
          Sign in to your NexaBank account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-[13px] animate-fade-in"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            color: "var(--danger)",
          }}
        >
          <WarningCircle size={16} weight="fill" className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            className="block text-[12px] font-medium mb-2 uppercase tracking-wide"
            style={{ color: "var(--text-muted)" }}
          >
            Email Address
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="input-field"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              className="text-[12px] font-medium uppercase tracking-wide"
              style={{ color: "var(--text-muted)" }}
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[12px] font-medium btn-press"
              style={{ color: "var(--accent)" }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="input-field pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 btn-press"
              style={{ color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeSlash size={16} weight="regular" /> : <Eye size={16} weight="regular" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold btn-press transition-opacity disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          style={{
            background: "linear-gradient(135deg, #4361ee 0%, #5b7af0 100%)",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(67,97,238,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
          }}
        >
          {loading ? (
            <>
              <CircleNotch size={16} weight="bold" className="animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      {/* Demo credentials */}
      <div
        className="mt-6 p-4 rounded-xl"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          className="text-[11px] font-semibold uppercase tracking-wide mb-2.5"
          style={{ color: "var(--text-muted)" }}
        >
          Demo access
        </p>
        <div className="space-y-1.5">
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            User:{" "}
            <span className="font-data" style={{ color: "var(--text)" }}>user@nexabank.com</span>
            {" / "}
            <span className="font-data" style={{ color: "var(--text)" }}>Demo@1234</span>
          </p>
          <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>
            Admin:{" "}
            <span className="font-data" style={{ color: "var(--text)" }}>admin@nexabank.com</span>
            {" / "}
            <span className="font-data" style={{ color: "var(--text)" }}>Admin@1234</span>
          </p>
        </div>
      </div>

      <p className="mt-6 text-[13px] text-center" style={{ color: "var(--text-secondary)" }}>
        No account?{" "}
        <Link
          href="/signup"
          className="font-semibold btn-press"
          style={{ color: "var(--accent)" }}
        >
          Create one free
        </Link>
      </p>
    </div>
  );
}
