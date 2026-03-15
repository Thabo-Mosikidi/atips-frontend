/**
 * app/api/webhooks/paystack/route.ts
 *
 * Purpose
 * -------------------------------------------
 * Handles Paystack webhook notifications.
 *
 * Paystack sends events when a transaction
 * status changes.
 *
 * When a payment succeeds:
 *   charge.success
 *
 * We then record the tip in our database.
 *
 * IMPORTANT
 * -------------------------------------------
 * We store the amount in CENTS (kobo)
 * to avoid floating-point rounding errors.
 *
 * Example:
 * 10.96 ZAR → 1096
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST
 * -------------------------------------------
 * Paystack sends webhook events here.
 */
export async function POST(req: Request) {
  try {

    /**
     * Read webhook payload
     */
    const body = await req.json();

    const event = body.event;
    const data = body.data;

    /**
     * Only process successful payments
     */
    if (event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    /**
     * Extract transaction reference
     */
    const reference = data.reference;

    /**
     * IMPORTANT
     * -------------------------------------------
     * Paystack amount is already in kobo (cents)
     *
     * Example:
     * 1096 = ZAR 10.96
     */
    const amount = data.amount;

    /**
     * Metadata from checkout initialization
     */
    const actorId = data.metadata?.actorId;

    if (!actorId) {
      console.error("Missing actorId in metadata");

      return NextResponse.json(
        { error: "Missing actorId metadata" },
        { status: 400 }
      );
    }

    /**
     * Prevent duplicate inserts
     */
    const existing = await prisma.tip.findUnique({
      where: {
        paystackReference: reference,
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Tip already recorded",
      });
    }

    /**
     * Store the tip
     */
    await prisma.tip.create({
      data: {
        id: crypto.randomUUID(),
        actorId: actorId,

        /**
         * Stored in cents
         */
        amount: amount,

        paystackReference: reference,
      },
    });

    console.log("Tip recorded successfully:", reference);

    return NextResponse.json({
      message: "Tip stored successfully",
    });

  } catch (error) {

    console.error("Webhook Error:", error);

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}