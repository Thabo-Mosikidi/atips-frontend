/**
 * app/success/page.tsx
 * Clean Stable Success Page
 */

import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; amount?: string }>;
}) {
  // ✅ Required for Next.js 15
  const { actor, amount } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div
        className="
          bg-white
          rounded-xl
          shadow-md
          p-10
          text-center
          max-w-md
          w-full
          space-y-6
        "
      >

        <h1 className="text-2xl font-semibold text-slate-800">
          Thank you 🎉
        </h1>

        <p className="text-slate-600">
          Your tip of{" "}
          <span className="font-semibold text-slate-800">
            {amount} ZAR
          </span>{" "}
          was successful.
        </p>

        {/* Back to profile button */}
        {actor && (
          <Link
            href={`/actors/${actor}`}
            className="block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Back to profile
          </Link>
        )}

        {/* Back to homepage */}
        <Link
          href="/"
          className="block border border-slate-300 px-6 py-2 rounded hover:bg-slate-100 transition"
        >
          Back to homepage
        </Link>

      </div>
    </main>
  );
}