"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ActorData = {
  id: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  bioShort?: string | null;
  bioFull?: string | null;
  imageUrl: string;
};

type Step = "profile" | "tip" | "checkout";

const PRESET_AMOUNTS = [10, 25, 50, 100];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 10000;

export default function ViewerJourney({ actor }: { actor: ActorData }) {
  const [step, setStep] = useState<Step>("profile");
  const [tipAmount, setTipAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const effectiveAmount = useMemo(() => {
    const selected = customAmount.trim() ? customAmount : tipAmount;
    return Number(selected) || 0;
  }, [customAmount, tipAmount]);

  const usdAmount = useMemo(() => {
    return (effectiveAmount / 18).toFixed(2);
  }, [effectiveAmount]);

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

  const goToTipSelection = () => {
    setStep("tip");
    setError("");
  };

  const goToCheckout = () => {
    const amount = customAmount.trim() ? customAmount : tipAmount;
    if (!validateAmount(amount)) return;
    setStep("checkout");
  };

  const triggerPayment = async () => {
    const amount = customAmount.trim() ? customAmount : tipAmount;
    if (!validateAmount(amount)) return;

    setIsProcessing(true);
    setError("");

    try {
      // Create session token or get from session storage
      let sessionToken = sessionStorage.getItem("atips_session");
      if (!sessionToken) {
        sessionToken = crypto.randomUUID();
        sessionStorage.setItem("atips_session", sessionToken);
      }

      // Check for showId / episodeId in query parameters
      const urlParams = new URLSearchParams(window.location.search);
      const showId = urlParams.get("showId") || undefined;
      const episodeId = urlParams.get("episodeId") || undefined;
      const qrCodeId = urlParams.get("qrCodeId") || undefined;

      const response = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment.");
      }

      // Redirect to PayPal Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned from payment gateway.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  const stepIndex = step === "profile" ? 1 : step === "tip" ? 2 : 3;

  const renderStepContent = () => {
    switch (step) {
      case "tip":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Select Tip Amount</h2>
              <p className="text-xs text-slate-400">100% secure transaction. Choose an option below:</p>
            </div>

            {/* PRESETS */}
            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setTipAmount(String(amount));
                    setCustomAmount("");
                    setError("");
                  }}
                  className={`relative rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                    String(amount) === tipAmount && !customAmount
                      ? "border-[#C9A34E] bg-[#C9A34E]/10 text-white gold-glow-active"
                      : "border-white/5 bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-2xl font-bold">R{amount}</span>
                  <span className="mt-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    {amount >= 50 ? "High impact" : "Quick support"}
                  </span>
                  
                  {String(amount) === tipAmount && !customAmount && (
                    <span className="absolute top-3 right-3 w-2 h-2 bg-[#C9A34E] rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* CUSTOM INPUT */}
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-2">
              <span className="block text-[10px] font-bold uppercase tracking-widest text-[#C9A34E]">
                Custom amount (ZAR)
              </span>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-lg font-semibold text-slate-400">R</span>
                <input
                  type="number"
                  min={MIN_AMOUNT}
                  max={MAX_AMOUNT}
                  value={customAmount}
                  onChange={(event) => {
                    setCustomAmount(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter custom amount"
                  className="w-full rounded-xl border border-white/10 bg-[#0A1F44] pl-10 pr-4 py-3.5 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#C9A34E]/50 focus:border-[#C9A34E] transition placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* SPLIT BREAKDOWN */}
            <div className="rounded-2xl border border-[#C9A34E]/10 bg-[#C9A34E]/5 p-4 text-xs text-[#C9A34E]/90 leading-relaxed space-y-1">
              <div className="font-semibold flex justify-between">
                <span>80% goes directly to {actor.name}</span>
                <span className="text-white">R{(effectiveAmount * 0.8).toFixed(2)}</span>
              </div>
              <div className="text-slate-400 flex justify-between">
                <span>20% platform & hosting fee</span>
                <span>R{(effectiveAmount * 0.2).toFixed(2)}</span>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-medium bg-red-950/20 border border-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("profile")}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition"
              >
                Back
              </button>
              <button
                onClick={goToCheckout}
                className="flex-1 rounded-xl bg-gradient-to-r from-[#D90429] to-[#A60321] px-4 py-3.5 text-sm font-bold text-white hover:from-[#ff1a3c] hover:to-[#b30026] shadow-lg shadow-red-950/20 transition red-glow-hover"
              >
                Continue
              </button>
            </div>
          </div>
        );

      case "checkout":
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Confirm & Pay</h2>
              <p className="text-xs text-slate-400">Review your tip summary details below:</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d254f]/50 p-5 space-y-4 shadow-inner">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Recipient</span>
                  <p className="text-base font-bold text-white">{actor.name}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Role</span>
                  <p className="text-xs text-[#C9A34E] font-medium">{actor.role || "Featured Performer"}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">Amount</span>
                  <p className="text-3xl font-extrabold text-white">R{effectiveAmount}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400">USD Approx</span>
                  <p className="text-sm font-medium text-slate-300">≈ ${usdAmount} USD</p>
                </div>
              </div>
            </div>

            {/* TRUST BADGE AND SECURITY STATEMENTS */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-lg">🔒</span>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  Your transaction is encrypted. We partner with <span className="font-semibold text-white">PayPal</span> for secure global payment capture.
                </p>
              </div>

              {/* Secure logos */}
              <div className="flex justify-center items-center gap-3 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition duration-300">
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 object-contain" />
                <span className="text-slate-500">|</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Visa • Mastercard • AMEX</span>
              </div>
            </div>

            {error && <p className="text-xs text-red-400 font-medium bg-red-950/20 border border-red-500/10 px-3 py-2 rounded-xl">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("tip")}
                disabled={isProcessing}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-200 hover:bg-white/10 transition disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={triggerPayment}
                disabled={isProcessing}
                className="flex-[2] rounded-xl bg-gradient-to-r from-[#D90429] to-[#A60321] px-6 py-3.5 text-sm font-bold text-white hover:from-[#ff1a3c] hover:to-[#b30026] shadow-lg shadow-red-950/30 transition disabled:opacity-75 disabled:cursor-wait red-glow-hover flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Redirecting to PayPal...
                  </>
                ) : (
                  "Pay Now with PayPal"
                )}
              </button>
            </div>
          </div>
        );

      case "profile":
      default:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-4">
              <div className="inline-block text-[9px] uppercase tracking-[0.3em] font-bold text-[#C9A34E] bg-[#C9A34E]/10 border border-[#C9A34E]/20 px-3 py-1 rounded-md">
                Viewer Landing
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">Support local artist</h2>
              <p className="text-sm text-slate-300 leading-relaxed font-light">
                {actor.bioFull || actor.bio || "A highly respected screen actor. Show your appreciation for their role and performance directly."}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 shadow-inner">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Why support directly?</h3>
              <ul className="text-xs text-slate-400 space-y-2 font-light">
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A34E]">✓</span>
                  <span>Direct contribution (80% net goes to the actor)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A34E]">✓</span>
                  <span>Instant, frictionless digital tip execution</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#C9A34E]">✓</span>
                  <span>Secured and guaranteed transaction audits</span>
                </li>
              </ul>
            </div>

            <button
              onClick={goToTipSelection}
              className="w-full rounded-xl bg-gradient-to-r from-[#D90429] to-[#A60321] py-4 text-base font-bold text-white hover:from-[#ff1a3c] hover:to-[#b30026] shadow-lg shadow-red-950/30 transition-all duration-200 active:scale-[0.98] red-glow-hover"
            >
              Tip This Actor
            </button>
          </div>
        );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F44] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* SUBTLE GLOW OVERLAYS */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-[#C9A34E]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-4xl w-full mx-auto">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 md:p-10 shadow-[0_24px_80px_rgba(2,6,23,0.7)] backdrop-blur-xl border border-white/10">
          
          {/* HEADER ROW */}
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition">
              <img src="/favicon.png" alt="A.TIPS Logo" className="w-6 h-6 object-contain" />
              <span className="tracking-tighter font-extrabold text-sm text-white uppercase">A.TIPS</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Step {stepIndex} of 3
              </span>
              <div className="flex gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${step === "profile" ? "bg-[#C9A34E]" : "bg-slate-600"}`}></span>
                <span className={`w-1.5 h-1.5 rounded-full ${step === "tip" ? "bg-[#C9A34E]" : "bg-slate-600"}`}></span>
                <span className={`w-1.5 h-1.5 rounded-full ${step === "checkout" ? "bg-[#C9A34E]" : "bg-slate-600"}`}></span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID FOR DESKTOP */}
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            
            {/* LEFT PROFILE PANEL */}
            <div className="bg-[#0b2046]/80 rounded-2xl border border-white/5 p-5 flex flex-col space-y-6 shadow-inner">
              <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-white/10 bg-slate-950">
                <Image
                  src={actor.imageUrl}
                  alt={actor.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  priority
                  className="object-cover object-[50%_18%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-transparent to-transparent" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A34E]">
                  {actor.role || actor.bioShort || "Featured Performer"}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                  {actor.name}
                </h1>
              </div>
            </div>

            {/* RIGHT WIZARD PANEL */}
            <div className="bg-[#071329]/90 rounded-2xl border border-white/5 p-5 sm:p-6 shadow-inner flex flex-col justify-between min-h-[380px]">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
