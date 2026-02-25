/**
 * app/page.tsx
 * Clean Professional Actor Grid (Stable Version)
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
    <main className="min-h-screen py-14 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Title */}
        <h1 className="text-3xl font-semibold text-center mb-12 text-slate-800">
          A.TIPS Actors Directory
        </h1>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="
                bg-white
                rounded-xl
                shadow-md
                overflow-hidden
                transition-all duration-300
                hover:shadow-xl
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
                  <h2 className="text-lg font-semibold text-slate-800">
                    {actor.name}
                  </h2>

                  <p className="text-sm text-slate-600 mt-1">
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
                  className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
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