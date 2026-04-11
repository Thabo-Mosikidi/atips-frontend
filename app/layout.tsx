/**
 * app/layout.tsx
 *
 * ROOT LAYOUT (FINAL – WITH LEGAL LINKS + FAVICON + CLEAN STRUCTURE)
 * --------------------------------------------------
 * - Handles global structure (Header, Footer, Main)
 * - Uses Next.js metadata system (SEO + favicon)
 * - Includes legal compliance links (Terms, Refund, Privacy)
 * - Production-ready and maintainable
 */

import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";

/**
 * GLOBAL METADATA
 * --------------------------------------------------
 * Controls:
 * - Browser tab title
 * - SEO description
 * - Favicon
 *
 * IMPORTANT:
 * Make sure this file exists:
 * 👉 /app/favicon.png
 */
export const metadata: Metadata = {
  title: "A.TIPS",
  description: "Support your favorite actors",

  icons: {
    icon: "/favicon.png",
  },
};

/**
 * ROOT LAYOUT COMPONENT
 * --------------------------------------------------
 * Wraps ALL pages in your app
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">

        {/* =========================================
            HEADER
        ========================================== */}
        <header className="w-full bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

            {/* =========================================
                LOGO + BRAND
            ========================================== */}
            <Link
              href="/"
              className="flex items-center gap-1 text-lg font-semibold hover:opacity-80"
            >
              {/* Logo Image */}
              <img
                src="/favicon.png"
                alt="A.Tips Logo"
                className="w-10 h-10 object-contain -mr-[2px]"
              />

              {/* Brand Text */}
              <span className="tracking-[-0.02em]">
                <span className="text-gray-900">A</span>
                <span className="text-gray-900">.</span>

                <span className="text-red-600">T</span>
                <span className="text-blue-500">I</span>
                <span className="text-gray-900">P</span>
                <span className="text-red-600">S</span>

                {/* Trademark */}
                <span className="ml-[2px] text-[10px] align-top">™</span>
              </span>
            </Link>

            {/* =========================================
                NAVIGATION
            ========================================== */}
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Home
              </Link>

              <p className="text-sm text-gray-500">
                Support Your Favourite Actors
              </p>
            </div>
          </div>
        </header>

        {/* =========================================
            MOVEMENT BANNER
        ========================================== */}
        <section className="w-full bg-gradient-to-r from-[#1e293b] to-[#0f172a] text-white border-b border-red-500/20">
          <div className="max-w-5xl mx-auto px-6 py-10 text-center space-y-4">

            <h1 className="text-2xl md:text-3xl font-semibold">
              A Movement for Actors
            </h1>

            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              A.TIPS is more than a platform. It is a movement that strengthens
              the creative economy by enabling audiences to directly reward
              the actors whose work they value.
            </p>

            {/* Live indicator */}
            <div className="flex justify-center items-center gap-2 text-sm text-gray-300">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span>Live tipping happening across South Africa</span>
            </div>

            <p className="text-xs text-gray-400">
              Every tip contributes to a stronger creative industry.
            </p>
          </div>
        </section>

        {/* =========================================
            MAIN CONTENT
        ========================================== */}
        <main className="flex-1">{children}</main>

        {/* =========================================
            FOOTER
        ========================================== */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500 text-sm space-y-2">

            {/* Copyright */}
            <p>
              © {new Date().getFullYear()} A.TIPS™. All rights reserved.
            </p>

            {/* Tagline */}
            <p className="text-xs text-gray-400">
              Empowering actors through direct audience value exchange.
            </p>

            {/* Support Email */}
            <p className="text-xs text-gray-500">
              <a
                href="mailto:support@atips.co.za"
                className="hover:underline"
              >
                support@atips.co.za
              </a>
            </p>

            {/* =========================================
                ✅ LEGAL LINKS (CRITICAL FOR PAYMENT APPROVAL)
            ========================================== */}
            <div className="flex justify-center gap-4 text-xs mt-2">
              <Link href="/terms" className="hover:underline">
                Terms
              </Link>

              <Link href="/refund-policy" className="hover:underline">
                Refund Policy
              </Link>

              <Link href="/privacy" className="hover:underline">
                Privacy
              </Link>
            </div>

          </div>
        </footer>

        {/* =========================================
            ANALYTICS
        ========================================== */}
        <Analytics />

      </body>
    </html>
  );
}