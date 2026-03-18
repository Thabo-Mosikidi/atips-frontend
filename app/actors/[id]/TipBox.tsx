"use client";

/**
 * TipBox Component
 * -----------------------------------------
 * Handles tipping UI + payment redirect
 * Modal uses React Portal to avoid flicker
 */

import { useState } from "react";
import { createPortal } from "react-dom";

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

  //const presetAmounts = [10, 15, 25];
  const presetAmounts = [10, 25, 50];

  /**
   * Open confirmation modal
   */
  const openConfirm = () => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 10) {
      alert("Minimum tip amount is R10");
      return;
    }

    setConfirmOpen(true);
  };

  /**
   * Close modal
   */
  const closeConfirm = () => {
    setConfirmOpen(false);
  };

  /**
   * Start payment
   */
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
          amountCents: Math.round(numericAmount * 100),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <>
      {/* ===============================
         TIP BUTTON UI
      =============================== */}
      <div className="flex flex-col items-center space-y-4 w-full">
        {/* Preset buttons */}
        <div className="flex justify-center gap-3">
          {presetAmounts.map((amt) => {
            const selected = amount === String(amt);

            return (
              <button
                key={amt}
                onClick={() => setAmount(String(amt))}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition
                  ${
                    selected
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                R{amt}
              </button>
            );
          })}
        </div>

        {/* Custom amount */}
        <input
          type="number"
          min="10"
          placeholder="Enter ZAR amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="
            bg-white border border-gray-300 rounded-lg
            px-4 py-2 text-center w-44 text-gray-900
            focus:outline-none focus:ring-1 focus:ring-gray-400
          "
        />

        {/* Tip button */}
        <button
          onClick={openConfirm}
          disabled={loading}
          className="
            bg-red-600 text-white px-8 py-3 rounded-lg
            font-semibold hover:bg-red-700 transition
            disabled:opacity-50
          "
        >
          {loading ? "Processing..." : "Tip Now"}
        </button>
      </div>

      {/* ===============================
         MODAL (PORTAL)
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
            <div className="relative bg-white rounded-xl p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-900">
                Confirm Tip
              </h2>

              <p className="text-gray-600">You are about to tip</p>

              <p className="text-xl font-semibold text-gray-900">
                {actorName}
              </p>

              <p className="text-lg text-gray-700">
                Amount: <span className="font-semibold">R{amount}</span>
              </p>

              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={closeConfirm}
                  className="px-5 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button
                  onClick={startPayment}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
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