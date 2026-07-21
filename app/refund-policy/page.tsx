/**
 * REFUND POLICY
 * MUST be strict for payment approval
 */

import Link from "next/link";

export default function RefundPolicyPage() {
  return (
    <main className="min-h-screen bg-[#0A1F44] py-16 px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-slate-200">
        <div className="space-y-2 border-b border-white/10 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#C9A34E] font-semibold">
            Payment Terms
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Refund Policy
          </h1>
        </div>

        <div className="space-y-4 text-sm md:text-base leading-relaxed text-slate-300 font-light">
          <p>
            All payments made on A.TIPS are voluntary and represent financial
            appreciation for content already consumed.
          </p>

          <p className="font-semibold text-white bg-[#D90429]/20 text-[#ff4d6d] p-4 rounded-xl border border-[#D90429]/40">
            All payments are final and non-refundable.
          </p>

          <p>
            A.TIPS does not provide refunds for any completed transactions.
          </p>

          <p>
            If a technical issue occurs, users may contact support for assistance at{" "}
            <a
              href="mailto:support@atips.co.za"
              className="text-white hover:text-[#C9A34E] underline transition font-normal"
            >
              support@atips.co.za
            </a>.
          </p>
        </div>

        <div className="pt-6 border-t border-white/10">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-semibold text-[#C9A34E] hover:text-white uppercase tracking-wider transition"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}