import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessToken, getOrderStatus, captureOrder } from "@/lib/paypal";

interface StatusBody {
  promotionId?: string;
  transactionId?: string;
}

/**
 * POST /api/promotions/status  { promotionId | transactionId }
 * Captures the PayPal order for a premium/boost purchase and activates it:
 * marks the Promotion ACTIVE and flags the actor premium for the window.
 * Idempotent; complements the webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const { promotionId, transactionId } = (await req.json()) as StatusBody;
    if (!promotionId && !transactionId) {
      return NextResponse.json(
        { error: "promotionId or transactionId is required" },
        { status: 400 }
      );
    }

    const promo = await prisma.promotion.findFirst({
      where: promotionId ? { id: promotionId } : { transactionId },
      include: { transaction: true },
    });
    if (!promo || !promo.transaction) {
      return NextResponse.json({ error: "Promotion not found" }, { status: 404 });
    }

    if (promo.status === "ACTIVE") {
      return NextResponse.json({ status: "ACTIVE", promotion: promo });
    }
    if (promo.status === "CANCELLED" || promo.status === "EXPIRED") {
      return NextResponse.json({ status: promo.status });
    }

    const accessToken = await getAccessToken();
    let payStatus = await getOrderStatus(accessToken, promo.transaction.gatewayReference);
    if (payStatus === "APPROVED") {
      if (await captureOrder(accessToken, promo.transaction.gatewayReference)) {
        payStatus = "COMPLETED";
      }
    }

    if (payStatus === "COMPLETED") {
      const activated = await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: promo.transactionId! },
          data: { status: "COMPLETED" },
        });
        await tx.actor.update({
          where: { id: promo.actorId },
          data: {
            isPremium: true,
            premiumUntil: promo.endsAt,
            priorityRank: { increment: 1 },
          },
        });
        return tx.promotion.update({
          where: { id: promo.id },
          data: { status: "ACTIVE" },
        });
      });
      return NextResponse.json({ status: "ACTIVE", promotion: activated });
    }

    if (["VOIDED", "EXPIRED"].includes(payStatus || "")) {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: promo.transactionId! },
          data: { status: "FAILED" },
        }),
        prisma.promotion.update({
          where: { id: promo.id },
          data: { status: "CANCELLED" },
        }),
      ]);
      return NextResponse.json({ status: "CANCELLED" });
    }

    return NextResponse.json({ status: "PENDING" });
  } catch (error) {
    console.error("❌ Promotion status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
