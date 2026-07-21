import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "A.TIPS",
  description: "Support your favorite actors through direct audience value exchange.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0A1F44] text-slate-100 selection:bg-[#D90429] selection:text-white">
        
        {/* =========================================
            HEADER (PREMIUM DARK SYSTEM)
        ========================================== */}
        <header className="w-full bg-[#0A1F44]/90 border-b border-white/5 backdrop-blur-md sticky top-0 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* LOGO + BRAND */}
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <img
                src="/favicon.png"
                alt="A.Tips Logo"
                className="w-8 h-8 object-contain"
              />
              <span className="tracking-[-0.02em] font-extrabold text-white text-xl">
                <span>A</span>
                <span className="text-[#D90429]">.</span>
                <span className="text-[#D90429]">T</span>
                <span className="text-[#C9A34E]">I</span>
                <span>P</span>
                <span className="text-[#D90429]">S</span>
                <span className="ml-[2px] text-[10px] align-top font-light text-slate-400">™</span>
              </span>
            </Link>

            {/* NAVIGATION / TAGLINE */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-300 hover:text-white uppercase tracking-widest transition"
              >
                Home
              </Link>
              <span className="text-xs text-[#C9A34E] font-medium tracking-wider uppercase bg-[#C9A34E]/10 border border-[#C9A34E]/20 px-3 py-1 rounded-full hidden md:inline-block">
                Secure Tipping
              </span>
            </div>
          </div>
        </header>

        {/* =========================================
            MAIN CONTENT
        ========================================== */}
        <main className="flex-1">{children}</main>

        {/* =========================================
            FOOTER (PREMIUM DARK SYSTEM)
        ========================================== */}
        <footer className="bg-[#050e24] border-t border-white/5 relative z-10">
          <div className="max-w-7xl mx-auto px-6 py-12 text-center text-slate-400 text-sm space-y-6">
            
            {/* Tagline & Statement */}
            <div className="max-w-md mx-auto space-y-2">
              <p className="text-white font-medium text-base tracking-tight">
                A.TIPS Creative Movement
              </p>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                Empowering actors by enabling direct audience value exchange. 
                Supporting local talent with reliable, safe, and transparent payouts.
              </p>
            </div>

            {/* Support Email */}
            <p className="text-xs">
              Need assistance? Email{" "}
              <a
                href="mailto:support@atips.co.za"
                className="text-white hover:text-[#C9A34E] underline transition"
              >
                support@atips.co.za
              </a>
            </p>

            {/* Legal Links */}
            <div className="flex justify-center flex-wrap gap-6 text-xs text-slate-200 font-medium border-t border-white/10 pt-6 max-w-md mx-auto">
              <Link href="/terms" className="hover:text-[#C9A34E] underline decoration-white/20 underline-offset-4 transition">
                Terms of Use
              </Link>
              <Link href="/refund-policy" className="hover:text-[#C9A34E] underline decoration-white/20 underline-offset-4 transition">
                Refund Policy
              </Link>
              <Link href="/privacy" className="hover:text-[#C9A34E] underline decoration-white/20 underline-offset-4 transition">
                Privacy Policy
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-[11px] text-slate-500 font-light">
              © {new Date().getFullYear()} A.TIPS™. All rights reserved. Registered trademark.
            </p>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}