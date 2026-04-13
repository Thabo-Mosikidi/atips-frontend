/**
 * app/success/page.tsx
 *
 * FINAL SUCCESS PAGE
 * ------------------------------------------------------
 * ✅ Shows correct actor name
 * ✅ Shows correct amount
 * ✅ Works with PayFast redirect
 * ✅ No dependency on webhook
 */

import Link from "next/link";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    actorId?: string;
    actorName?: string;
    amount?: string;
  }>;
}) {

  const { actorId, actorName, amount } = await searchParams;

  return (
    <main className="flex items-center justify-center px-6 py-14 bg-gray-50">
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-10 text-center max-w-md w-full space-y-6">

        {/* TITLE */}
        <h1 className="text-2xl font-semibold text-gray-900">
          Thank you 🎉
        </h1>

        {/* MESSAGE */}
        <p className="text-gray-600">
          Your tip of{" "}
          <span className="font-semibold text-gray-900">
            {amount || "--"} ZAR
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

        {/* BACK TO PROFILE */}
        {actorId && (
          <Link
            href={`/actors/${actorId}`}
            className="block bg-gray-900 text-white px-6 py-3 rounded-lg"
          >
            Back to profile
          </Link>
        )}

        {/* BACK TO HOME */}
        <Link
          href="/"
          className="block bg-red-600 text-white px-6 py-3 rounded-lg"
        >
          Back to homepage
        </Link>

      </div>
    </main>
  );
}