/**
 * app/layout.tsx
 * Global Layout with Dark Blue Theme + Header + Footer
 */

import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A.TIPS",
  description: "Support your favorite actors",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0f172a] text-white">
        
        {/* HEADER */}
        <header className="w-full bg-[#0b1120] border-b border-blue-900">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-400">
              A.TIPS
            </h1>
            <p className="text-sm text-slate-400">
              Support Your Favourite Actors
            </p>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="bg-[#0b1120] border-t border-blue-900">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} A.TIPS. All rights reserved.
          </div>
        </footer>

      </body>
    </html>
  );
}