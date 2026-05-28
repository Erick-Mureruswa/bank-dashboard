"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Snowflake, Unlock, UserCheck, UserX, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface AdminUser {
  id: string; email: string; name: string; role: string;
  isActive: boolean; isFrozen: boolean; createdAt: string; lastLoginAt: string | null;
  accounts: { balance: number; status: string }[];
  _count: { accounts: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: page.toString(), limit: "15" });
    if (search) params.set("search", search);
    try {
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.data ?? []);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { setPage(1); }, [search]);

  async function updateUser(id: string, payload: Record<string, unknown>) {
    setActionLoading(id);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await fetchUsers();
    } finally {
      setActionLoading(null);
    }
  }

  const totalBalance = (accounts: { balance: number }[]) => accounts.reduce((s, a) => s + a.balance, 0);

  return (
    <div className="space-y-6 fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm opacity-40 mt-0.5">{total} registered users</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
          <input type="text" placeholder="Search users..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none w-64"
            style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }} />
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {/* Table header */}
        <div className="grid grid-cols-6 px-5 py-3 text-xs font-semibold opacity-40 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="col-span-2">User</span>
          <span>Accounts</span>
          <span>Balance</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-3 opacity-40">
            <Loader2 size={20} className="animate-spin" /> Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="py-16 text-center opacity-40 text-sm">No users found.</div>
        ) : (
          <div className="divide-y" style={{ borderColor: "var(--border)" }}>
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-6 items-center px-5 py-4 hover:bg-white/3 transition-colors">
                <div className="col-span-2 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {user.name}
                      {user.role === "admin" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold text-white" style={{ background: "#7C3AED" }}>ADMIN</span>
                      )}
                    </p>
                    <p className="text-xs opacity-40">{user.email}</p>
                    <p className="text-[10px] opacity-30">Joined {formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <span className="text-sm">{user._count.accounts}</span>
                <span className="text-sm font-semibold">{formatCurrency(totalBalance(user.accounts))}</span>
                <div>
                  {user.isFrozen ? (
                    <span className="text-xs px-2 py-1 rounded-full font-medium text-blue-400 bg-blue-400/10">Frozen</span>
                  ) : user.isActive ? (
                    <span className="text-xs px-2 py-1 rounded-full font-medium text-green-500 bg-green-500/10">Active</span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full font-medium text-red-500 bg-red-500/10">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {actionLoading === user.id ? (
                    <Loader2 size={16} className="animate-spin opacity-40" />
                  ) : (
                    <>
                      <button
                        onClick={() => updateUser(user.id, { isFrozen: !user.isFrozen })}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: user.isFrozen ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)" }}
                        title={user.isFrozen ? "Unfreeze" : "Freeze"}>
                        {user.isFrozen ? <Unlock size={13} style={{ color: "#10B981" }} /> : <Snowflake size={13} style={{ color: "#3B82F6" }} />}
                      </button>
                      <button
                        onClick={() => updateUser(user.id, { isActive: !user.isActive })}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: user.isActive ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)" }}
                        title={user.isActive ? "Deactivate" : "Activate"}>
                        {user.isActive ? <UserX size={13} style={{ color: "#EF4444" }} /> : <UserCheck size={13} style={{ color: "#10B981" }} />}
                      </button>
                    </>
                  )}
                </div>
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
