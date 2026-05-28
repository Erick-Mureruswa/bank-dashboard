"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="fade-in-up text-center">
        <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
          <CheckCircle size={30} style={{ color: "#10B981" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Check your inbox</h2>
        <p className="opacity-50 text-sm mb-8">
          If an account exists for <strong>{email}</strong>, we sent password reset instructions.
        </p>
        <Link href="/login" className="flex items-center justify-center gap-2 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
          <ArrowLeft size={16} /> Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="fade-in-up">
      <Link href="/login" className="flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mb-8">
        <ArrowLeft size={16} /> Back to Sign In
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
        <p className="opacity-50 text-sm">Enter your email and we'll send you a reset link.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Email Address</label>
          <div className="relative">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm outline-none transition-all"
              style={{ background: "var(--input)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
              onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")} />
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full gradient-primary text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
