"use client";
import { useState, useEffect, useCallback } from "react";
import TopBar from "@/components/layout/TopBar";
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { formatCurrency, formatDateTime, getCategoryIcon, getCategoryColor } from "@/lib/utils";
import type { Transaction, Account } from "@/types";

const CATEGORIES = ["all","food","transport","shopping","entertainment","utilities","health","travel","education","salary","other"];
const STATUSES = ["all","completed","pending","failed"];
const TYPES = ["all","transfer","deposit","withdrawal","payment","refund"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [userName, setUserName] = useState("User");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "15" });
    if (search) params.set("search", search);
    if (category !== "all") params.set("category", category);
    if (status !== "all") params.set("status", status);
    if (type !== "all") params.set("type", type);

    try {
      const res = await fetch(`/api/transactions?${params}`);
      const data = await res.json();
      setTransactions(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, status, type]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);
  useEffect(() => { setPage(1); }, [search, category, status, type]);

  useEffect(() => {
    fetch("/api/accounts").then((r) => r.json()).then((d) => setAccounts(d.data ?? [])).catch(() => {});
    fetch("/api/auth/me").then((r) => r.json()).then((d) => setUserName(d.data?.name ?? "User")).catch(() => {});
  }, []);

  const myAccountIds = accounts.map((a) => a.id);

  function exportCSV() {
    const header = "Date,Description,Category,Type,Amount,Status,Reference\n";
    const rows = transactions.map((t) => {
      const isOut = myAccountIds.includes(t.fromAccountId ?? "");
      const sign = isOut ? "-" : "+";
      return `"${formatDateTime(t.createdAt)}","${t.description ?? ""}","${t.category}","${t.type}","${sign}${t.amount}","${t.status}","${t.reference}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
  }

  return (
    <>
      <TopBar title="Transactions" userName={userName} />
      <main className="flex-1 p-6 space-y-4 max-w-5xl mx-auto w-full">
        {/* Search & Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input type="text" placeholder="Search transactions..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              onFocus={(e) => (e.target.style.borderColor = "#4361EE")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: showFilters ? "#4361EE" : "var(--card)", color: showFilters ? "white" : "var(--foreground)", border: "1px solid var(--border)" }}>
            <Filter size={15} /> Filters
          </button>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <Download size={15} /> Export
          </button>
        </div>

        {showFilters && (
          <div className="flex gap-3 flex-wrap p-4 rounded-2xl fade-in-up"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            {[
              { label: "Category", value: category, setter: setCategory, options: CATEGORIES },
              { label: "Status", value: status, setter: setStatus, options: STATUSES },
              { label: "Type", value: type, setter: setType, options: TYPES },
            ].map(({ label, value, setter, options }) => (
              <div key={label}>
                <label className="block text-xs opacity-50 mb-1">{label}</label>
                <select value={value} onChange={(e) => setter(e.target.value)}
                  className="px-3 py-2 rounded-lg text-sm outline-none capitalize"
                  style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}>
                  {options.map((o) => <option key={o} value={o} className="capitalize">{o === "all" ? `All ${label}s` : o}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="text-xs opacity-40 font-medium">{total} transaction{total !== 1 ? "s" : ""}</div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          {loading ? (
            <div className="py-16 flex items-center justify-center gap-3 opacity-40">
              <Loader2 size={20} className="animate-spin" /> Loading transactions...
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center opacity-40 text-sm">No transactions found.</div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {transactions.map((tx) => {
                const isOut = myAccountIds.includes(tx.fromAccountId ?? "");
                const sign = isOut ? "-" : "+";
                const amountColor = isOut ? "#EF4444" : "#10B981";

                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/3">
                    <div className="w-10 h-10 rounded-xl text-lg flex items-center justify-center shrink-0"
                      style={{ background: `${getCategoryColor(tx.category)}18` }}>
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {tx.description || (isOut ? "Transfer Sent" : "Transfer Received")}
                        {tx.isFlagged && <span className="ml-2 text-xs px-1.5 py-0.5 rounded font-bold" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>⚠ Flagged</span>}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <p className="text-xs opacity-40">{formatDateTime(tx.createdAt)}</p>
                        <span className="text-xs px-2 py-0.5 rounded-full capitalize font-medium"
                          style={{ background: `${getCategoryColor(tx.category)}18`, color: getCategoryColor(tx.category) }}>
                          {tx.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end text-sm font-bold" style={{ color: amountColor }}>
                        {isOut ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                        {sign}{formatCurrency(tx.amount)}
                      </div>
                      <span className={`text-[10px] font-medium capitalize px-2 py-0.5 rounded-full ${
                        tx.status === "completed" ? "text-green-500 bg-green-500/10" :
                        tx.status === "pending" ? "text-yellow-500 bg-yellow-500/10" : "text-red-500 bg-red-500/10"
                      }`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-opacity"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="text-sm opacity-40">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-30 transition-opacity"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              Next <ChevronRight size={16} />
            </button>
          </div>
        )}
      </main>
    </>
  );
}
