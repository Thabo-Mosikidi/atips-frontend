import ViewerJourney from "./ViewerJourney";
import { getActorById } from "@/lib/actors";

export default async function ActorProfile({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const actor = await getActorById(id);

  // Preserve QR context (scan attribution) so the tip page still receives it.
  const qp = new URLSearchParams();
  for (const key of ["qrCodeId", "showId", "episodeId"]) {
    const v = sp?.[key];
    if (typeof v === "string") qp.set(key, v);
  }

  return <ViewerJourney actor={actor} query={qp.toString()} />;
}
