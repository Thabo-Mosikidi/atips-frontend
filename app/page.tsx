/**
 * app/page.tsx
 *
 * Homepage - Actors Directory Grid
 * ----------------------------------------------------
 * Features:
 * - Displays actors from database (Prisma)
 * - Supports actor search
 * - Responsive 5-column grid layout
 * - Corporate white theme styling
 * - Hover animations
 * - TipBox integration
 */

export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TipBox from "./actors/[id]/TipBox";


/**
 * Fetch actors from the database
 * ----------------------------------------------------
 * If a search term exists → filter actors by name
 * If no search term → return all actors
 */
async function getActors(search?: string) {
  return prisma.actor.findMany({

    /**
     * Search condition
     * ----------------------------------------------------
     * Case-insensitive search on actor names
     */
    where: search
      ? {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }
      : undefined,

    /**
     * Ensures actors appear in correct display order
     */
    orderBy: {
      number: "asc",
    },

  });
}



/**
 * HomePage Component
 * ----------------------------------------------------
 * Server Component
 * Handles search queries from the URL
 *
 * Example URL:
 * /?search=kim
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {

  /**
   * Next.js 15 change
   * ----------------------------------------------------
   * searchParams must be awaited
   */
  const params = await searchParams;

  /**
   * Extract search query
   */
  const search = params?.search ?? "";

  /**
   * Fetch actors
   */
  const actors = await getActors(search);



  return (

  <main className="py-8 px-6 bg-gray-50">

    {/* =========================================
        STICKY DIRECTORY + SEARCH SECTION
    ========================================== */}
    
      <div className="sticky top-0 z-30 bg-gray-50 pb-6 border-b border-gray-200">

      <div className="max-w-7xl mx-auto">

        {/* PAGE TITLE */}
        <h1 className="text-3xl font-semibold text-center mb-2 text-gray-900">
          A.TIPS Actors Directory
        </h1>

        {/* SEARCH BAR */}
        <form method="GET" className="flex justify-center gap-3">

          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search actors..."
            className="
              w-full
              max-w-md
              px-4
              py-3
              border
              border-gray-300
              rounded-lg
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

          {/* Reset button */}
          <Link
            href="/"
            className="px-4 py-3 bg-gray-200 rounded-lg text-sm hover:bg-gray-300"
          >
            Reset
          </Link>

        </form>

      </div>

    </div>



    {/* =========================================
        ACTOR GRID
    ========================================== */}
    <div className="max-w-7xl mx-auto mt-8">

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">

        {actors.map((actor) => (

          <div
            key={actor.id}
            className="
              bg-white
              rounded-xl
              shadow-md
              border border-gray-200
              overflow-hidden
              transition-transform duration-200
              hover:shadow-lg
              hover:-translate-y-1
            "
          >

            {/* ACTOR IMAGE */}
            <div className="relative w-full h-56 overflow-hidden">

              <Image
                src={actor.imageUrl}
                alt={actor.name}
                fill
                className="object-cover object-[50%_18%] transition-transform duration-300 hover:scale-[1.03]"
              />

            </div>


            {/* CARD CONTENT */}
            <div className="p-6 text-center space-y-4">

              {/* Actor Name + Bio */}
              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  {actor.name}
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  {actor.bio}
                </p>

              </div>


              {/* TIP COMPONENT */}
              <div className="flex justify-center">

                <TipBox
                  actorId={actor.id}
                  actorName={actor.name}
                />

              </div>


              {/* PROFILE LINK */}
              <Link
                href={`/actors/${actor.id}`}
                className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                View Full Profile →
              </Link>

            </div>

          </div>

        ))}

      </div>

    </div>

  </main>
);
}