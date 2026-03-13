/**
 * app/success/page.tsx
 *
 * Success Page
 * ------------------------------------------------------
 * - Displays confirmation after successful Paystack payment
 * - Reads actorId, actorName and amount from URL params
 * - Allows navigation back to the actor profile
 * - Styled using corporate white theme
 */

import Link from "next/link";

/**
 * SuccessPage Component
 * ------------------------------------------------------
 * Server Component (Next.js 15 compatible)
 */
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    actorId?: string;
    actorName?: string;
    amount?: string;
  }>;
}) {

  /* --------------------------------------------------
     Extract parameters from the URL
     Example URL:
     /success?actorId=123&actorName=Nomzamo%20Mbatha&amount=25
  ---------------------------------------------------*/
  const { actorId, actorName, amount } = await searchParams;

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

        {/* -------------------------------------
            Success Heading
        -------------------------------------- */}
        <h1 className="text-2xl font-semibold text-gray-900">
          Thank you 🎉
        </h1>

        {/* -------------------------------------
            Confirmation Message
            Shows actor name if available
        -------------------------------------- */}
        <p className="text-gray-600">
          Your tip of{" "}
          <span className="font-semibold text-gray-900">
            {amount} ZAR
          </span>{" "}
          {actorName && (
            <>
              for{" "}
              <span className="font-semibold text-gray-900">
                {actorName}
              </span>
            </>
          )}{" "}
          was successful.
        </p>

        {/* -------------------------------------
            Back to Profile Button
            Uses actorId for routing
        -------------------------------------- */}
        {actorId && (
          <Link
            href={`/actors/${actorId}`}
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

        {/* -------------------------------------
            Back to Homepage Button
        -------------------------------------- */}
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