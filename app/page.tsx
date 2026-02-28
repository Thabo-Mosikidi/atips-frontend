/**
 * app/page.tsx
 *
 * Homepage - Actors Directory Grid
 * ----------------------------------------------------
 * - Displays all actors from database (Prisma)
 * - Responsive 5-column grid layout
 * - Corporate white theme styling
 * - Maintains hover animations + spacing
 * - Integrates TipBox component
 */

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TipBox from "./actors/[id]/TipBox";

/**
 * Fetch all actors ordered by display number.
 * This runs on the server (Server Component).
 */
async function getActors() {
  return prisma.actor.findMany({
    orderBy: { number: "asc" },
  });
}

/**
 * HomePage Component
 * ----------------------------------------------------
 * - Server-rendered page
 * - Displays actors in professional card layout
 */
export default async function HomePage() {
  const actors = await getActors();

  return (
    <main className="py-14 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* =========================================
            PAGE TITLE
        ========================================== */}
        <h1 className="text-3xl font-semibold text-center mb-12 text-gray-900">
          A.TIPS Actors Directory
        </h1>

        {/* =========================================
            RESPONSIVE 5 COLUMN GRID
            - 1 col (mobile)
            - 2 col (small screens)
            - 3 col (medium screens)
            - 5 col (extra large screens)
        ========================================== */}
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
                transition-all duration-300
                hover:shadow-lg
                hover:-translate-y-1
              "
            >
              {/* =====================================
                  ACTOR IMAGE
              ====================================== */}
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={actor.imageUrl}
                  alt={actor.name}
                  fill
                  className="object-cover object-[50%_18%] transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* =====================================
                  CARD CONTENT
              ====================================== */}
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

                {/* Tip Section (Reusable Component) */}
                <div className="flex justify-center">
                  <TipBox
                    actorId={actor.id}
                    actorName={actor.name}
                  />
                </div>

              {/**
                * Profile Link
                * ------------------------------------------------------
                * - Secondary action
                * - Blue corporate styling
                * - Clear visual hierarchy under red CTA
                */}
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