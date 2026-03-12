"use client";

/**
 * app/actors/[id]/TipBox.tsx
 *
 * TipBox Component
 * ------------------------------------------------------
 * - Handles tipping logic
 * - Supports preset amounts (R10, R15, R25)
 * - Custom ZAR amount input
 * - Initiates payment checkout session
 *
 * Payment Provider:
 * - Paystack (via backend /api/checkout)
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
   * COMPONENT STATE
   * -----------------------------------------
   * amount  -> Selected/custom tip value
   * loading -> Prevents double submission
   */
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Preset selectable tip amounts
   */
  const presetAmounts = [10, 15, 25];

  /**
   * HANDLE TIP SUBMISSION
   * -----------------------------------------
   * 1️⃣ Validate amount
   * 2️⃣ Call backend /api/checkout
   * 3️⃣ Backend initializes Paystack transaction
   * 4️⃣ Redirect user to Paystack checkout page
   */
  const handleTip = async () => {
    const numericAmount = Number(amount);

    // Minimum tip validation
    if (!numericAmount || numericAmount < 10) {
      alert("Minimum tip amount is R10");
      return;
    }

    setLoading(true);

    try {

      /**
       * STEP 1: Call backend checkout endpoint
       */
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorId,
          actorName,
          amountCents: Math.round(numericAmount * 100)
        }),
      });

      const data = await res.json();

      /**
       * STEP 2: Handle backend errors
       */
      if (!res.ok) {
        alert(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      /**
       * STEP 3: Redirect user to Paystack payment page
       * Paystack returns authorization_url
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
          PRIMARY TIP BUTTON
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