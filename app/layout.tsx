/**
 * app/layout.tsx
 * Clean stable layout (no dark mode, no glass)
 */

import "./globals.css";

export const metadata = {
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
      <body
        className="
          min-h-screen
          bg-slate-100
          text-slate-900
        "
      >
        {children}
      </body>
    </html>
  );
}