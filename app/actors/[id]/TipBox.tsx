"use client";

/**
 * TipBox Component (FINAL - PRODUCTION UI)
 * ---------------------------------------------------
 * ✅ Compact card layout
 * ✅ Confirm modal (with legal links)
 * ✅ PayFast ready
 * ✅ Source-aware cancel redirect
 */

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

/* --------------------------------------------------
   BUSINESS RULES
---------------------------------------------------*/
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

  /* --------------------------------------------------
     VALIDATION BEFORE MODAL
  ---------------------------------------------------*/
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

  /* --------------------------------------------------
     START PAYMENT
  ---------------------------------------------------*/
  const startPayment = async () => {
    const numericAmount = Number(amount);

    setLoading(true);
    setConfirmOpen(false);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId,
          actorName,
          amount: numericAmount,
          source: window.location.pathname + window.location.search, // 🔥 FULL STATE
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
      {/* ===============================
         MAIN UI
      =============================== */}
      <div className="flex flex-col items-center space-y-2 w-full">

        {/* PRESET BUTTONS */}
        <div className="flex gap-2">
          {presetAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => {
                setAmount(String(amt));
                setError("");
              }}
              className={`px-3 py-1 text-sm rounded-md font-medium ${
                amount === String(amt)
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              R{amt}
            </button>
          ))}
        </div>

        {/* INPUT */}
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError("");
          }}
          placeholder="Enter amount (R10)"
          className="w-full px-2 py-1 text-sm rounded-md text-center
                     border border-gray-400
                     bg-white text-gray-900
                     placeholder-gray-500
                     focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {/* ERROR */}
        {error && (
          <p className="text-red-500 text-xs text-center">{error}</p>
        )}

        {/* BUTTON */}
        <button
          onClick={openConfirm}
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 text-sm rounded-md font-medium"
        >
          {loading ? "Processing..." : "Tip Now"}
        </button>

        {/* TRUST TEXT */}
        <p className="text-[10px] text-gray-500 text-center">
          🔒 Secure payment powered by PayFast
        </p>
      </div>

      {/* ===============================
         CONFIRM MODAL
      =============================== */}
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
                Amount: <span className="font-semibold">R{amount}</span>
              </p>

              {/* LEGAL TEXT */}
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

              {/* ACTION BUTTONS */}
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