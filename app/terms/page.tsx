/**
 * TERMS & CONDITIONS
 * A.TIPS – Financial Appreciation Platform
 */

import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0A1F44] py-16 px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-slate-200">
        <div className="space-y-2 border-b border-white/10 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#C9A34E] font-semibold">
            Legal Terms
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Terms & Conditions
          </h1>
        </div>

        <div className="space-y-4 text-sm md:text-base leading-relaxed text-slate-300 font-light">
          <p>
            A.TIPS is a digital platform that enables audiences to provide voluntary
            financial appreciation to actors for content they consume.
          </p>

          <p>
            By using this platform, you agree that all payments made are voluntary,
            discretionary, and not in exchange for goods or services.
          </p>

          <p>
            A.TIPS does not guarantee any outcomes, services, or deliverables in
            exchange for payments made.
          </p>

          <p>
            Users are solely responsible for the amounts they choose to send.
          </p>

          <p className="text-white font-medium bg-white/5 p-4 rounded-xl border border-white/10">
            By proceeding with a payment, you confirm that you understand and accept
            these terms.
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