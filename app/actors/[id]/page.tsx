/**
 * app/actors/[id]/page.tsx
 * Clean Stable Actor Profile
 */

import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import TipBox from "./TipBox";

/**
 * Fetch single actor by primary key
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
  // ✅ Required for Next.js 15
  const { id } = await params;

  const actor = await getActor(id);

  if (!actor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-700">
        Actor not found
      </div>
    );
  }

  return (
    <main className="min-h-screen py-14 px-6 flex justify-center">
      <div className="max-w-md w-full">

        <div
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

            <h1 className="text-xl font-semibold text-slate-800">
              {actor.name}
            </h1>

            <p className="text-sm text-slate-600">
              {actor.bio}
            </p>

            <div className="flex justify-center">
              <TipBox
                actorId={actor.id}
                actorName={actor.name}
              />
            </div>

            <Link
              href="/"
              className="inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to Homepage
            </Link>

          </div>
        </div>
      </div>
    </main>
  );
}