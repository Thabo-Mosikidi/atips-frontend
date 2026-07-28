/**
 * Broadcaster QR overlay (#8).
 * Embedded by TV partners as:
 *   <iframe src="/embed/overlay?actorId=..&showId=..&episode=12&key=API_KEY" allowtransparency>
 *
 * Transparent background so it layers over live video. Validates the partner
 * API key, then renders the actor + a scannable QR that deep-links to the tip
 * page (mapped to a QRCode row so scans are counted per actor/episode).
 */
export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  actorId?: string;
  showId?: string;
  episodeId?: string;
  episode?: string;
  key?: string;
  position?: string; // bottom-right (default) | bottom-left | top-right | top-left
}>;

const POSITION_CLASS: Record<string, string> = {
  "bottom-right": "items-end justify-end",
  "bottom-left": "items-end justify-start",
  "top-right": "items-start justify-end",
  "top-left": "items-start justify-start",
};

async function validatePartner(key?: string): Promise<boolean> {
  if (!key) return false;
  try {
    const { prisma } = await import("@/lib/prisma");
    const partner = await prisma.partner.findUnique({ where: { apiKey: key } });
    return !!partner && partner.isActive;
  } catch {
    return false;
  }
}

export default async function OverlayPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const authorized = await validatePartner(sp.key);

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <div className="rounded-xl bg-black/70 text-white text-xs px-4 py-3 border border-white/10">
          A.TIPS overlay: invalid or missing partner key.
        </div>
      </div>
    );
  }

  if (!sp.actorId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <div className="rounded-xl bg-black/70 text-white text-xs px-4 py-3 border border-white/10">
          A.TIPS overlay: actorId is required.
        </div>
      </div>
    );
  }

  const { prisma } = await import("@/lib/prisma");
  const { getOrCreateQRCode } = await import("@/lib/qrcode");

  const actor = await prisma.actor.findUnique({ where: { id: sp.actorId } });
  if (!actor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent p-4">
        <div className="rounded-xl bg-black/70 text-white text-xs px-4 py-3 border border-white/10">
          A.TIPS overlay: actor not found.
        </div>
      </div>
    );
  }

  const { qrImageUrl } = await getOrCreateQRCode({
    actorId: actor.id,
    showId: sp.showId,
    episodeId: sp.episodeId,
  });

  const posClass = POSITION_CLASS[sp.position || "bottom-right"] ?? POSITION_CLASS["bottom-right"];

  return (
    <div className={`min-h-screen w-full flex ${posClass} bg-transparent p-4 sm:p-6`}>
      <div className="flex items-center gap-3 rounded-2xl bg-[#0A1F44]/90 backdrop-blur-md border border-[#C9A34E]/30 p-3 shadow-2xl animate-fade-in max-w-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageUrl}
          alt="Scan to tip"
          className="h-20 w-20 rounded-lg bg-white p-1 shrink-0"
        />
        <div className="min-w-0">
          <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-[#C9A34E]">
            Tip on A.TIPS
          </span>
          <span className="block text-sm font-extrabold text-white truncate">
            {actor.name}
          </span>
          <span className="block text-[10px] text-slate-300 leading-tight mt-0.5">
            Scan to reward this performer · 80% goes to them
          </span>
        </div>
      </div>
    </div>
  );
}
