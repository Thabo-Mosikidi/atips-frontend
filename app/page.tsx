export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { actors as fallbackActors } from "@/data/actors";

async function getActors(search?: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const actors = await prisma.actor.findMany({
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

    if (Array.isArray(actors) && actors.length > 0) {
      return actors;
    }
  } catch {
    // Fall back to the local demo dataset when Prisma is unavailable.
  }

  const normalized = fallbackActors.map((actor, index) => ({
    id: actor.slug,
    name: actor.name,
    imageUrl: actor.imageUrl,
    bio: actor.bio,
    number: index + 1,
  }));

  const query = search?.trim().toLowerCase() ?? "";

  return query
    ? normalized.filter((actor) =>
        actor.name.toLowerCase().includes(query)
      )
    : normalized;
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
      {/* PREMIUM BACKGROUND GLOWS */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px] animate-soft-pulse-1" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[150px] animate-soft-pulse-2" />
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1F44] via-[#071735] to-[#040e29]" />
      </div>

      {/* HERO SECTION WITH CLEAN VISUAL HIERARCHY */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-6 relative z-10">
        <div className="space-y-3">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#C9A34E] font-semibold bg-[#C9A34E]/10 px-4 py-1.5 rounded-full border border-[#C9A34E]/25">
            QR Tipping Directory
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Directly Reward the Talents You <span className="red-text-gradient font-extrabold">Value</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Scan a QR code during screen credits or search our directory to tip your favorite South African actors. 80% goes directly to them.
          </p>
        </div>

        {/* HIGH CONTRAST SEARCH CONTAINER */}
        <div className="max-w-xl mx-auto pt-4">
          <form method="GET" className="flex items-center gap-3 bg-[#0d254f] p-2 rounded-2xl border border-white/10 shadow-lg shadow-black/30 focus-within:border-[#C9A34E]/50 focus-within:ring-2 focus-within:ring-[#C9A34E]/20 transition-all duration-300">
            <div className="flex-1 flex items-center pl-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder="Search actors by name..."
                className="w-full bg-transparent border-0 text-white placeholder-slate-400 focus:outline-none focus:ring-0 text-sm ml-2.5"
              />
            </div>
            
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#D90429] to-[#A60321] text-white text-xs font-semibold rounded-xl hover:from-[#ff1a3c] hover:to-[#b30026] active:scale-95 transition shadow-md shadow-red-950/20"
            >
              Search
            </button>

            {search && (
              <Link
                href="/"
                className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl transition"
              >
                Reset
              </Link>
            )}
          </form>
        </div>
      </section>

      {/* GRID SECTION */}
      <section className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {actors.map((actor) => (
            <div
              key={actor.id}
              className="group glass-panel rounded-2xl shadow-lg border border-white/5 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-[#C9A34E]/30 flex flex-col justify-between"
            >
              {/* IMAGE WITH GRADIENT OVERLAY */}
              <div className="relative w-full h-64 overflow-hidden bg-slate-950">
                <Image
                  src={actor.imageUrl}
                  alt={actor.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                  priority={!!(actor.number && actor.number <= 5)}
                  className="object-cover object-[50%_18%] transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/20 to-transparent" />
                
                {actor.number && (
                  <span className="absolute top-4 left-4 bg-[#0A1F44]/80 text-[#C9A34E] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-[#C9A34E]/30 backdrop-blur-sm">
                    #{actor.number}
                  </span>
                )}
              </div>

              {/* CARD DETAILS */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-white group-hover:text-[#E6C878] transition">
                    {actor.name}
                  </h2>
                  <p className="text-xs text-[#C9A34E]/90 uppercase tracking-widest font-medium">
                    Featured Performer
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mt-2">
                    {actor.bio}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    href={`/actors/${actor.id}`}
                    className="block w-full text-center bg-gradient-to-r from-[#D90429] to-[#A60321] text-white py-2.5 text-sm rounded-xl font-semibold hover:from-[#ff1a3c] hover:to-[#b30026] transition-all duration-200 active:scale-[0.98] shadow-md shadow-red-950/30 red-glow-hover"
                  >
                    Support & Tip Now
                  </Link>
                  <Link
                    href={`/actors/${actor.id}`}
                    className="block w-full text-center text-xs font-medium text-slate-400 hover:text-white transition duration-150 py-1"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}