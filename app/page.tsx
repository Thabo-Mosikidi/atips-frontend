/**
 * app/page.tsx
 * Clean Professional Actor Grid (Dark Version - 5 Columns)
 */

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TipBox from "./actors/[id]/TipBox";

async function getActors() {
  return prisma.actor.findMany({
    orderBy: { number: "asc" },
  });
}

export default async function HomePage() {
  const actors = await getActors();

  return (
    <main className="py-14 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Title */}
        <h1 className="text-3xl font-semibold text-center mb-12 text-blue-300">
          A.TIPS Actors Directory
        </h1>

        {/* 🔥 5 COLUMN GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="
                bg-[#1e293b]
                rounded-xl
                shadow-lg
                overflow-hidden
                transition-all duration-300
                hover:shadow-2xl
                hover:-translate-y-2
              "
            >
              {/* IMAGE */}
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={actor.imageUrl}
                  alt={actor.name}
                  fill
                  className="object-cover object-[50%_18%] transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* CONTENT */}
              <div className="p-6 text-center space-y-4">

                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {actor.name}
                  </h2>

                  <p className="text-sm text-slate-400 mt-1">
                    {actor.bio}
                  </p>
                </div>

                <div className="flex justify-center">
                  <TipBox
                    actorId={actor.id}
                    actorName={actor.name}
                  />
                </div>

                <Link
                  href={`/actors/${actor.id}`}
                  className="inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
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