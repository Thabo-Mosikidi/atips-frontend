/**
 * app/layout.tsx
 *
 * Global Application Layout
 * ----------------------------------------
 * - Provides consistent Header + Footer
 * - Applies global white corporate theme
 * - Wraps all pages inside shared layout
 * - Maintainer-friendly and production-ready
 */

import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";

/**
 * Global metadata used across the application.
 * This improves SEO and browser tab information.
 */
export const metadata: Metadata = {
  title: "A.TIPS",
  description: "Support your favorite actors",
};

/**
 * RootLayout
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50 text-gray-900">

        {/* HEADER */}
        <header className="w-full bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

            <Link
              href="/"
              className="text-xl font-bold tracking-tight text-gray-900 hover:opacity-80"
            >
              A.TIPS
            </Link>

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

        {/* MAIN CONTENT */}
        <main className="flex-1">{children}</main>

        {/* FOOTER */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} A.TIPS. All rights reserved.
          </div>
        </footer>

        {/* VERCEL ANALYTICS */}
        <Analytics />

      </body>
    </html>
  );
}