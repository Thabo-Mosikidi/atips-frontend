"use client";

/**
 * TipFlow — dedicated Tier 1 tipping page (/actors/[id]/tip).
 * Split out of the profile so the profile stays a clean landing. Carries any
 * QR context (showId/episodeId/qrCodeId) forwarded in the query string so
 * scans are still attributed.
 */

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

const PRESET_AMOUNTS = [10, 25, 50];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 1000; // official rule: max single transaction R1,000

export default function TipFlow({
  actorId,
  actorName,
  role,
  imageUrl,
}: {
  actorId: string;
  actorName: string;
  role: string;
  imageUrl: string;
}) {
  const [tipAmount, setTipAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const firstName = actorName.split(" ")[0];

  const effectiveAmount = useMemo(() => {
    const selected = customAmount.trim() ? customAmount : tipAmount;
    return Number(selected) || 0;
  }, [customAmount, tipAmount]);

  const usdAmount = useMemo(() => (effectiveAmount / 18).toFixed(2), [effectiveAmount]);

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
    if (!validateAmount(amount)) return;

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
          actorId,
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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F44] text-white py-10 px-4 sm:px-6">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[130px] animate-soft-pulse-1" />
        <div className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-[#C9A34E]/10 rounded-full blur-[130px] animate-soft-pulse-2" />
      </div>

      <div className="max-w-2xl mx-auto animate-rise-in">
        <Link
          href={`/actors/${actorId}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
        >
          <span aria-hidden>←</span> Back to {firstName}&apos;s profile
        </Link>

        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_24px_80px_rgba(2,6,23,0.7)]">
          {/* HEADER */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-5">
            <div className="relative h-16 w-16 rounded-2xl overflow-hidden border border-white/10 shrink-0">
              <Image src={imageUrl} alt={actorName} fill sizes="64px" className="object-cover object-[50%_15%]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#D90429]">
                Tier 1 · Show Support
              </span>
              <h1 className="text-xl font-bold text-white tracking-tight">Tip {actorName}</h1>
              <p className="text-xs text-slate-400">{role}</p>
            </div>
          </div>

          {/* PRESETS */}
          <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-3">
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

          {/* CUSTOM */}
          <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2">
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

          {/* AMOUNT SUMMARY */}
          <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b2046]/60 p-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-400">Your tip</span>
                <p className="text-3xl font-extrabold text-white leading-none mt-1">R{effectiveAmount}</p>
              </div>
              <span className="text-xs text-slate-400">≈ ${usdAmount}</span>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-xs text-red-400 font-medium bg-red-950/20 border border-red-500/10 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}

          <button
            onClick={triggerPayment}
            disabled={isProcessing}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#D90429] to-[#A60321] px-6 py-4 text-sm font-bold text-white hover:from-[#ff1a3c] hover:to-[#b30026] shadow-lg shadow-red-950/30 transition disabled:cursor-wait disabled:opacity-75 red-glow-hover flex items-center justify-center gap-2"
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
          <p className="mt-2 text-[10px] text-slate-500 text-center">
            🔒 Secured by PayPal · Visa • Mastercard • AMEX
          </p>
        </div>
      </div>
    </main>
  );
}
