import ViewerJourney from "./ViewerJourney";
import { actors as fallbackActors } from "@/data/actors";

async function getActor(id: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const actor = await prisma.actor.findUnique({
      where: { id },
    });

    if (actor) {
      return actor;
    }
  } catch {
    // Fall back to local actors dataset when Prisma is unavailable.
  }

  return null;
}

export default async function ActorProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const dbActor = await getActor(id);

  // Find matching local actor by slug/id or default to the first actor
  const matched =
    fallbackActors.find(
      (a) => a.slug === id || a.name.toLowerCase() === id.toLowerCase()
    ) ?? fallbackActors[0];

  const fallbackActor = {
    id: matched.slug,
    name: matched.name,
    role: matched.role,
    bio: matched.bio,
    bioShort: matched.role,
    bioFull: matched.bio,
    imageUrl: matched.imageUrl,
  };

  return <ViewerJourney actor={dbActor ?? fallbackActor} />;
}