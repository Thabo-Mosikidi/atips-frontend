import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Actor ID is required" }, { status: 400 });
    }

    // Verify actor exists
    const actorExists = await prisma.actor.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!actorExists) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }

    // Fetch tips that were successful
    const tips = await prisma.tip.findMany({
      where: {
        actorId: id,
        status: "success",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true, // In ZAR cents
        currency: true,
        readableReference: true,
        createdAt: true,
      },
    });

    // Format output: convert amount back from cents to standard ZAR
    const formattedTips = tips.map((t) => ({
      id: t.id,
      amount: t.amount / 100, // ZAR
      currency: t.currency,
      reference: t.readableReference,
      createdAt: t.createdAt,
      supportedBy: "Anonymous Fan",
    }));

    // Aggregate statistics
    const totalCents = tips.reduce((acc, t) => acc + t.amount, 0);
    const totalAmount = totalCents / 100;
    const tipsCount = tips.length;

    return NextResponse.json({
      actor: actorExists.name,
      stats: {
        totalAmount,
        tipsCount,
      },
      tips: formattedTips,
    });
  } catch (error) {
    console.error("❌ Error listing actor's tip history:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
