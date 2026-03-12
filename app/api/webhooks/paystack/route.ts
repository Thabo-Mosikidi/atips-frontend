/**
 * app/api/webhooks/paystack/route.ts
 *
 * PRODUCTION-GRADE PAYSTACK WEBHOOK
 * ------------------------------------------
 * - Verifies Paystack signature
 * - Prevents duplicate tip insertion
 * - Saves tip securely
 * - Increments actor total
 * - Idempotent-safe
 */

import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {

    /* --------------------------------------------------
       STEP 1: Read raw body (Paystack requires raw body)
    ---------------------------------------------------*/
    const body = await req.text();

    /* --------------------------------------------------
       STEP 2: Verify Paystack signature
       Paystack uses HMAC SHA512
    ---------------------------------------------------*/
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY as string)
      .update(body)
      .digest("hex");

    const signature = req.headers.get("x-paystack-signature");

    if (hash !== signature) {
      console.error("Invalid Paystack signature");
      return new Response("Invalid signature", { status: 401 });
    }

    /* --------------------------------------------------
       STEP 3: Parse event
    ---------------------------------------------------*/
    const event = JSON.parse(body);

    /* --------------------------------------------------
       STEP 4: Handle successful payment
       Paystack event = charge.success
    ---------------------------------------------------*/
    if (event.event === "charge.success") {

      const data = event.data;

      const actorId = data.metadata?.actorId;
      const amount = data.amount; // in cents
      const reference = data.reference;

      if (!actorId || !amount || !reference) {
        return new Response("Missing metadata", { status: 400 });
      }

      try {

        /* --------------------------------------------------
           STEP 5: Prevent duplicate tips
        ---------------------------------------------------*/
        const existingTip = await prisma.tip.findFirst({
          where: {
            paystackReference: reference,
          },
        });

        if (existingTip) {
          console.log("Duplicate webhook ignored.");
          return new Response("Already processed", { status: 200 });
        }

        /* --------------------------------------------------
           STEP 6: Save tip
        ---------------------------------------------------*/
        await prisma.tip.create({
          data: {
            paystackReference: reference,
            actorId: actorId,
            amount: amount,
          },
        });

        /* --------------------------------------------------
           STEP 7: Increment actor total
        ---------------------------------------------------*/
        await prisma.actor.update({
          where: { id: actorId },
          data: {
            number: {
              increment: amount,
            },
          },
        });

        console.log("Tip saved & actor total updated.");
      } catch (error) {
        console.error("Database error:", error);
        return new Response("Database error", { status: 500 });
      }
    }

    return new Response("Webhook received", { status: 200 });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook error", { status: 500 });
  }
}