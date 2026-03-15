/**
 * app/actors/[id]/page.tsx
 *
 * Actor Profile Page
 * ------------------------------------------------
 * Displays the full actor profile including:
 * - Actor image
 * - Actor name
 * - Actor role / short bio
 * - Full biography
 * - TipBox component
 * - Link back to homepage
 */

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import TipBox from "./TipBox";


/**
 * Fetch a single actor from the database
 */
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
    <main className="py-16 px-6 flex justify-center">

      {/* Slightly wider profile card for long biographies */}
      <div className="max-w-lg w-full">

        <div
          className="
            bg-[#1e293b]
            rounded-xl
            shadow-lg
            overflow-hidden
            transition-all duration-300
            hover:shadow-2xl
            hover:-translate-y-1
          "
        >

          {/* =====================================
              ACTOR IMAGE
          ====================================== */}
          <div className="relative w-full h-60 overflow-hidden">

            <Image
              src={actor.imageUrl}
              alt={actor.name}
              fill
              className="object-cover object-[50%_10%]"
            />

          </div>


          {/* =====================================
              PROFILE CONTENT
          ====================================== */}
          <div className="p-8 space-y-6 text-center">


            {/* Actor Name */}
            <h1 className="text-4xl font-bold text-white">
              {actor.name}
            </h1>


            {/* Short Description */}
            {actor.bioShort && (
              <p className="text-sm text-slate-300 font-medium max-w-sm mx-auto">
                {actor.bioShort}
              </p>
            )}


            {/* =====================================
                FULL BIOGRAPHY
            ====================================== */}
            <div className="text-left max-w-md mx-auto">

              <p className="text-[15px] text-slate-300 leading-relaxed whitespace-pre-line">
                {actor.bioFull}
              </p>

            </div>


            {/* =====================================
                TIP SECTION
            ====================================== */}
            <div className="flex flex-col items-center pt-8 border-t border-slate-700">

              <h3 className="text-sm font-semibold text-slate-300 mb-4">
                Tip {actor.name}
              </h3>

              <TipBox
                actorId={actor.id}
                actorName={actor.name}
              />

            </div>


            {/* Back Link */}
            <Link
              href="/"
              className="inline-block text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              ← Back to Homepage
            </Link>

          </div>

        </div>

      </div>

    </main>
  );
}