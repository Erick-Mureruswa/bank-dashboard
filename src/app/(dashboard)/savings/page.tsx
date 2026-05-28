"use client";
import { useState, useEffect } from "react";
import TopBar from "@/components/layout/TopBar";
import { Plus, Target, Trash2, Edit3, CheckCircle, Loader2, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SavingsGoal } from "@/types";

const ICONS = ["🎯","🏠","✈️","🚗","💍","📱","🎓","🏋️","🏖️","💰","🛒","🎁"];
const COLORS = ["#4361EE","#7C3AED","#10B981","#F59E0B","#EF4444","#06B6D4","#EC4899","#84CC16"];

interface GoalFormData { name: string; targetAmount: string; currentAmount: string; deadline: string; icon: string; color: string; }
const EMPTY_FORM: GoalFormData = { name: "", targetAmount: "", currentAmount: "0", deadline: "", icon: "🎯", color: "#4361EE" };

export default function SavingsPage() {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    fetchGoals();
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.data?.name ?? "User")).catch(() => {});
  }, []);

  async function fetchGoals() {
    setLoading(true);
    try {
      const res = await fetch("/api/savings");
      const data = await res.json();
      setGoals(data.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.targetAmount) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: parseFloat(form.currentAmount) || 0,
        deadline: form.deadline ? new Date(form.deadline).toISOString() : undefined,
        icon: form.icon,
        color: form.color,
      };

      if (editingId) {
        await fetch(`/api/savings/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/savings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      await fetchGoals();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteGoal(id: string) {
    await fetch(`/api/savings/${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function editGoal(goal: SavingsGoal) {
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split("T")[0] : "",
      icon: goal.icon,
      color: goal.color,
    });
    setEditingId(goal.id);
    setShowForm(true);
  }

  const totalSaved = goals.reduce((s, g) => s + g.currentAmount, 0);
  const totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

  return (
    <>
      <TopBar title="Savings Goals" userName={userName} />
      <main className="flex-1 p-6 space-y-6 max-w-4xl mx-auto w-full">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Saved", value: formatCurrency(totalSaved), color: "#10B981" },
            { label: "Total Target", value: formatCurrency(totalTarget), color: "#4361EE" },
            { label: "Goals Active", value: goals.filter((g) => g.status === "active").length.toString(), color: "#7C3AED" },
          ].map((s) => (
            <div key={s.label} className="p-5 rounded-2xl text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs opacity-40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add Goal Button */}
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); }}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:opacity-80 border-2 border-dashed"
          style={{ borderColor: "#4361EE", color: "#4361EE", background: "rgba(67,97,238,0.04)" }}>
          <Plus size={18} /> Add New Goal
        </button>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="rounded-2xl p-6 fade-in-up" style={{ background: "var(--card)", border: "1px solid #4361EE" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold">{editingId ? "Edit Goal" : "New Savings Goal"}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="opacity-40" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs opacity-50 mb-1.5">Goal Name</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g., Emergency Fund" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="block text-xs opacity-50 mb-1.5">Target Amount ($)</label>
                  <input type="number" required min="1" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                    placeholder="10000" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="block text-xs opacity-50 mb-1.5">Amount Saved ($)</label>
                  <input type="number" min="0" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                    placeholder="0" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }} />
                </div>
                <div>
                  <label className="block text-xs opacity-50 mb-1.5">Target Date (optional)</label>
                  <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)" }} />
                </div>
              </div>
              <div>
                <label className="block text-xs opacity-50 mb-2">Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => setForm({ ...form, icon: ic })}
                      className="w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all"
                      style={{ border: `2px solid ${form.icon === ic ? "#4361EE" : "var(--border)"}`, background: "var(--muted)" }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs opacity-50 mb-2">Color</label>
                <div className="flex gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className="w-7 h-7 rounded-full transition-all"
                      style={{ background: c, border: form.color === c ? `3px solid var(--foreground)` : "3px solid transparent", opacity: form.color === c ? 1 : 0.7 }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background: "var(--muted)" }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 gradient-primary text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {editingId ? "Save Changes" : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        {loading ? (
          <div className="py-10 flex justify-center opacity-40"><Loader2 size={24} className="animate-spin" /></div>
        ) : goals.length === 0 ? (
          <div className="py-16 text-center opacity-40">
            <Target size={40} className="mx-auto mb-3" />
            <p className="text-sm">No savings goals yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal) => {
              const pct = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
              const remaining = goal.targetAmount - goal.currentAmount;
              return (
                <div key={goal.id} className="p-5 rounded-2xl card-hover"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: `${goal.color}18` }}>
                      {goal.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold">{goal.name}</h4>
                        <div className="flex gap-2">
                          <button onClick={() => editGoal(goal)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                            style={{ background: "var(--muted)" }}>
                            <Edit3 size={13} />
                          </button>
                          <button onClick={() => deleteGoal(goal.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"
                            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs opacity-50 mb-3">
                        <span>{formatCurrency(goal.currentAmount)} saved</span>
                        <span>•</span>
                        <span>{formatCurrency(remaining)} to go</span>
                        {goal.deadline && <><span>•</span><span>Due {formatDate(goal.deadline)}</span></>}
                      </div>
                      <div className="relative h-2 rounded-full overflow-hidden mb-2" style={{ background: "var(--muted)" }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: goal.color }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs opacity-40">{pct.toFixed(0)}% complete</span>
                        <span className="text-xs font-bold" style={{ color: goal.color }}>{formatCurrency(goal.targetAmount)} target</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
