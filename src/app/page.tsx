"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";
import {
  ShieldCheck, Lightning, TrendUp, Lock, CreditCard, ChartBar,
  ArrowRight, CheckCircle, ArrowUpRight,
} from "@phosphor-icons/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    desc: "256-bit AES encryption, adaptive MFA, and real-time fraud detection on every transaction.",
    color: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.14)",
  },
  {
    icon: Lightning,
    title: "Instant Transfers",
    desc: "Move money to anyone in seconds. Zero delays, zero hidden fees, full audit trail.",
    color: "#4361ee",
    bg: "rgba(67,97,238,0.08)",
    border: "rgba(67,97,238,0.14)",
  },
  {
    icon: TrendUp,
    title: "AI Spending Insights",
    desc: "Smart analytics surface your spending patterns and generate actionable financial advice.",
    color: "#a855f7",
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.14)",
  },
  {
    icon: Lock,
    title: "Zero-Trust Architecture",
    desc: "Role-based access control and immutable audit logs on every administrative action.",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.14)",
  },
  {
    icon: CreditCard,
    title: "Multi-Account Management",
    desc: "Checking, savings, and business accounts unified in a single, coherent dashboard.",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.14)",
  },
  {
    icon: ChartBar,
    title: "Financial Health Score",
    desc: "A live composite score tracking savings rate, spending habits, and balance trends.",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.14)",
  },
];

const stats = [
  { value: "$2.4B+",   label: "Assets Under Management" },
  { value: "500K+",    label: "Active Members" },
  { value: "99.99%",   label: "Uptime SLA" },
  { value: "<0.01%",   label: "Fraud Rate" },
];

/* ─── Fake balance card for hero visual ───────────────────── */
function HeroCard() {
  return (
    <div
      className="w-full max-w-[340px] rounded-[1.5rem] p-5 mx-auto"
      style={{
        background: "linear-gradient(145deg, #131520 0%, #0e1019 100%)",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 32px 64px rgba(0,0,0,0.6)",
      }}
    >
      {/* Card top */}
      <div className="flex items-center justify-between mb-5">
        <div
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide"
          style={{ background: "rgba(67,97,238,0.12)", border: "1px solid rgba(67,97,238,0.25)", color: "#7b9cf0" }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 5px #10b981" }} />
          Checking
        </div>
        <span className="text-[11px] font-data" style={{ color: "rgba(248,250,252,0.28)" }}>
          •••• 4291
        </span>
      </div>

      {/* Balance */}
      <p className="text-[11px] uppercase tracking-widest mb-1" style={{ color: "rgba(248,250,252,0.28)" }}>
        Available Balance
      </p>
      <p className="font-display text-[2.2rem] tracking-tight mb-5" style={{ color: "#f8fafc" }}>
        $12,450.75
      </p>

      {/* Mini chart bars */}
      <div className="flex items-end gap-1.5 h-12 mb-4">
        {[40, 65, 50, 80, 60, 90, 75].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${h}%`,
              background: i === 6
                ? "rgba(67,97,238,0.9)"
                : "rgba(255,255,255,0.06)",
            }}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div
          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <TrendUp size={10} weight="bold" />
          +3.2% this month
        </div>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
          style={{ background: "linear-gradient(135deg,#4361ee,#5b7af0)", color: "#fff" }}
        >
          JS
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const heroRef   = useRef<HTMLDivElement>(null);
  const statsRef  = useRef<HTMLDivElement>(null);
  const featRef   = useRef<HTMLDivElement>(null);
  const ctaRef    = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* Hero entrance */
      gsap.from(".hero-text > *", {
        y: 28, opacity: 0, duration: 0.9,
        ease: "power3.out", stagger: 0.12, delay: 0.1,
      });
      gsap.from(".hero-card", {
        y: 40, opacity: 0, duration: 1.1,
        ease: "power3.out", delay: 0.35,
      });

      /* Stats on scroll */
      gsap.from(".stat-item", {
        scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
        y: 20, opacity: 0, duration: 0.7,
        ease: "power2.out", stagger: 0.08,
      });

      /* Feature cards on scroll */
      gsap.from(".feat-card", {
        scrollTrigger: { trigger: featRef.current, start: "top 80%" },
        y: 30, opacity: 0, duration: 0.65,
        ease: "power2.out", stagger: 0.07,
      });

      /* CTA on scroll */
      gsap.from(".cta-inner", {
        scrollTrigger: { trigger: ctaRef.current, start: "top 82%" },
        y: 24, opacity: 0, duration: 0.8,
        ease: "power2.out",
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-dvh" style={{ background: "var(--bg)" }}>

      {/* ── Floating pill navbar ──────────────────────────────── */}
      <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
        <nav
          className="flex items-center justify-between w-full max-w-4xl px-5 h-12 rounded-full"
          style={{
            background: "rgba(17,17,20,0.85)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.09)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(67,97,238,0.15)",
                border: "1px solid rgba(67,97,238,0.3)",
              }}
            >
              <span className="text-[11px] font-bold" style={{ color: "#7b9cf0" }}>N</span>
            </div>
            <span className="text-[14px] font-semibold tracking-tight" style={{ color: "rgba(248,250,252,0.85)" }}>
              NexaBank
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-full text-[12px] font-medium btn-press"
              style={{ color: "var(--text-secondary)" }}
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-1.5 rounded-full text-[12px] font-semibold btn-press flex items-center gap-1.5"
              style={{
                background: "linear-gradient(135deg,#4361ee,#5b7af0)",
                color: "#fff",
                boxShadow: "0 2px 12px rgba(67,97,238,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
              }}
            >
              Get Started <ArrowRight size={11} weight="bold" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="min-h-dvh flex items-center pt-24 pb-20 px-6 relative overflow-hidden">
        {/* Ambient mesh */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 55% at 15% 20%, rgba(67,97,238,0.13) 0%, transparent 65%)," +
              "radial-gradient(ellipse 50% 45% at 85% 75%, rgba(16,185,129,0.07) 0%, transparent 55%)",
          }}
        />

        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div className="hero-text">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-widest mb-7"
              style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.2)",
                color: "#10b981",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }}
              />
              Enterprise-Grade Digital Banking
            </div>

            <h1
              className="font-display leading-none mb-6"
              style={{ fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)", color: "var(--text)" }}
            >
              Banking built<br />
              for the{" "}
              <span className="text-gradient-accent">future.</span>
            </h1>

            <p
              className="text-[16px] leading-relaxed mb-10 max-w-[480px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Real-time analytics, AI-powered insights, and enterprise security —
              all in one premium platform designed for people who demand more.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[14px] font-semibold btn-press"
                style={{
                  background: "linear-gradient(135deg,#4361ee,#5b7af0)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(67,97,238,0.35), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                Open an Account
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <ArrowRight size={12} weight="bold" />
                </span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full text-[14px] font-semibold btn-press"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "var(--text)",
                }}
              >
                Sign In to Dashboard
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-5 mt-10">
              {["No monthly fees", "FDIC insured", "Cancel anytime"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
                  <CheckCircle size={13} weight="fill" style={{ color: "#10b981" }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Right — hero card */}
          <div className="hero-card flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glow behind card */}
              <div
                className="absolute -inset-8 rounded-full"
                style={{
                  background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(67,97,238,0.16) 0%, transparent 70%)",
                  filter: "blur(24px)",
                }}
              />
              <HeroCard />

              {/* Floating notification chip */}
              <div
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold"
                style={{
                  background: "#111114",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  color: "var(--text)",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
                Transfer completed
              </div>

              {/* Floating insight chip */}
              <div
                className="absolute -bottom-4 -left-6 flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold"
                style={{
                  background: "#111114",
                  border: "1px solid rgba(255,255,255,0.1)",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                  color: "var(--text)",
                }}
              >
                <ArrowUpRight size={12} weight="bold" style={{ color: "#4361ee" }} />
                Savings up 12% this quarter
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <section
        ref={statsRef}
        className="py-12 px-6"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="stat-item text-center">
              <div
                className="font-display mb-1"
                style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", color: "var(--text)" }}
              >
                {s.value}
              </div>
              <div className="text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features bento ───────────────────────────────────── */}
      <section ref={featRef} className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section header */}
          <div className="mb-14 max-w-xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-5"
              style={{
                background: "rgba(67,97,238,0.08)",
                border: "1px solid rgba(67,97,238,0.15)",
                color: "#7b9cf0",
              }}
            >
              Platform capabilities
            </div>
            <h2
              className="font-display leading-tight mb-4"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "var(--text)" }}
            >
              Everything a modern bank should be.
            </h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Purpose-built for individuals and businesses who expect more from their financial tools.
            </p>
          </div>

          {/* Asymmetric grid — 2 wide + 4 standard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="feat-card rounded-2xl p-6 card-hover"
                style={{
                  background: "#111114",
                  border: "1px solid rgba(255,255,255,0.07)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <f.icon size={18} weight="regular" style={{ color: f.color }} />
                </div>
                <h3
                  className="text-[14px] font-semibold mb-2 tracking-tight"
                  style={{ color: "var(--text)" }}
                >
                  {f.title}
                </h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section ref={ctaRef} className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div
            className="cta-inner rounded-[2rem] p-12 text-center relative overflow-hidden"
            style={{
              background: "#111114",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(67,97,238,0.12) 0%, transparent 65%)",
              }}
            />

            <div className="relative">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest mb-6"
                style={{
                  background: "rgba(67,97,238,0.1)",
                  border: "1px solid rgba(67,97,238,0.2)",
                  color: "#7b9cf0",
                }}
              >
                Start today — free
              </div>

              <h2
                className="font-display mb-4"
                style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)", color: "var(--text)" }}
              >
                Ready to bank smarter?
              </h2>
              <p
                className="text-[15px] leading-relaxed mb-8 max-w-md mx-auto"
                style={{ color: "var(--text-secondary)" }}
              >
                Join thousands of members who manage their finances with precision and confidence.
              </p>

              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-[14px] font-semibold btn-press"
                style={{
                  background: "linear-gradient(135deg,#4361ee,#5b7af0)",
                  color: "#fff",
                  boxShadow: "0 4px 20px rgba(67,97,238,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                Create Free Account
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <ArrowRight size={12} weight="bold" />
                </span>
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
                {["No monthly fees", "FDIC insured", "Cancel anytime"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-[12px]" style={{ color: "var(--text-muted)" }}>
                    <CheckCircle size={12} weight="fill" style={{ color: "#10b981" }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 text-center text-[12px]"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          color: "var(--text-muted)",
        }}
      >
        © {new Date().getFullYear()} NexaBank. Built with Next.js · Supabase · Prisma · Tailwind CSS.
      </footer>
    </div>
  );
}
