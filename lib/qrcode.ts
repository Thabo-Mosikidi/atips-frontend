import { prisma } from "./prisma";
import crypto from "crypto";

interface QRParams {
  actorId: string;
  showId?: string;
  episodeId?: string;
}

/**
 * Generates a hybrid QR code for a given actor and optional show/episode combination.
 * Creates the QRCode database entry and returns the target URL and image URL.
 */
export async function getOrCreateQRCode({ actorId, showId, episodeId }: QRParams) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  // Determine if static or dynamic
  const isDynamic = !!(showId || episodeId);
  const type = isDynamic ? "DYNAMIC_EPISODE" : "STATIC_ACTOR";

  // Check if a matching QR code already exists to prevent duplicate rows
  const existingQR = await prisma.qRCode.findFirst({
    where: {
      actorId,
      showId: showId || null,
      episodeId: episodeId || null,
      type,
    },
  });

  if (existingQR) {
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      existingQR.targetUrl
    )}`;
    return {
      qrCode: existingQR,
      qrImageUrl,
    };
  }

  // Generate a unique short code slug
  const shortCode = crypto.randomBytes(4).toString("hex"); // e.g. 'f3a2b1c0'

  // Construct target redirection URL
  let targetUrl = `${baseUrl}/actors/${actorId}?qrCodeId=${shortCode}`;
  if (showId) {
    targetUrl += `&showId=${encodeURIComponent(showId)}`;
  }
  if (episodeId) {
    targetUrl += `&episodeId=${encodeURIComponent(episodeId)}`;
  }

  // Save the QR Code configuration to the database
  const newQR = await prisma.qRCode.create({
    data: {
      id: crypto.randomUUID(),
      code: shortCode,
      type,
      actorId,
      showId: showId || undefined,
      episodeId: episodeId || undefined,
      targetUrl,
      scanCount: 0,
    },
  });

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    targetUrl
  )}`;

  return {
    qrCode: newQR,
    qrImageUrl,
  };
}
