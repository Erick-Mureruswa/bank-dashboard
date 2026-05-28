"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { ArrowLeftRight, CheckCircle, AlertTriangle, Loader2, ArrowRight, DollarSign } from "lucide-react";
import { formatCurrency, maskAccountNumber } from "@/lib/utils";
import type { Account } from "@/types";

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000];
const CATEGORIES = ["other","food","transport","shopping","entertainment","utilities","health","education"];

export default function TransferPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({ fromAccountId: "", toAccountNumber: "", amount: "", description: "", category: "other" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ reference: string; flagged: boolean } | null>(null);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => {
      setAccounts(d.data ?? []);
      if (d.data?.[0]) setForm((p) => ({ ...p, fromAccountId: d.data[0].id }));
    }).catch(() => {});
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.data?.name ?? "User")).catch(() => {});
  }, []);

  const fromAccount = accounts.find((a) => a.id === form.fromAccountId);
  const amount = parseFloat(form.amount) || 0;
  const insufficient = !!fromAccount && amount > fromAccount.balance;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.fromAccountId) { setError("Select a source account."); return; }
    if (!form.toAccountNumber.trim()) { setError("Enter a recipient account number."); return; }
    if (amount <= 0) { setError("Enter a valid amount."); return; }
    if (insufficient) { setError("Insufficient funds."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Transfer failed."); return; }

      setSuccess({ reference: data.data?.reference, flagged: data.flagged });
      setForm((p) => ({ ...p, toAccountNumber: "", amount: "", description: "" }));
      fetch("/api/accounts").then((r) => r.json()).then((d) => setAccounts(d.data ?? [])).catch(() => {});
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <>
        <TopBar title="Transfer" userName={userName} />
        <main className="flex-1 p-6 flex items-center justify-center">
          <div className="w-full max-w-md text-center p-10 rounded-3xl fade-in-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${success.flagged ? "bg-yellow-500/10" : "bg-green-500/10"}`}>
              {success.flagged
                ? <AlertTriangle size={36} className="text-yellow-500" />
                : <CheckCircle size={36} className="text-green-500" />}
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {success.flagged ? "Transfer Flagged for Review" : "Transfer Successful!"}
            </h2>
            <p className="opacity-50 text-sm mb-6">
              {success.flagged
                ? "Your transfer was processed but flagged by our fraud detection system. Our team will review it shortly."
                : "Your money is on its way. Transfers typically arrive instantly."}
            </p>
            <div className="p-4 rounded-xl mb-6 text-sm font-mono" style={{ background: "var(--muted)" }}>
              Ref: {success.reference}
            </div>
            <button onClick={() => setSuccess(null)}
              className="gradient-primary text-white font-semibold px-8 py-3 rounded-xl hover:opacity-90 transition-opacity">
              New Transfer
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Transfer Money" userName={userName} />
      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-5 fade-in-up">
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl text-sm"
              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              <AlertTriangle size={16} className="shrink-0" /> {error}
            </div>
          )}

          {/* From Account */}
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <label className="block text-sm font-semibold mb-3 opacity-60">From Account</label>
            <div className="space-y-2">
              {accounts.map((a) => (
                <label key={a.id}
                  className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all"
                  style={{
                    border: form.fromAccountId === a.id ? "1.5px solid #4361EE" : "1.5px solid var(--border)",
                    background: form.fromAccountId === a.id ? "rgba(67,97,238,0.06)" : "var(--muted)",
                  }}>
                  <input type="radio" name="fromAccountId" value={a.id} checked={form.fromAccountId === a.id}
                    onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
                    className="hidden" />
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <DollarSign size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold capitalize">{a.type} Account</p>
                    <p className="text-xs opacity-40 font-mono">{maskAccountNumber(a.accountNumber)}</p>
                  </div>
                  <p className="font-bold text-sm">{formatCurrency(a.balance, a.currency)}</p>
                </label>
              ))}
            </div>
          </div>

          {/* To Account */}
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <label className="block text-sm font-semibold mb-3 opacity-60">Recipient Account Number</label>
            <input
              type="text"
              value={form.toAccountNumber}
              onChange={(e) => setForm({ ...form, toAccountNumber: e.target.value })}
              placeholder="Enter account number"
              className="w-full px-4 py-3.5 rounded-xl text-sm outline-none font-mono"
              style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
              onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>

          {/* Amount */}
          <div className="rounded-2xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <label className="block text-sm font-semibold mb-3 opacity-60">Amount</label>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold opacity-40">$</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-4 rounded-xl text-2xl font-bold outline-none"
                style={{
                  background: "var(--muted)",
                  border: `1.5px solid ${insufficient ? "#EF4444" : "var(--border)"}`,
                  color: "var(--foreground)",
                }}
              />
            </div>
            {insufficient && (
              <p className="text-xs text-red-500 mb-3">Insufficient funds. Available: {formatCurrency(fromAccount?.balance ?? 0)}</p>
            )}
            <div className="flex gap-2 flex-wrap">
              {QUICK_AMOUNTS.map((q) => (
                <button key={q} type="button"
                  onClick={() => setForm({ ...form, amount: q.toString() })}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)" }}>
                  ${q}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div>
              <label className="block text-sm font-semibold mb-2 opacity-60">Description (optional)</label>
              <input type="text" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What's this for?"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}
                onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 opacity-60">Category</label>
              <select value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none capitalize"
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary */}
          {amount > 0 && fromAccount && (
            <div className="p-4 rounded-2xl text-sm space-y-2" style={{ background: "rgba(67,97,238,0.08)", border: "1px solid rgba(67,97,238,0.2)" }}>
              <div className="flex justify-between">
                <span className="opacity-60">Transfer amount</span>
                <span className="font-semibold">{formatCurrency(amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-60">Fee</span>
                <span className="font-semibold text-green-500">Free</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-bold" style={{ borderColor: "rgba(67,97,238,0.2)" }}>
                <span>Total deducted</span>
                <span>{formatCurrency(amount)}</span>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || insufficient || amount <= 0}
            className="w-full gradient-primary text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
              : <><ArrowRight size={18} /> Send {amount > 0 ? formatCurrency(amount) : "Money"}</>}
          </button>
        </form>
      </main>
    </>
  );
}
