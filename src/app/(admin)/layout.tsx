import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const auth = await getAuthUser();
  if (!auth || auth.role !== "admin") redirect("/dashboard");

  const user = await prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true } });

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 border-b"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <span className="font-bold text-gradient">NexaBank</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white ml-1" style={{ background: "#7C3AED" }}>ADMIN</span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {[
              { href: "/admin", label: "Overview" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/transactions", label: "Transactions" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="px-4 py-2 rounded-lg text-sm font-medium opacity-60 hover:opacity-100 transition-opacity">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-medium opacity-50 hover:opacity-100">← Back to Banking</Link>
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold">
            {user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
        </div>
      </header>
      <main className="p-8 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}
