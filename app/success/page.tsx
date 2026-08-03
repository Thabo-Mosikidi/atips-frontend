"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface SuccessPageProps {
  searchParams: Promise<{
    actorId?: string;
    actorName?: string;
    amount?: string;
    transactionId?: string;
    type?: string; // "tip" (default) | "booking" | "promotion"
  }>;
}

// Each payment type captures against its own status endpoint, and a
// successful capture resolves to a different terminal status.
const CAPTURE_CONFIG: Record<string, { endpoint: string; okStatus: string }> = {
  tip: { endpoint: "/api/tips/status", okStatus: "COMPLETED" },
  booking: { endpoint: "/api/bookings/status", okStatus: "CONFIRMED" },
  promotion: { endpoint: "/api/promotions/status", okStatus: "ACTIVE" },
};

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = use(searchParams);
  const { actorId, actorName, amount, transactionId } = params;
  const type = params.type || "tip";

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [tipDetails, setTipDetails] = useState<any>(null);

  useEffect(() => {
    if (!transactionId) {
      setVerifying(false);
      setSuccess(true); // Fallback to simple query details if no transaction ID
      return;
    }

    const cfg = CAPTURE_CONFIG[type] ?? CAPTURE_CONFIG.tip;

    const verifyTransaction = async () => {
      try {
        const response = await fetch(cfg.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ transactionId }),
        });

        const data = await response.json();

        if (response.ok && data.status === cfg.okStatus) {
          setSuccess(true);
          setTipDetails(data.tip ?? data.booking ?? data.promotion ?? null);
        } else {
          setError(data.error || "Could not verify your payment capture status.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("Network error occurred during payment verification.");
      } finally {
        setVerifying(false);
      }
    };

    verifyTransaction();
  }, [transactionId, type]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F44] text-white flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* GLOW DECORATIONS */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] w-[500px] h-[500px] bg-[#C9A34E]/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-md w-full mx-auto relative z-10">
        <div className="glass-panel rounded-3xl p-8 text-center space-y-6 shadow-2xl backdrop-blur-xl border border-white/10">
          
          {verifying && (
            <div className="space-y-6 py-6 animate-pulse">
              <div className="flex justify-center">
                <svg className="animate-spin h-14 w-14 text-[#C9A34E]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Securing Your Transaction</h1>
                <p className="text-xs text-slate-400">Verifying secure PayPal capture, please do not close this window...</p>
              </div>
            </div>
          )}

          {!verifying && error && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-red-950/40 border border-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl shadow-lg">
                  ✕
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-white tracking-tight">Verification Delayed</h1>
                <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/10 px-3 py-2 rounded-xl">
                  {error}
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
                  Your funds are secure. PayPal is finishing confirmation. You can safely go back, and the transaction will update in the background.
                </p>
              </div>
            </div>
          )}

          {!verifying && success && (
            <div className="space-y-6 py-4 animate-fade-in">
              <div className="flex justify-center">
                <div className="h-16 w-16 bg-green-950/40 border border-green-500/20 text-green-400 rounded-full flex items-center justify-center text-3xl shadow-lg shadow-green-950/30">
                  ✓
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C9A34E]">
                  Tip Completed
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">
                  Thank You!
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed font-light px-2">
                  Your support has been securely sent. A copy of the reference code is listed below.
                </p>
              </div>

              {/* DETAILS CARD */}
              <div className="bg-[#0b2046]/80 rounded-2xl border border-white/5 p-5 text-left space-y-3">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-slate-400">Actor</span>
                  <span className="text-xs font-bold text-white">{actorName || "Featured Performer"}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-xs text-slate-400">Amount (ZAR)</span>
                  <span className="text-sm font-extrabold text-white">R{amount || (tipDetails ? tipDetails.amount / 100 : "--")}</span>
                </div>
                {tipDetails?.readableReference && (
                  <div className="flex justify-between pt-1">
                    <span className="text-[10px] text-slate-400">Receipt Ref</span>
                    <span className="text-[10px] font-mono text-slate-200">{tipDetails.readableReference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTAS */}
          <div className="space-y-2 pt-4">
            {actorId && (
              <Link
                href={`/actors/${actorId}`}
                className="block w-full text-center bg-gradient-to-r from-[#D90429] to-[#A60321] text-white py-3.5 text-sm rounded-xl font-bold hover:from-[#ff1a3c] hover:to-[#b30026] shadow-md shadow-red-950/20 transition-all duration-200 red-glow-hover"
              >
                Back to Profile
              </Link>
            )}
            
            <Link
              href="/"
              className="block w-full text-center border border-white/10 bg-white/5 text-slate-300 py-3 text-xs rounded-xl font-semibold hover:bg-white/10 hover:text-white transition duration-150"
            >
              Go to Directory Homepage
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}