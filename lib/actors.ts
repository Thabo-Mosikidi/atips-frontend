import { actors as fallbackActors } from "@/data/actors";

/** Normalized actor shape shared by the profile, tip, and book pages. */
export type ProfileActor = {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  bioShort: string | null;
  bioFull: string | null;
  imageUrl: string;
  isPremium: boolean;
};

/**
 * Fetch an actor by DB id, falling back to the local demo dataset (by slug or
 * name) so profiles still render when the database is unavailable.
 */
export async function getActorById(id: string): Promise<ProfileActor> {
  try {
    const { prisma } = await import("@/lib/prisma");
    const a = await prisma.actor.findUnique({ where: { id } });
    if (a) {
      return {
        id: a.id,
        name: a.name,
        role: a.role,
        bio: a.bio,
        bioShort: a.bioShort,
        bioFull: a.bioFull,
        imageUrl: a.imageUrl,
        isPremium: a.isPremium,
      };
    }
  } catch {
    // fall through to demo dataset
  }

  const matched =
    fallbackActors.find(
      (a) => a.slug === id || a.name.toLowerCase() === id.toLowerCase()
    ) ?? fallbackActors[0];

  return {
    id: matched.slug,
    name: matched.name,
    role: matched.role,
    bio: matched.bio,
    bioShort: matched.role,
    bioFull: matched.bio,
    imageUrl: matched.imageUrl,
    isPremium: false,
  };
}
