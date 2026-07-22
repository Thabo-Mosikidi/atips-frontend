"use client";

/**
 * TipBox Component (PREMIUM UI UPGRADE)
 * ---------------------------------------
 * ✅ Luxury UI (gold + premium red)
 * ✅ Smooth interactions
 * ✅ Same business logic (safe)
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

/* ================= BUSINESS RULES ================= */
const MIN_AMOUNT = 10;
const MAX_AMOUNT = 10000;

export default function TipBox({
  actorId,
  actorName,
}: {
  actorId: string;
  actorName: string;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const presetAmounts = [10, 25, 50];

  /* ================= USD CONVERSION ================= */
  const usd =
    amount && Number(amount) >= MIN_AMOUNT
      ? (Number(amount) / 18).toFixed(2)
      : null;

  /* ================= VALIDATION ================= */
  const openConfirm = () => {
    const numericAmount = Number(amount);
    setError("");

    if (!actorId || !actorName) {
      setError("Actor information missing");
      return;
    }

    if (!numericAmount || numericAmount < MIN_AMOUNT) {
      setError(`Minimum tip is R${MIN_AMOUNT}`);
      return;
    }

    if (numericAmount > MAX_AMOUNT) {
      setError(`Maximum tip is R${MAX_AMOUNT}`);
      return;
    }

    setConfirmOpen(true);
  };

  const closeConfirm = () => setConfirmOpen(false);

  /* ================= SESSION ================= */
  // Anonymous, session-based viewer token (no login) — persisted so repeat
  // tips from the same browser link to one Viewer record.
  const getSessionToken = () => {
    if (typeof window === "undefined") return undefined;
    let token = localStorage.getItem("atips_session");
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem("atips_session", token);
    }
    return token;
  };

  /* ================= PAYMENT ================= */
  const startPayment = async () => {
    const numericAmount = Number(amount);

    setLoading(true);
    setConfirmOpen(false);

    try {
      // Use /api/tips: it creates the Transaction record and returns an
      // approval URL carrying transactionId, so /success can capture and
      // persist the Tip. (/api/checkout did neither.)
      const res = await fetch("/api/tips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId,
          amount: numericAmount,
          sessionToken: getSessionToken(),
          source:
            window.location.pathname + window.location.search,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Payment failed");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <>
      {/* ================= MAIN UI ================= */}
      <div className="flex flex-col items-center space-y-3 w-full">

        {/* ===== PRESET BUTTONS ===== */}
        <div className="flex gap-2">
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setAmount(String(amt));
                setError("");
              }}
              className={`
                px-4 py-1.5 text-sm rounded-full font-medium transition-all duration-200
                border
                ${
                  amount === String(amt)
                    ? "bg-gradient-to-r from-[#C9A34E] to-[#E6C878] text-black border-transparent shadow-md"
                    : "bg-white/80 text-gray-700 border-gray-300 hover:bg-white"
                }
              `}
            >
              R{amt}
            </button>
          ))}
        </div>

        {/* ===== INPUT ===== */}
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError("");
          }}
          placeholder="Enter amount (R10)"
          className="
            w-full px-3 py-2 text-sm rounded-lg text-center
            border border-gray-300
            bg-white/90 text-gray-900
            placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-[#C9A34E]
            transition
          "
        />

        {/* USD */}
        {usd && (
          <p className="text-[11px] text-gray-500">
            ≈ ${usd} USD
          </p>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        {/* ===== CTA BUTTON ===== */}
        <button
          onClick={openConfirm}
          disabled={loading}
          className="
            w-full
            bg-gradient-to-r from-[#D90429] to-[#A60321]
            hover:from-[#ff1a3c] hover:to-[#b30026]
            transition-all duration-200
            text-white py-2.5 text-sm rounded-lg font-semibold
            shadow-lg hover:shadow-xl
            active:scale-[0.98]
          "
        >
          {loading ? "Processing..." : "Tip Now"}
        </button>

        {/* TRUST TEXT */}
        <p className="text-[10px] text-gray-500 text-center">
          🔒 Secure payment powered by PayPal
        </p>

      </div>

      {/* ================= MODAL ================= */}
      {confirmOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center">

            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={closeConfirm}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl p-6 w-80 text-center space-y-4 shadow-xl">

              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Tip
              </h2>

              <p className="text-sm text-gray-600">
                You are about to tip
              </p>

              <p className="text-base font-semibold text-gray-900">
                {actorName}
              </p>

              <p className="text-sm text-gray-700">
                Amount:{" "}
                <span className="font-semibold">R{amount}</span>
              </p>

              {usd && (
                <p className="text-xs text-gray-500">
                  ≈ ${usd} USD
                </p>
              )}

              <p className="text-[11px] text-gray-500 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/refund-policy" className="underline">
                  Refund Policy
                </Link>.
              </p>

              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={closeConfirm}
                  className="px-4 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={startPayment}
                  className="px-4 py-1.5 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Continue to Payment
                </button>
              </div>

            </div>
          </div>,
          document.body
        )}
    </>
  );
}