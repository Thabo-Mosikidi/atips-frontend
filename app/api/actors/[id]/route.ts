import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Actor ID or QR Code is required" },
        { status: 400 }
      );
    }

    // 1. Try fetching by Actor ID directly
    let actor = await prisma.actor.findUnique({
      where: { id },
      include: {
        episodes: {
          include: {
            episode: {
              include: {
                show: true,
              },
            },
          },
        },
      },
    });

    // 2. If not found, check if 'id' is a QR Code identifier
    if (!actor) {
      const qrCode = await prisma.qRCode.findUnique({
        where: { code: id },
        include: {
          actor: {
            include: {
              episodes: {
                include: {
                  episode: {
                    include: {
                      show: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (qrCode && qrCode.actor) {
        // Increment scan count asynchronously
        prisma.qRCode
          .update({
            where: { id: qrCode.id },
            data: { scanCount: { increment: 1 } },
          })
          .catch((err) => console.error("Error updating scan count:", err));

        actor = qrCode.actor;
      }
    }

    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }

    return NextResponse.json({ actor });
  } catch (error) {
    console.error("❌ Error fetching actor:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
