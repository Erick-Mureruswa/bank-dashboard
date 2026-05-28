"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Flag, CheckCircle, Loader2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { formatCurrency, formatDateTime, getCategoryIcon } from "@/lib/utils";
import type { Transaction } from "@/types";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "20" });
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/admin/transactions?${params}`);
      const data = await res.json();
      const txs = data.data ?? [];
      const filtered = flaggedOnly ? txs.filter((t: Transaction) => t.isFlagged) : txs;
      setTransactions(filtered);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, search, flaggedOnly]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">All Transactions</h1>
          <p className="text-sm opacity-40 mt-0.5">{total} total platform transactions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none w-56"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
          </div>
          <button onClick={() => setFlaggedOnly(!flaggedOnly)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: flaggedOnly ? "rgba(239,68,68,0.12)" : "var(--card)", color: flaggedOnly ? "#EF4444" : "var(--foreground)", border: `1px solid ${flaggedOnly ? "rgba(239,68,68,0.3)" : "var(--border)"}` }}>
            <Flag size={14} /> Flagged Only
          </button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="grid grid-cols-5 px-5 py-3 text-xs font-semibold opacity-40 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="col-span-2">Transaction</span>
          <span>Amount</span>
          <span>Status</span>
          <span>Date</span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-3 opacity-40">
            <Loader2 size={20} className="animate-spin" /> Loading...
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center opacity-40 text-sm">No transactions found.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {transactions.map((tx) => (
              <div key={tx.id} className="grid grid-cols-5 items-center px-5 py-3.5 hover:bg-white/3 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                    style={{ background: "var(--muted)" }}>
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2">
                      {tx.description || tx.type}
                      {tx.isFlagged && <AlertTriangle size={12} style={{ color: "#F59E0B" }} />}
                    </p>
                    <p className="text-xs opacity-30 font-mono">{tx.reference}</p>
                  </div>
                </div>
                <span className="font-bold text-sm">{formatCurrency(tx.amount)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize w-fit ${
                  tx.status === "completed" ? "text-green-500 bg-green-500/10" :
                  tx.status === "pending" ? "text-yellow-500 bg-yellow-500/10" : "text-red-500 bg-red-500/10"
                }`}>{tx.status}</span>
                <span className="text-xs opacity-40">{formatDateTime(tx.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <ChevronLeft size={16} /> Previous
          </button>
          <span className="text-sm opacity-40">Page {page} of {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
