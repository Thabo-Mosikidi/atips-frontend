import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/actors/[id]/services
 * Lists an actor's active Tier 2 Access offerings (video call / mentorship /
 * industry advice). Public — powers the booking section on the profile.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Actor ID is required" }, { status: 400 });
    }

    const services = await prisma.service.findMany({
      where: { actorId: id, isActive: true },
      orderBy: { price: "asc" },
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        price: true,
        durationMin: true,
      },
    });

    // Prices to the client in ZAR (schema stores cents).
    const formatted = services.map((s) => ({
      ...s,
      price: s.price / 100,
      priceCents: s.price,
    }));

    return NextResponse.json({ services: formatted });
  } catch (error) {
    console.error("❌ Error listing services:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
