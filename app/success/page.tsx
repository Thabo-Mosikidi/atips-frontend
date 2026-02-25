/**
 * app/success/page.tsx
 * Dark Themed Success Page
 */

import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; amount?: string }>;
}) {
  // Required for Next.js 15
  const { actor, amount } = await searchParams;

  return (
    <main className="flex items-center justify-center px-6 py-14">
      <div
        className="
          bg-[#1e293b]
          rounded-xl
          shadow-lg
          p-10
          text-center
          max-w-md
          w-full
          space-y-6
        "
      >
        <h1 className="text-2xl font-semibold text-blue-300">
          Thank you 🎉
        </h1>

        <p className="text-slate-400">
          Your tip of{" "}
          <span className="font-semibold text-white">
            {amount} ZAR
          </span>{" "}
          was successful.
        </p>

        {/* Back to profile button */}
        {actor && (
          <Link
            href={`/actors/${actor}`}
            className="
              block
              bg-blue-600
              text-white
              px-6
              py-3
              rounded-lg
              hover:bg-blue-700
              transition
            "
          >
            Back to profile
          </Link>
        )}

        {/* Back to homepage */}
        <Link
          href="/"
          className="
            block
            border
            border-slate-600
            px-6
            py-3
            rounded-lg
            hover:bg-slate-700
            transition
            text-slate-300
          "
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}