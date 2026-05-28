"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const strength = checks.filter((c) => c.pass).length;
  const colors = ["#EF4444", "#F59E0B", "#F59E0B", "#10B981", "#10B981"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i < strength ? colors[strength] : "var(--border)" }} />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className="flex items-center gap-1 text-xs"
              style={{ color: c.pass ? "#10B981" : "var(--muted-foreground)" }}>
              <CheckCircle size={10} /> {c.label}
            </span>
          ))}
        </div>
        <span className="text-xs font-medium" style={{ color: colors[strength] }}>{labels[strength]}</span>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); return; }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fade-in-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="opacity-50 text-sm">Start banking smarter in minutes</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl mb-6 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Full Name</label>
          <input type="text" required value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="John Doe"
            className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--input)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
            onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Email Address</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--input)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
            onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all pr-12"
              style={{ background: "var(--input)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
              onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70 transition-opacity">
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrength password={form.password} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 opacity-70">Confirm Password</label>
          <input type="password" required value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
            className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--input)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
            onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
          />
        </div>

        <button type="submit" disabled={loading}
          className="w-full gradient-primary text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : "Create Account"}
        </button>
      </form>

      <p className="mt-6 text-xs text-center opacity-40">
        By creating an account you agree to our{" "}
        <span className="underline cursor-pointer">Terms of Service</span> and{" "}
        <span className="underline cursor-pointer">Privacy Policy</span>.
      </p>

      <p className="mt-4 text-sm text-center opacity-50">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold opacity-100" style={{ color: "#4361EE" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
