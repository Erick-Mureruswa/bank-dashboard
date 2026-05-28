import { getAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";
import MobileNav from "@/components/layout/MobileNav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const authUser = await getAuthUser();
  if (!authUser) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: authUser.userId },
    select: { name: true, email: true, isFrozen: true },
  });
  if (!user) redirect("/login");

  const unreadCount = await prisma.notification.count({
    where: { userId: authUser.userId, read: false },
  });

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      <Sidebar userName={user.name} userEmail={user.email} unreadCount={unreadCount} />
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {children}
      </div>
      <MobileNav />
    </div>
  );
}
