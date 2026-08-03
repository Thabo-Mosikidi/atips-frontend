export const dynamic = "force-dynamic";

import Image from "next/image";
import Link from "next/link";
import { actors as fallbackActors } from "@/data/actors";
import { t, DEFAULT_LOCALE } from "@/lib/i18n";

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
      // Premium Profiles (#2) / Promotional boosts (#7): prioritized placement.
      // Boosted actors surface first, then by original directory number.
      orderBy: [
        { priorityRank: "desc" },
        { isPremium: "desc" },
        { number: "asc" },
      ],
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
  const locale = DEFAULT_LOCALE; // TODO: derive from a locale switcher / Accept-Language

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0A1F44]">
      {/* HERO BACKGROUND VIDEO + OVERLAY (fades into the navy directory) */}
      <div className="absolute inset-x-0 top-0 h-[95vh] -z-10 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-45"
        >
          <source src="/images/background.mp4" type="video/mp4" />
        </video>
        {/* Readability overlay — keeps hero copy legible over any frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A1F44]/75 via-[#0A1F44]/85 to-[#0A1F44]" />
        {/* Subtle brand glows on top of the video */}
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[150px] animate-soft-pulse-1" />
        <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-[#C9A34E]/10 rounded-full blur-[150px] animate-soft-pulse-2" />
      </div>

      {/* HERO SECTION WITH CLEAN VISUAL HIERARCHY */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-12 text-center space-y-6 relative z-10 animate-rise-in">
        <div className="space-y-3">
          <span className="inline-block text-xs uppercase tracking-[0.25em] text-[#C9A34E] font-semibold bg-[#C9A34E]/10 px-4 py-1.5 rounded-full border border-[#C9A34E]/25">
            {t(locale, "home.badge")}
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {t(locale, "home.heroTitle")}{" "}
            <span className="red-text-gradient font-extrabold">{t(locale, "home.heroTitleAccent")}</span>
          </h1>
          <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            {t(locale, "home.heroSubtitle")}
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
                placeholder={t(locale, "home.searchPlaceholder")}
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

      {/* HOW IT WORKS — trust strip */}
      <section className="max-w-5xl mx-auto px-6 pb-6 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { n: "01", t: "Scan or search", d: "Find an actor via a QR code on-screen or our directory." },
            { n: "02", t: "Tip or book", d: "Send a tip, or book private video calls & mentorship." },
            { n: "03", t: "They get rewarded", d: "Your support reaches the performer you love, directly." },
          ].map((s) => (
            <div key={s.n} className="glass-panel rounded-2xl border border-white/10 p-5 text-left">
              <span className="text-xs font-bold tracking-widest gold-text-gradient">{s.n}</span>
              <h3 className="mt-2 text-sm font-bold text-white">{s.t}</h3>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed font-light">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* GRID SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-6 pb-24 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-lg font-bold text-white tracking-tight">Browse the directory</h2>
          <div className="flex-1 gold-hairline" />
        </div>
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

                {"isPremium" in actor && actor.isPremium && (
                  <span className="absolute top-4 right-4 bg-gradient-to-r from-[#C9A34E] to-[#E6C878] text-[#0A1F44] text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-md backdrop-blur-sm">
                    ★ Premium
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

                <div className="pt-2">
                  <Link
                    href={`/actors/${actor.id}`}
                    className="block w-full text-center bg-gradient-to-r from-[#D90429] to-[#A60321] text-white py-2.5 text-sm rounded-xl font-semibold hover:from-[#ff1a3c] hover:to-[#b30026] transition-all duration-200 active:scale-[0.98] shadow-md shadow-red-950/30 red-glow-hover"
                  >
                    Support {actor.name.split(" ")[0]}
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