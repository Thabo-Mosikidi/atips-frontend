/**
 * app/api/webhooks/paystack/route.ts
 *
 * Purpose
 * -------------------------------------------
 * Handles Paystack webhook notifications.
 *
 * When a payment succeeds Paystack sends
 * a webhook event to this route.
 *
 * We verify the event and then record
 * the tip inside our database.
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
     * Read raw body from Paystack
     */
    const body = await req.json();

    const event = body.event;
    const data = body.data;

    /**
     * Only handle successful payments
     */
    if (event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    /**
     * Extract important fields
     */
    const reference = data.reference;
    const amount = data.amount / 100; // convert kobo → rand

    /**
     * Metadata we sent earlier in checkout
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
     * Insert tip into database
     */
    await prisma.tip.create({
      data: {
        id: crypto.randomUUID(),
        actorId: actorId,
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