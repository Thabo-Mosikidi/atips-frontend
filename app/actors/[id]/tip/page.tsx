import TipFlow from "./TipFlow";
import { getActorById } from "@/lib/actors";

export default async function TipPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActorById(id);

  return (
    <TipFlow
      actorId={actor.id}
      actorName={actor.name}
      role={actor.role || actor.bioShort || "Featured Performer"}
      imageUrl={actor.imageUrl}
    />
  );
}
