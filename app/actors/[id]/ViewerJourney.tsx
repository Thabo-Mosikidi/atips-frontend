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
                Reward {firstName} for the work you love — 80% of every tip goes straight to the artist — or book private one-on-one access.
              </p>
            </div>

            {/* TWO CLEAR CHOICES → dedicated pages */}
            <div className="grid sm:grid-cols-2 gap-4 pt-1">
              <Link
                href={tipHref}
                className="group rounded-3xl border border-[#D90429]/30 bg-gradient-to-br from-[#D90429]/15 to-transparent p-5 transition-all duration-300 hover:border-[#D90429]/60 red-glow-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">💛</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#D90429] bg-[#D90429]/10 px-2 py-1 rounded-full">
                    Tier 1
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Send a Tip</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  A quick thank-you from R10. Fast, secure, and 80% goes straight to {firstName}.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:gap-2 transition-all">
                  Tip now <span aria-hidden>→</span>
                </span>
              </Link>

              <Link
                href={bookHref}
                className="group rounded-3xl border border-[#C9A34E]/30 bg-gradient-to-br from-[#C9A34E]/15 to-transparent p-5 transition-all duration-300 hover:border-[#C9A34E]/60 gold-glow-hover"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">✨</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A34E] bg-[#C9A34E]/10 px-2 py-1 rounded-full">
                    Tier 2
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-white">Book Private Access</h3>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Video calls, mentorship & industry advice — exclusive one-on-one time with {firstName}.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#E6C878] group-hover:gap-2 transition-all">
                  See experiences <span aria-hidden>→</span>
                </span>
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
