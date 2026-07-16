"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type ActorData = {
  id: string;
  name: string;
  role?: string | null;
  bio?: string | null;
  bioShort?: string | null;
  bioFull?: string | null;
  imageUrl: string;
};

type Step = "profile" | "tip" | "checkout" | "confirmed";

const PRESET_AMOUNTS = [10, 25, 50, 100];
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 10000;

export default function ViewerJourney({ actor }: { actor: ActorData }) {
  const [step, setStep] = useState<Step>("profile");
  const [tipAmount, setTipAmount] = useState("25");
  const [customAmount, setCustomAmount] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const effectiveAmount = useMemo(() => {
    const selected = customAmount.trim() ? customAmount : tipAmount;
    return Number(selected) || 0;
  }, [customAmount, tipAmount]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const validateAmount = (value: string) => {
    const numeric = Number(value);
    if (!value || Number.isNaN(numeric)) {
      setError("Choose an amount to continue.");
      return false;
    }

    if (numeric < MIN_AMOUNT) {
      setError(`Minimum tip is R${MIN_AMOUNT}.`);
      return false;
    }

    if (numeric > MAX_AMOUNT) {
      setError(`Maximum tip is R${MAX_AMOUNT}.`);
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

  const completeTip = () => {
    if (!validateAmount(customAmount.trim() ? customAmount : tipAmount)) return;
    setIsProcessing(true);
    window.setTimeout(() => {
      setIsProcessing(false);
      setStep("confirmed");
    }, 900);
  };

  const shareMoment = async () => {
    const shareText = `I just tipped ${actor.name} through A.TIPS. 80% of every tip goes directly to the actor.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Tip ${actor.name}`,
          text: shareText,
          url: typeof window !== "undefined" ? window.location.href : "",
        });
      } catch {
        // Ignore dismissals
      }
      return;
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
    }
  };

  const stepIndex = step === "profile" ? 1 : step === "tip" ? 2 : step === "checkout" ? 3 : 4;

  const renderStepContent = () => {
    switch (step) {
      case "tip":
        return (
          <div className="space-y-5 transition-all duration-300 ease-out">
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              Pick an amount that feels right. Every tip helps support the talent directly.
            </div>

            <div className="grid grid-cols-2 gap-3">
              {PRESET_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => {
                    setTipAmount(String(amount));
                    setCustomAmount("");
                    setError("");
                  }}
                  className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                    String(amount) === tipAmount && !customAmount
                      ? "border-cyan-300 bg-cyan-300/20 text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]"
                      : "border-white/10 bg-white/10 text-slate-300 hover:border-cyan-300/40 hover:bg-white/20"
                  }`}
                >
                  <span className="block text-lg">R{amount}</span>
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.28em] text-slate-400">
                    {amount >= 50 ? "High impact" : "Quick support"}
                  </span>
                </button>
              ))}
            </div>

            <label className="block rounded-2xl border border-white/10 bg-black/20 p-4">
              <span className="mb-2 block text-sm font-medium uppercase tracking-[0.24em] text-slate-400">
                Custom amount
              </span>
              <input
                type="number"
                min={MIN_AMOUNT}
                value={customAmount}
                onChange={(event) => {
                  setCustomAmount(event.target.value);
                  setError("");
                }}
                placeholder={`Minimum R${MIN_AMOUNT}`}
                className="w-full rounded-xl border border-white/10 bg-[#030816] px-4 py-3 text-lg font-semibold text-white outline-none ring-0 placeholder:text-slate-500"
              />
            </label>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <div className="font-semibold">80% goes directly to {actor.name}</div>
              <div className="mt-1 text-amber-50/80">The rest keeps the platform running smoothly.</div>
            </div>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("profile")}
                className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/12"
              >
                Back
              </button>
              <button
                onClick={goToCheckout}
                className="flex-1 rounded-2xl bg-linear-to-r from-cyan-400 to-fuchsia-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
              >
                Continue to checkout
              </button>
            </div>
          </div>
        );

      case "checkout":
        return (
          <div className="space-y-5 transition-all duration-300 ease-out">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Secure tip</div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <div className="text-3xl font-semibold text-white">R{effectiveAmount}</div>
                  <div className="text-sm text-slate-400">for {actor.name}</div>
                </div>
                <div className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
                  Mock success
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ["Card", "•••• 4242"],
                ["PayPal", "Fast checkout"],
                ["Bank transfer", "Instant"],
              ].map(([label, hint]) => (
                <button
                  key={label}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-white/10"
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-slate-400">{hint}</span>
                </button>
              ))}
            </div>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <div className="flex gap-3">
              <button
                onClick={() => setStep("tip")}
                className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/12"
              >
                Back
              </button>
              <button
                onClick={completeTip}
                disabled={isProcessing}
                className="flex-1 rounded-2xl bg-linear-to-r from-fuchsia-500 to-amber-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-wait disabled:opacity-70"
              >
                {isProcessing ? "Confirming…" : "Complete tip"}
              </button>
            </div>
          </div>
        );

      case "confirmed":
        return (
          <div className="space-y-5 transition-all duration-300 ease-out">
            <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 p-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/20 text-3xl text-emerald-200">
                ✓
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-white">Tip confirmed</h2>
              <p className="mt-2 text-sm text-emerald-50/80">
                Your tip of R{effectiveAmount} is on its way to {actor.name}.
              </p>
            </div>

            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm text-cyan-100">
              <div className="font-semibold">80% reaches the actor, directly.</div>
              <div className="mt-1 text-cyan-50/75">
                The remaining portion keeps the experience secure and running smoothly.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={shareMoment}
                className="flex-1 rounded-2xl border border-cyan-300/30 bg-cyan-300/20 px-4 py-3 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/30"
              >
                {copied ? "Copied" : "Share the moment"}
              </button>
              <button
                onClick={() => setStep("profile")}
                className="flex-1 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/12"
              >
                Back to profile
              </button>
            </div>
          </div>
        );

      case "profile":
      default:
        return (
          <div className="space-y-5 transition-all duration-300 ease-out">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
              <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Viewer landing</div>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {actor.bioFull || actor.bio || "A rising talent ready to be supported after the credits roll."}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
              <div className="font-semibold">Why fans love this</div>
              <div className="mt-1 text-amber-50/85">The experience is fast, premium, and frictionless from QR scan to confirmation.</div>
            </div>

            <button
              onClick={goToTipSelection}
              className="w-full rounded-2xl bg-linear-to-r from-cyan-400 via-sky-500 to-fuchsia-500 px-4 py-4 text-lg font-semibold text-slate-950 transition hover:opacity-90"
            >
              Tip this actor
            </button>
          </div>
        );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030816] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.20),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.22),transparent_34%),linear-gradient(135deg,#030816_0%,#071425_50%,#030816_100%)]" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "url('/glass.svg')", backgroundRepeat: "repeat", backgroundSize: "700px 500px" }} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-white/10 bg-white/10 p-4 shadow-[0_24px_80px_rgba(2,6,23,0.75)] backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-cyan-100">
              A.TIPS • QR Tip
            </div>
            <div className="text-sm text-slate-400">
              Step {stepIndex} / 4
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-white/10 bg-linear-to-br from-[#071129] via-[#071425] to-[#030816] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
              <div className="relative h-64 overflow-hidden rounded-3xl border border-white/10 sm:h-80">
                <Image src={actor.imageUrl} alt={actor.name} fill className="object-cover object-center" />
                <div className="absolute inset-0 bg-linear-to-t from-[#030816] via-[#030816]/10 to-transparent" />
              </div>

              <div className="mt-6">
                <div className="text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-200/90">
                  Featured performer
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                  {actor.name}
                </h1>
                <div className="mt-3 text-sm uppercase tracking-[0.28em] text-slate-400">
                  {actor.role || actor.bioShort || "On-screen presence"}
                </div>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  {actor.bioFull || actor.bio || "This profile is ready for a premium viewer experience."}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-[#050B16]/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:p-6">
              {renderStepContent()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
