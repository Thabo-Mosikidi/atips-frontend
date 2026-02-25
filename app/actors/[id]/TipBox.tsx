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

      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Payment failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">

      {/* 🔴 Preset Buttons */}
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
                    ? "bg-red-700 text-white"
                    : "bg-red-600 text-white hover:bg-red-700"
                }
              `}
            >
              R{amt}
            </button>
          );
        })}
      </div>

      {/* Amount Input */}
      <input
        type="number"
        min="10"
        placeholder="Enter ZAR amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="
          bg-[#0f172a]
          border border-slate-600
          rounded-lg
          px-4 py-2
          text-center
          w-44
          text-white
          focus:outline-none
          focus:border-blue-400
        "
      />

      {/* 🔴 Tip Button */}
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