export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import TipBox from "./actors/[id]/TipBox";

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
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F44]">

      {/* 🔥 BACKGROUND GLOW (no structure change) */}
      <div className="absolute inset-0 -z-10">

        <div className="absolute top-[-120px] left-[-120px] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]" />

        <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-red-500/20 rounded-full blur-[120px]" />

        <div className="absolute inset-0 bg-gradient-to-br from-[#0A1F44] via-[#081735] to-[#050d1f]" />

      </div>

      {/* HEADER (unchanged structure, only color tweaks) */}
      <section className="sticky top-0 z-30 bg-[#0A1F44]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">
              A.TIPS <span className="text-red-500">Actors Directory</span>
            </h1>

            <div className="w-20 h-1 bg-red-500 mx-auto mt-3 rounded-full"></div>
          </div>

          <form method="GET" className="flex justify-center gap-3">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search actors..."
              className="w-full max-w-lg px-5 py-3 border border-white/20 bg-white/10 text-white rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-gray-300"
            />

            <Link
              href="/"
              className="px-5 py-3 bg-white/20 text-white rounded-xl text-sm hover:bg-white/30 transition"
            >
              Reset
            </Link>
          </form>
        </div>
      </section>

      {/* GRID SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative">

        {/* subtle glass panel behind cards */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 -z-10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-8">

          {actors.map((actor) => (
            <div
              key={actor.id}
              className="group bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
            >

              {/* IMAGE */}
              <div className="relative w-full h-56 overflow-hidden">
                <Image
                  src={actor.imageUrl}
                  alt={actor.name}
                  fill
                  className="object-cover object-[50%_18%] transition-transform duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              </div>

              {/* CONTENT */}
              <div className="p-6 text-center space-y-5">

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-red-600 transition">
                    {actor.name}
                  </h2>

                  <p className="text-sm text-gray-600 mt-1">
                    {actor.bio}
                  </p>
                </div>

                {/* 🔥 DO NOT TOUCH STRUCTURE */}
                <TipBox
                  actorId={actor.id}
                  actorName={actor.name}
                />

                <Link
                  href={`/actors/${actor.id}`}
                  className="inline-block text-sm font-semibold text-blue-600 hover:text-red-600 transition"
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