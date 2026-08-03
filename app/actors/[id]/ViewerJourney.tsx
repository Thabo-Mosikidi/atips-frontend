/**
 * ViewerJourney — the actor profile landing ("second page").
 *
 * A clean, cinematic landing only: identity + story + two clear choices.
 * The transactional flows live on their own pages so nothing is crammed here:
 *   "Send a Tip"          → /actors/[id]/tip
 *   "Book Private Access" → /actors/[id]/book
 * Server component (no client JS needed); QR context is forwarded to the tip
 * page via `query`.
 */

import Image from "next/image";
import Link from "next/link";
import type { ProfileActor } from "@/lib/actors";

function parseBio(raw: string): { intro: string; highlights: string[] } {
  const marker = "Key Highlights:";
  const idx = raw.indexOf(marker);
  if (idx === -1) return { intro: raw.trim(), highlights: [] };
  const intro = raw.slice(0, idx).trim();
  const highlights = raw
    .slice(idx + marker.length)
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("-"))
    .map((l) => l.replace(/^-\s*/, ""));
  return { intro, highlights };
}

export default function ViewerJourney({
  actor,
  query,
}: {
  actor: ProfileActor;
  query?: string;
}) {
  const { intro, highlights } = parseBio(actor.bioFull || actor.bio || "");
  const role = actor.role || actor.bioShort || "Featured Performer";
  const firstName = actor.name.split(" ")[0];
  const tipHref = `/actors/${actor.id}/tip${query ? `?${query}` : ""}`;
  const bookHref = `/actors/${actor.id}/book`;

  return (
    <main className="relative overflow-hidden bg-[#0A1F44] text-white">
      {/* AMBIENT GLOWS */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-8%] left-[-6%] w-[520px] h-[520px] bg-red-500/10 rounded-full blur-[150px] animate-soft-pulse-1" />
        <div className="absolute bottom-[6%] right-[-6%] w-[520px] h-[520px] bg-[#C9A34E]/10 rounded-full blur-[150px] animate-soft-pulse-2" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#071735]/40 to-[#040e29]" />
      </div>

      {/* ================= HERO ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-8">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] items-center">
          {/* PORTRAIT */}
          <div className="relative animate-rise-in">
            <div className="relative aspect-[4/5] w-full max-w-sm mx-auto lg:mx-0 rounded-3xl overflow-hidden border border-white/10 shadow-[0_30px_90px_rgba(2,6,23,0.8)]">
              <Image
                src={actor.imageUrl}
                alt={actor.name}
                fill
                sizes="(max-width: 1024px) 100vw, 40vw"
                priority
                className="object-cover object-[50%_15%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1F44] via-[#0A1F44]/10 to-transparent" />
              {actor.isPremium && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-[#C9A34E] to-[#E6C878] text-[#0A1F44] text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-lg">
                  ★ Premium Talent
                </span>
              )}
            </div>
          </div>

          {/* IDENTITY + CHOICES */}
          <div className="space-y-6 animate-rise-in rise-delay-1">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E] bg-[#C9A34E]/10 border border-[#C9A34E]/25 px-3 py-1.5 rounded-full">
                {role}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] flex flex-wrap items-center gap-3">
                <span className="premium-text-gradient">{actor.name}</span>
                <svg className="w-7 h-7 text-[#C9A34E] shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-label="Verified">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-light max-w-xl leading-relaxed">
                Reward {firstName} for the work you love, or book private one-on-one access — video calls, mentorship and industry advice.
              </p>
            </div>

            {/* PRIMARY ACTIONS → dedicated pages */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Flushy primary: Tip Now (with a shine sweep on hover) */}
              <Link
                href={tipHref}
                className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-[#D90429] to-[#A60321] px-8 py-5 text-center text-base font-extrabold text-white shadow-xl shadow-red-950/40 transition-all duration-200 hover:from-[#ff1a3c] hover:to-[#b30026] active:scale-[0.98] red-glow-hover"
              >
                <span className="relative z-10 inline-flex items-center justify-center gap-2">
                  <span aria-hidden>💛</span> Tip Now
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </Link>

              {/* Secondary button: Book Private Access */}
              <Link
                href={bookHref}
                className="flex-1 rounded-2xl border border-[#C9A34E]/50 bg-[#C9A34E]/10 px-8 py-5 text-center text-base font-bold text-[#E6C878] transition-all duration-200 hover:bg-[#C9A34E]/20 active:scale-[0.98] gold-glow-hover"
              >
                Book Private Access
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="gold-hairline my-4" />
      </div>

      {/* ================= ABOUT (single source of bio) ================= */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-16 animate-rise-in">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E]">
              About
            </span>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              The story behind the artist
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed font-light whitespace-pre-line">
              {intro}
            </p>
          </div>

          {highlights.length > 0 && (
            <div className="glass-panel rounded-3xl p-6 border border-white/10">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A34E]">
                Career Highlights
              </span>
              <ul className="mt-4 space-y-3">
                {highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-200 font-light">
                    <span className="mt-0.5 text-[#C9A34E]">◆</span>
                    <span className="leading-relaxed">{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
