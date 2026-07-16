import ViewerJourney from "./ViewerJourney";

async function getActor(id: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    return prisma.actor.findUnique({
      where: { id },
    });
  } catch {
    return null;
  }
}

export default async function ActorProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActor(id);

  const fallbackActor = {
    id,
    name: "Marina Vale",
    role: "Featured Performer",
    bio: "A charismatic performer whose screen presence leaves a lasting impression.",
    bioShort: "Featured Performer",
    bioFull:
      "A charismatic performer whose screen presence leaves a lasting impression. This viewer journey is designed to feel instant, premium, and effortless after the credits roll.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  };

  return <ViewerJourney actor={actor ?? fallbackActor} />;
}