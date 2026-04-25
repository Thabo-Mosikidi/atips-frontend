/**
 * app/actors/[id]/page.tsx
 * FINAL – POLISHED + WORKING BACKGROUND
 */

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import TipBox from "./TipBox";

async function getActor(id: string) {
  return prisma.actor.findUnique({
    where: { id },
  });
}

export default async function ActorProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActor(id);

  if (!actor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Actor not found
      </div>
    );
  }

  return (
    <main className="relative min-h-screen flex justify-center py-16 px-6 overflow-hidden bg-[#050D1F]">

      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Gradient base */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1C3D] via-[#07142A] to-[#020617]" />

        {/* ✅ FIXED GLASS BACKGROUND (NO TAILWIND BUG) */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "url('/glass.svg')",
            backgroundRepeat: "repeat",
            backgroundSize: "700px 500px",
          }}
        />

        {/* Soft glow effects */}
        <div className="absolute top-[-150px] left-[-150px] w-[400px] h-[400px] bg-blue-500/10 blur-[120px]" />
        <div className="absolute bottom-[-150px] right-[-150px] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px]" />

      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative max-w-lg w-full z-10">

        <div
          className="
            bg-white/5 backdrop-blur-lg
            border border-white/10
            rounded-2xl
            shadow-[0_20px_60px_rgba(0,0,0,0.7)]
            overflow-hidden
          "
        >

          {/* ================= IMAGE ================= */}
          <div className="relative w-full h-60 overflow-hidden">

            <Image
              src={actor.imageUrl}
              alt={actor.name}
              fill
              className="object-cover object-[50%_10%]"
            />

            {/* Light overlay (keeps image visible) */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          </div>

          {/* ================= TEXT ================= */}
          <div className="p-8 space-y-6 text-center text-white">

            {/* Actor Name */}
            <h1 className="text-4xl font-bold tracking-tight">
              {actor.name}
            </h1>

            {/* Subtitle */}
            {actor.bioShort && (
              <p className="text-sm text-blue-300 uppercase tracking-wide">
                {actor.bioShort}
              </p>
            )}

            {/* Divider */}
            <div className="w-12 h-[2px] bg-red-500 mx-auto rounded-full" />

            {/* Full Bio */}
            <div className="text-left max-w-md mx-auto">
              <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-line">
                {actor.bioFull}
              </p>
            </div>

            {/* ================= TIP SECTION ================= */}
            <div className="pt-8 border-t border-white/10">

              <h3 className="text-sm text-slate-300 mb-6">
                Support {actor.name}
              </h3>

              <div
                className="
                  bg-white text-black
                  rounded-xl p-6
                  shadow-[0_10px_40px_rgba(0,0,0,0.5)]
                "
              >
                <TipBox
                  actorId={actor.id}
                  actorName={actor.name}
                />
              </div>

            </div>

            {/* Back Link */}
            <Link
              href="/"
              className="inline-block text-sm font-semibold text-blue-400 hover:text-blue-300 transition"
            >
              ← Homepage
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}