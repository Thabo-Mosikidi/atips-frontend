/**
 * app/success/page.tsx
 *
 * Success Page
 * ------------------------------------------------------
 * - Displays confirmation after successful Stripe payment
 * - Reads actor + amount from searchParams
 * - Provides navigation back to profile or homepage
 * - Styled using corporate white theme
 */

import Link from "next/link";

/**
 * SuccessPage Component
 * ------------------------------------------------------
 * - Server component
 * - Extracts actor + amount from URL search params
 */
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ actor?: string; amount?: string }>;
}) {
  // Required for Next.js 15+
  const { actor, amount } = await searchParams;

  return (
    <main className="flex items-center justify-center px-6 py-14 bg-gray-50">
      <div
        className="
          bg-white
          rounded-xl
          shadow-md
          border border-gray-200
          p-10
          text-center
          max-w-md
          w-full
          space-y-6
        "
      >
        {/* =====================================
            Success Heading
        ====================================== */}
        <h1 className="text-2xl font-semibold text-gray-900">
          Thank you 🎉
        </h1>

        {/* =====================================
            Confirmation Message
        ====================================== */}
        <p className="text-gray-600">
          Your tip of{" "}
          <span className="font-semibold text-gray-900">
            {amount} ZAR
          </span>{" "}
          was successful.
        </p>

        {/* =====================================
            Back to Profile Button
            - Secondary navigation
            - Dark neutral styling
        ====================================== */}
        {actor && (
          <Link
            href={`/actors/${actor}`}
            className="
              block
              bg-gray-900
              text-white
              px-6
              py-3
              rounded-lg
              hover:bg-black
              transition
            "
          >
            Back to profile
          </Link>
        )}

        {/* =====================================
            Back to Homepage Button
            - Primary CTA styling (RED)
            - Matches Tip Now button branding
        ====================================== */}
        <Link
          href="/"
          className="
            block
            bg-red-600
            text-white
            px-6
            py-3
            rounded-lg
            hover:bg-red-700
            transition
          "
        >
          Back to homepage
        </Link>
      </div>
    </main>
  );
}