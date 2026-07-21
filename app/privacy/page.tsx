/**
 * PRIVACY POLICY
 */

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0A1F44] py-16 px-6 relative overflow-hidden">
      <div className="max-w-3xl mx-auto glass-panel p-8 md:p-12 rounded-3xl border border-white/10 shadow-2xl space-y-6 text-slate-200">
        <div className="space-y-2 border-b border-white/10 pb-6">
          <span className="text-xs uppercase tracking-widest text-[#C9A34E] font-semibold">
            Data & Privacy
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Privacy Policy
          </h1>
        </div>

        <div className="space-y-4 text-sm md:text-base leading-relaxed text-slate-300 font-light">
          <p>
            A.TIPS respects your privacy and is committed to protecting your
            personal information.
          </p>

          <p>
            We collect minimal data required to facilitate payments and platform
            functionality.
          </p>

          <p>
            Payments are securely processed through third-party payment providers.
            A.TIPS does not store sensitive financial information.
          </p>

          <p className="text-white font-medium bg-white/5 p-4 rounded-xl border border-white/10">
            We do not sell, share, or distribute user data to third parties.
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