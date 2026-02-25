"use client";

import { useState } from "react";

export default function TipBox({
  actorId,
  actorName,
}: {
  actorId: string;
  actorName: string;
}) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const presetAmounts = [10, 15, 25];

  const handleTip = async () => {
    const numericAmount = Number(amount);

    // 🔒 Frontend validation
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

          // ✅ IMPORTANT: Send cents because API expects amountCents
          amountCents: numericAmount * 100,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // 🔴 Show backend error if any
        alert(data.error || "Checkout failed");
        setLoading(false);
        return;
      }

      // ✅ Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full">

      {/* Preset Buttons */}
      <div className="flex justify-center gap-3">
        {presetAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => setAmount(String(amt))}
            className="bg-slate-200 px-3 py-1 rounded text-sm hover:bg-slate-300"
          >
            R{amt}
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <input
        type="number"
        min="10"
        placeholder="Enter ZAR amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border rounded px-3 py-2 text-center w-40"
      />

      {/* Tip Button */}
      <button
        onClick={handleTip}
        disabled={loading}
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Tip Now"}
      </button>

    </div>
  );
}