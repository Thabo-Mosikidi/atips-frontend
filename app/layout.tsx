/**
 * app/layout.tsx
 *
 * FINAL VERSION – FAVICON FIXED + CLEAN BRANDING
 * ------------------------------------------------------------
 * What this includes:
 * - Forced favicon loading (fixes tab icon issue)
 * - Clean A.TIPS™ branding
 * - Logo + text alignment (tight + premium)
 * - Movement banner (unchanged)
 * - Footer with support email
 * - Fully commented for maintainability
 */

import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";

/**
 * GLOBAL METADATA
 * ------------------------------------------------------------
 * Controls:
 * - Browser tab title
 * - SEO description
 */
export const metadata: Metadata = {
  title: "A.TIPS",
  description: "Support your favorite actors",
};

/**
 * ROOT LAYOUT
 * ------------------------------------------------------------
 * Wraps the entire application
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      
      {/* =========================================
          FAVICON (FORCED – GUARANTEED TO WORK)
          -----------------------------------------
          Uses: /public/favicon.png
      ========================================== */}
      <head>
        <link rel="icon" href="/favicon.png" />
      </head>

      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">

        {/* =========================================
            HEADER
        ========================================== */}
        <header className="w-full bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

            {/* =====================================
                LOGO + BRAND (A.TIPS™)
            ===================================== */}
            <Link
              href="/"
              className="flex items-center gap-0 text-lg font-semibold hover:opacity-80"
            >

              {/* Logo */}
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

                <span className="ml-[2px] text-[10px] align-top">™</span>

              </span>
            </Link>

            {/* NAVIGATION */}
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

        {/* MAIN */}
        <main className="flex-1">{children}</main>

        {/* =========================================
            FOOTER
        ========================================== */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500 text-sm space-y-1">

            <p>
              © {new Date().getFullYear()} A.TIPS™. All rights reserved.
            </p>

            <p className="text-xs text-gray-400">
              Empowering actors through direct audience value exchange.
            </p>

            <p className="text-xs text-gray-500">
              <a
                href="mailto:support@atips.co.za"
                className="hover:underline"
              >
                support@atips.co.za
              </a>
            </p>

          </div>
        </footer>

        {/* Analytics */}
        <Analytics />

      </body>
    </html>
  );
}

