"use client";

/**
 * ViewerJourney — the actor profile ("second page").
 *
 * Redesigned into a single cohesive, cinematic page rather than a cramped
 * 3-step wizard. Information appears exactly once:
 *   Hero (identity + live stats + CTAs) → About (bio, parsed highlights) →
 *   Tier 1 Support (inline tip) → Tier 2 Private Access (bookings).
 * Uses the shared design system (glass, gold/red glow, gradient text) and the
 * global header/footer in layout.tsx — no duplicate chrome.
 */

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import TierTwoAccess from "./TierTwoAccess";

type ActorData = {
  id: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  bioShort?: string | null;
  bioFull?: string | null;
  imageUrl: string;
  isPremium?: boolean | null;
};

type ActorStats = { tipsCount: number; totalAmount: number };

const PRESET_AMOUNTS = [10, 25, 50, 100];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 10000;

/** Split the seeded bio format ("intro… Key Highlights: - a - b") into parts. */
function parseBio(raw: string): { intro: string; highlights: string[] } {
  const marker = "Key Highlights:";
  const idx = raw.indexOf(marker);
  if (idx === -1) return { intro: raw.trim(), highlights: [] };
  const intro = raw.slice(0, idx).trim();
  const highlights = raw
    .slice(idx + marker.length)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"))
    .map((l) => l.replace(/^-\s*/, ""));
  return { intro, highlights };
}

export default function ViewerJourney({ actor }: { actor: ActorData }) {
  const [tipAmount, setTipAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<ActorStats | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/actors/${actor.id}/tips`)
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.stats) setStats(d.stats);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [actor.id]);

  const effectiveAmount = useMemo(() => {
    const selected = customAmount.trim() ? customAmount : tipAmount;
    return Number(selected) || 0;
  }, [customAmount, tipAmount]);

  const usdAmount = useMemo(() => (effectiveAmount / 18).toFixed(2), [effectiveAmount]);

  const { intro, highlights } = useMemo(
    () => parseBio(actor.bioFull || actor.bio || ""),
    [actor]
  );

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const validateAmount = (value: string) => {
    const numeric = Number(value);
    if (!value || Number.isNaN(numeric)) {
      setError("Please choose or enter a valid amount.");
      return false;
    }
    if (numeric < MIN_AMOUNT) {
      setError(`Minimum tip amount is R${MIN_AMOUNT}.`);
      return false;
    }
    if (numeric > MAX_AMOUNT) {
      setError(`Maximum tip amount is R${MAX_AMOUNT}.`);
      return false;
    }
    setError("");
    return true;
  };

  const triggerPayment = async () => {
    const amount = customAmount.trim() ? customAmount : tipAmount;
    if (!validateAmount(amount)) {
      scrollTo("tier-1");
      return;
    }

    setIsProcessing(true);
    setError("");

    try {
      let sessionToken = sessionStorage.getItem("atips_session");
      if (!sessionToken) {
        sessionToken = crypto.randomUUID();
        sessionStorage.setItem("atips_session", sessionToken);
      }

      const urlParams = new URLSearchParams(window.location.search);
      const showId = urlParams.get("showId") || undefined;
      const episodeId = urlParams.get("episodeId") || undefined;
      const qrCodeId = urlParams.get("qrCodeId") || undefined;

      const response = await fetch("/api/tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actorId: actor.id,
          amount: Number(amount),
          sessionToken,
          showId,
          episodeId,
          qrCodeId,
          source: window.location.pathname + window.location.search,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to initialize payment.");
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from payment gateway.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const role = actor.role || actor.bioShort || "Featured Performer";

  return (
    <main className="relative overflow-hidden bg-[#0A1F44] text-white">
      {/* AMBIENT GLOWS */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-8%] left-[-6%] w-[520px] h-[520px] bg-red-500/10 rounded-full blur-[150px] animate-soft-pulse-1" />
        <div className="absolute bottom-[6%] right-[-6%] w-[520px] h-[520px] bg-[#C9A34E]/10 rounded-full blur-[150px] animate-soft-pulse-2" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#071735]/40 to-[#040e29]" />
      </div>

      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-center">
          {/* PORTRAIT */}
          <div className="relative animate-rise-in">
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto lg:mx-0 rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(2,6,23,0.8)]">
              <Image
                src={actor.imageUrl}
                alt={actor.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
                className="object-cover object-[50%_15%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/10 to-transparent" />
              {actor.isPremium && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-[#C9A34E] to-[#E6C878] text-[#0A1F44] text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg">
                  ★ Premium Talent
                </span>
              )}
            </div>
          </div>

          {/* IDENTITY + STATS + CTAS */}
          <div className="space-y-6 animate-rise-in rise-delay-1">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E] bg-[#C9A34E]/10 border border-[#C9A34E]/25 px-3 py-1.5 rounded-full">
                {role}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] flex flex-wrap items-center gap-3">
                <span className="premium-text-gradient">{actor.name}</span>
                <svg className="w-7 h-7 text-[#C9A34E] shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-light max-w-xl leading-relaxed">
                Support {actor.name.split(" ")[0]} directly — 80% of every tip goes straight to the artist, or book private one-on-one access below.
              </p>
            </div>

            {/* LIVE STATS */}
            <div className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="block text-2xl font-extrabold leading-none">
                  {stats ? stats.tipsCount : "—"}
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 mt-1.5">
                  Supporters
                </span>
              </div>
              <div className="flex-1 min-w-[120px] rounded-2xl border border-[#C9A34E]/25 bg-[#C9A34E]/5 px-4 py-3">
                <span className="block text-2xl font-extrabold leading-none gold-text-gradient">
                  R{stats ? stats.totalAmount.toLocaleString() : "—"}
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 mt-1.5">
                  Raised by fans
                </span>
              </div>
              <div className="flex-1 min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                <span className="block text-2xl font-extrabold leading-none">80%</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 mt-1.5">
                  Goes to artist
                </span>
              </div>
            </div>

            {/* DUAL CTAS */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => scrollTo("tier-1")}
                className="flex-1 rounded-2xl bg-gradient-to-r from-[#D90429] to-[#A60321] px-6 py-4 text-sm font-bold text-white hover:from-[#ff1a3c] hover:to-[#b30026] shadow-lg shadow-red-950/30 transition active:scale-[0.98] red-glow-hover"
              >
                Send a Tip
              </button>
              <button
                onClick={() => scrollTo("tier2-access")}
                className="flex-1 rounded-2xl border border-[#C9A34E]/40 bg-[#C9A34E]/10 px-6 py-4 text-sm font-bold text-[#E6C878] hover:bg-[#C9A34E]/20 transition active:scale-[0.98] gold-glow-hover"
              >
                Book Private Access
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="gold-hairline my-4" />
      </div>

      {/* ================= ABOUT (single source of bio) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 animate-rise-in">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E]">
              About
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              The story behind the artist
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
              {intro}
            </p>
          </div>

          {highlights.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E]">
                Career Highlights
              </span>
              <ul className="mt-4 space-y-3">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-200 font-light">
                    <span className="mt-0.5 text-[#C9A34E]">◆</span>
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ================= TIER 1 — SUPPORT (inline tip) ================= */}
      <section id="tier-1" className="max-w-6xl mx-auto px-4 sm:px-6 py-8 scroll-mt-24">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_24px_80px_rgba(2,6,23,0.6)]">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D90429]">
                Tier 1 · Show Support
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Send {actor.name.split(" ")[0]} a tip
              </h2>
            </div>
            <span className="text-2xl">💛</span>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* AMOUNT SELECTION */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2 sm:gap-3">
                {PRESET_AMOUNTS.map((amount) => {
                  const selected = String(amount) === tipAmount && !customAmount;
                  return (
                    <button
                      key={amount}
                      onClick={() => {
                        setTipAmount(String(amount));
                        setCustomAmount("");
                        setError("");
                      }}
                      className={`rounded-2xl border px-2 py-4 text-center transition-all duration-300 ${
                        selected
                          ? "border-[#C9A34E] bg-[#C9A34E]/10 text-white gold-glow-active"
                          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <span className="block text-xl font-extrabold">R{amount}</span>
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C9A34E]">
                  Or enter a custom amount (ZAR)
                </span>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-lg font-semibold text-slate-400">R</span>
                  <input
                    type="number"
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter amount"
                    className="w-full rounded-xl border border-white/10 bg-[#0A1F44] pl-10 pr-4 py-3.5 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#C9A34E]/50 focus:border-[#C9A34E] transition placeholder:text-slate-500"
                  />
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 font-medium bg-red-950/20 border border-red-500/10 px-3 py-2 rounded-xl">
                  {error}
                </p>
              )}
            </div>

            {/* SUMMARY + PAY */}
            <div className="rounded-2xl border border-white/10 bg-[#0b2046]/60 p-5 flex flex-col justify-between shadow-inner">
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400">You give</span>
                    <p className="text-3xl font-extrabold text-white leading-none mt-1">R{effectiveAmount}</p>
                  </div>
                  <span className="text-xs text-slate-400">≈ ${usdAmount}</span>
                </div>
                <div className="gold-hairline" />
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#E6C878]">
                    <span>Direct to {actor.name.split(" ")[0]} (80%)</span>
                    <span className="font-bold">R{(effectiveAmount * 0.8).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Platform &amp; hosting (20%)</span>
                    <span>R{(effectiveAmount * 0.2).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={triggerPayment}
                  disabled={isProcessing}
                  className="w-full rounded-xl bg-gradient-to-r from-[#D90429] to-[#A60321] px-6 py-4 text-sm font-bold text-white hover:from-[#ff1a3c] hover:to-[#b30026] shadow-lg shadow-red-950/30 transition disabled:cursor-wait disabled:opacity-75 red-glow-hover flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Redirecting…
                    </>
                  ) : (
                    "Tip with PayPal"
                  )}
                </button>
                <p className="text-[10px] text-slate-500 text-center">
                  🔒 Secured by PayPal · Visa • Mastercard • AMEX
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TIER 2 — PRIVATE ACCESS ================= */}
      <TierTwoAccess actorId={actor.id} actorName={actor.name} />

      <div className="h-12" />
    </main>
  );
}
