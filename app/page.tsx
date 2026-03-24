/**
 * app/page.tsx (PREMIUM VERSION)
 *
 * ----------------------------------------------------
 * FULL UPGRADE:
 * - Premium actor cards (cinematic)
 * - Improved layout spacing
 * - Red + blue brand balance
 * - Better search UX
 * - Strong visual hierarchy
 */

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TipBox from "./actors/[id]/TipBox";

/**
 * Fetch actors
 */
async function getActors(search?: string) {
  return prisma.actor.findMany({
    where: search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,
    orderBy: {
      number: "asc",
    },
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const params = await searchParams;
  const search = params?.search ?? "";
  const actors = await getActors(search);

  return (
    <main className="bg-gray-50">

      {/* =========================================
          DIRECTORY HEADER
      ========================================== */}
      <section className="sticky top-0 z-30 bg-gray-50/95 backdrop-blur border-b border-gray-200">

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          {/* TITLE */}
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              A.TIPS <span className="text-red-600">Actors Directory</span>
            </h1>

            {/* RED DIVIDER */}
            <div className="w-20 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
          </div>

          {/* SEARCH */}
          <form method="GET" className="flex justify-center gap-3">

            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search actors..."
              className="
                w-full max-w-lg
                px-5 py-3
                border border-gray-300
                rounded-xl
                shadow-sm
                focus:outline-none
                focus:ring-2
                focus:ring-red-500
              "
            />

            <Link
              href="/"
              className="
                px-5 py-3
                bg-gray-200
                rounded-xl
                text-sm
                hover:bg-gray-300
                transition
              "
            >
              Reset
            </Link>

          </form>

        </div>

      </section>

      {/* =========================================
          ACTOR GRID
      ========================================== */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">

          {actors.map((actor) => (

            <div
              key={actor.id}
              className="
                group
                bg-white
                rounded-2xl
                shadow-sm
                border border-gray-200
                overflow-hidden
                transition-all duration-300
                hover:shadow-2xl
                hover:-translate-y-2
              "
            >

              {/* =========================================
                  IMAGE + CINEMATIC OVERLAY
              ========================================== */}
              <div className="relative w-full h-56 overflow-hidden">

                <Image
                  src={actor.imageUrl}
                  alt={actor.name}
                  fill
                  className="
                    object-cover object-[50%_18%]
                    transition-transform duration-500
                    group-hover:scale-110
                  "
                />

                {/* GRADIENT OVERLAY */}
                <div className="
                  absolute inset-0
                  bg-gradient-to-t from-black/60 via-black/10 to-transparent
                " />

              </div>

              {/* =========================================
                  CARD CONTENT
              ========================================== */}
              <div className="p-6 text-center space-y-5">

                {/* NAME + BIO */}
                <div>
                  <h2 className="
                    text-lg font-semibold text-gray-900
                    group-hover:text-red-600 transition
                  ">
                    {actor.name}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    {actor.bio}
                  </p>
                </div>

                {/* TIP BOX */}
                <TipBox
                  actorId={actor.id}
                  actorName={actor.name}
                />

                {/* PROFILE LINK */}
                <Link
                  href={`/actors/${actor.id}`}
                  className="
                    inline-block
                    text-sm font-semibold
                    text-blue-600
                    hover:text-red-600
                    transition
                  "
                >
                  View Full Profile →
                </Link>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}