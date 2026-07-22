import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateQRCode } from "@/lib/qrcode";

/**
 * QR Code generation endpoint.
 *
 * Generates (or returns an existing) hybrid QR code for an actor, optionally
 * scoped to a show/episode for per-episode analytics. The static-vs-dynamic
 * decision is made in lib/qrcode.ts:
 *   - actor only            -> STATIC_ACTOR
 *   - actor + show/episode  -> DYNAMIC_EPISODE
 *
 * GET  /api/qr?actorId=...&showId=...&episodeId=...   (convenient for testing)
 * POST /api/qr  { actorId, showId?, episodeId? }
 */
async function generate(actorId: string, showId?: string, episodeId?: string) {
  if (!actorId) {
    return NextResponse.json(
      { error: "actorId is required" },
      { status: 400 }
    );
  }

  const actor = await prisma.actor.findUnique({ where: { id: actorId } });
  if (!actor) {
    return NextResponse.json({ error: "Actor not found" }, { status: 404 });
  }

  const { qrCode, qrImageUrl } = await getOrCreateQRCode({
    actorId,
    showId,
    episodeId,
  });

  return NextResponse.json({ qrCode, qrImageUrl });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    return await generate(
      searchParams.get("actorId") || "",
      searchParams.get("showId") || undefined,
      searchParams.get("episodeId") || undefined
    );
  } catch (error) {
    console.error("❌ QR generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      actorId?: string;
      showId?: string;
      episodeId?: string;
    };
    return await generate(body.actorId || "", body.showId, body.episodeId);
  } catch (error) {
    console.error("❌ QR generation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
