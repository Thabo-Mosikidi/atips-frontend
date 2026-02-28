"use client";

/**
 * app/actors/[id]/TipBox.tsx
 *
 * TipBox Component
 * ------------------------------------------------------
 * - Handles tipping logic
 * - Supports preset amounts (R10, R15, R25)
 * - Custom ZAR amount input
 * - Initiates Stripe checkout session
 *
 * Design System:
 * - Preset buttons: Neutral grey
 * - Primary action (Tip Now): Red CTA
 * - Corporate white input styling
 */

import { useState } from "react";

export default function TipBox({
  actorId,
  actorName,
}: {
  actorId: string;
  actorName: string;
}) {
  /**
   * Component State
   * -----------------------------------------
   * amount  -> Selected/custom tip value
   * loading -> Prevents double submission
   */
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Preset selectable tip amounts
   * These are quick-select options for users
   */
  const presetAmounts = [10, 15, 25];

  /**
   * Handles tip submission
   * -----------------------------------------
   * - Validates minimum amount (R10)
   * - Calls backend /api/checkout
   * - Redirects to Stripe Checkout
   */
  const handleTip = async () => {
    const numericAmount = Number(amount);

    if (!numericAmount || numericAmount < 10) {
      alert("Minimum tip amount is R10");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId,
          actorName,
          amountCents: numericAmount * 100,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      /**
       * Redirect to Stripe Checkout
       * -----------------------------------------
       * Stripe returns hosted checkout URL
       */
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">

      {/* =====================================================
          PRESET AMOUNT BUTTONS
          -----------------------------------------------------
          - Neutral grey default state
          - Red when selected (indicates active choice)
      ====================================================== */}
      <div className="flex justify-center gap-3">
        {presetAmounts.map((amt) => {
          const isSelected = amount === String(amt);

          return (
            <button
              key={amt}
              onClick={() => setAmount(String(amt))}
              className={`
                px-4 py-2 rounded-lg text-sm font-semibold transition
                ${
                  isSelected
                    ? "bg-red-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }
              `}
            >
              R{amt}
            </button>
          );
        })}
      </div>

      {/* =====================================================
          CUSTOM AMOUNT INPUT
          -----------------------------------------------------
          - White corporate styling
          - Clean focus ring
      ====================================================== */}
      <input
        type="number"
        min="10"
        placeholder="Enter ZAR amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="
          bg-white
          border border-gray-300
          rounded-lg
          px-4 py-2
          text-center
          w-44
          text-gray-900
          focus:outline-none
          focus:border-gray-500
          focus:ring-1
          focus:ring-gray-400
        "
      />

      {/* =====================================================
          PRIMARY TIP BUTTON (RED CTA)
          -----------------------------------------------------
          - Strong call-to-action color
          - Clear visual hierarchy
          - Consistent across homepage + profile
      ====================================================== */}
      <button
        onClick={handleTip}
        disabled={loading}
        className="
          bg-red-600
          text-white
          px-8
          py-3
          rounded-lg
          font-semibold
          hover:bg-red-700
          transition
          disabled:opacity-50
        "
      >
        {loading ? "Processing..." : "Tip Now"}
      </button>

    </div>
  );
}