import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessToken, createOrder } from "@/lib/paypal";
import crypto from "crypto";

/**
 * Premium Profiles (#2) + Promotional Services (#7).
 * One-time, timeboxed boosts purchased through the shared PayPal pipeline.
 * Pricing + duration are server-defined (never trust client amounts).
 */
const PROMO_PLANS = {
  PREMIUM_PLACEMENT: { priceCents: 19900, days: 30, label: "Premium Placement (30 days)" },
  PROMOTIONAL_BOOST: { priceCents: 9900, days: 7, label: "Promotional Boost (7 days)" },
} as const;

type PromoType = keyof typeof PROMO_PLANS;

interface CreatePromoBody {
  actorId: string;
  type: PromoType;
  source?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { actorId, type, source } = (await req.json()) as CreatePromoBody;

    if (!actorId || !type) {
      return NextResponse.json({ error: "actorId and type are required" }, { status: 400 });
    }
    const plan = PROMO_PLANS[type];
    if (!plan) {
      return NextResponse.json({ error: "Unknown promotion type" }, { status: 400 });
    }

    const actor = await prisma.actor.findUnique({
      where: { id: actorId },
      select: { id: true, name: true },
    });
    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }

    // Window starts now; endsAt drives how long the boost stays active.
    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + plan.days * 24 * 60 * 60 * 1000);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const transactionId = crypto.randomUUID();
    const promotionId = crypto.randomUUID();

    const accessToken = await getAccessToken();
    const returnUrl =
      `${baseUrl}/success?type=promotion&promotionId=${promotionId}` +
      `&transactionId=${transactionId}` +
      `&actorId=${encodeURIComponent(actorId)}` +
      `&actorName=${encodeURIComponent(actor.name)}` +
      `&amount=${encodeURIComponent(String(plan.priceCents / 100))}`;
    const cancelUrl = source ? `${baseUrl}${source}` : `${baseUrl}/actors/${actorId}`;

    const { orderId, approvalUrl } = await createOrder(accessToken, {
      amountZar: plan.priceCents / 100,
      referenceId: transactionId,
      description: `${plan.label} — ${actor.name}`,
      returnUrl,
      cancelUrl,
    });

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          id: transactionId,
          amount: plan.priceCents,
          currency: "ZAR",
          gateway: "PAYPAL",
          gatewayReference: orderId,
          status: "PENDING",
          type: "PROMOTION",
          actorId,
        },
      }),
      prisma.promotion.create({
        data: {
          id: promotionId,
          actorId,
          type,
          amount: plan.priceCents,
          currency: "ZAR",
          startsAt,
          endsAt,
          status: "PENDING",
          transactionId,
        },
      }),
    ]);

    return NextResponse.json({ url: approvalUrl, promotionId, transactionId });
  } catch (error) {
    console.error("❌ Promotion creation error:", error);
    const message =
      error instanceof Error && error.message ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** Expose the plan catalogue so the UI never hardcodes prices. */
export async function GET() {
  return NextResponse.json({ plans: PROMO_PLANS });
}
