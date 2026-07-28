import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/actors/[id]/availability?serviceId=...
 * Lists an actor's open (unbooked, future) scheduling slots for the booking
 * system (#6). Optionally scoped to a specific Tier 2 service.
 *
 * Note: the current server clock is used as "now"; slots in the past or
 * already booked are excluded so a fan can only pick a real, free slot.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Actor ID is required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const serviceId = searchParams.get("serviceId") || undefined;

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        actorId: id,
        isBooked: false,
        startTime: { gt: new Date() },
        ...(serviceId ? { serviceId } : {}),
      },
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        serviceId: true,
        startTime: true,
        endTime: true,
      },
    });

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("❌ Error listing availability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
