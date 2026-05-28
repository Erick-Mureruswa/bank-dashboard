"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  House, ArrowsLeftRight, ClockCounterClockwise, PiggyBank, ShieldCheck,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard",    icon: House,                  label: "Home" },
  { href: "/transfer",     icon: ArrowsLeftRight,        label: "Transfer" },
  { href: "/transactions", icon: ClockCounterClockwise,  label: "History" },
  { href: "/savings",      icon: PiggyBank,              label: "Savings" },
  { href: "/security",     icon: ShieldCheck,            label: "Security" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
      style={{
        background: "rgba(12,12,15,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {items.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-3 btn-press"
            style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
          >
            <item.icon size={20} weight={active ? "fill" : "regular"} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {active && (
              <span
                className="absolute bottom-0 h-[2px] w-8 rounded-t-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
