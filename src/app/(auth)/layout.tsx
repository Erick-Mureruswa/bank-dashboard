import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex" style={{ background: "var(--bg)" }}>

      {/* ── Left panel — dark luxury branding ──────────────────── */}
      <div
        className="hidden lg:flex w-[480px] xl:w-[520px] shrink-0 flex-col justify-between relative overflow-hidden p-10"
        style={{
          background: "#0c0c0f",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Ambient mesh — GPU-only, fixed layers */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(67,97,238,0.14) 0%, transparent 65%)," +
              "radial-gradient(ellipse 50% 40% at 80% 80%, rgba(16,185,129,0.07) 0%, transparent 55%)",
          }}
        />

        {/* Top — logo */}
        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
            style={{
              background: "rgba(67,97,238,0.15)",
              border: "1px solid rgba(67,97,238,0.3)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            <span className="text-[13px] font-bold" style={{ color: "#7b9cf0" }}>N</span>
          </div>
          <span className="text-[16px] font-semibold tracking-tight" style={{ color: "rgba(248,250,252,0.85)" }}>
            NexaBank
          </span>
        </Link>

        {/* Middle — headline */}
        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-6"
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.2)",
              color: "#10b981",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
            />
            Trusted by 500,000+ members
          </div>

          <h2
            className="font-display mb-5 leading-tight"
            style={{ fontSize: "clamp(2rem,3.5vw,2.8rem)", color: "var(--text)" }}
          >
            Banking that<br />
            <span className="text-gradient-accent">thinks ahead.</span>
          </h2>

          <p
            className="text-[14px] leading-relaxed max-w-[340px]"
            style={{ color: "var(--text-secondary)" }}
          >
            Enterprise-grade security, real-time analytics, and intelligent insights — designed for people who value precision.
          </p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mt-10">
            {[
              { value: "99.99%",  label: "Uptime SLA" },
              { value: "<1s",     label: "Transfer speed" },
              { value: "256-bit", label: "AES Encryption" },
              { value: "24/7",    label: "Live monitoring" },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="font-display text-[22px] mb-1"
                  style={{ color: "var(--text)" }}
                >
                  {s.value}
                </div>
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-[11px]" style={{ color: "var(--text-muted)" }}>
          © {new Date().getFullYear()} NexaBank. All rights reserved.
        </p>
      </div>

      {/* ── Right panel — form ──────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{
                background: "rgba(67,97,238,0.15)",
                border: "1px solid rgba(67,97,238,0.3)",
              }}
            >
              <span className="text-[12px] font-bold" style={{ color: "#7b9cf0" }}>N</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--text)" }}>
              NexaBank
            </span>
          </Link>

          {children}
        </div>
      </div>
    </div>
  );
}
