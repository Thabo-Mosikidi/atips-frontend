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
 * ----------------------------------------
 * Wraps every page in the app.
 * 
 * Structure:
 * - Header (branding + tagline)
 * - Main content (dynamic pages)
 * - Footer (legal info)
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
            -----------------------------------------
            - Fixed branding section
            - Clean corporate white theme
        ========================================== */}
        <header className="w-full bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            
            {/* Logo / Brand Name */}
            <h1 className="text-xl font-bold tracking-tight text-gray-900">
              A.TIPS
            </h1>

            {/* Tagline */}
            <p className="text-sm text-gray-500">
              Support Your Favourite Actors
            </p>
          </div>
        </header>

        {/* =========================================
            MAIN CONTENT
            -----------------------------------------
            - Dynamic content rendered here
            - Pages: Home, Profile, Success
        ========================================== */}
        <main className="flex-1">
          {children}
        </main>

        {/* =========================================
            FOOTER
            -----------------------------------------
            - Legal / copyright section
            - Minimal corporate styling
        ========================================== */}
        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} A.TIPS. All rights reserved.
          </div>
        </footer>

      </body>
    </html>
  );
}