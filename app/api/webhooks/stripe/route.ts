/**
 * app/api/webhooks/stripe/route.ts
 *
 * PRODUCTION-GRADE STRIPE WEBHOOK
 * ------------------------------------------
 * - Verifies Stripe signature
 * - Prevents duplicate tip insertion
 * - Saves tip securely
 * - Increments actor total
 * - Idempotent-safe
 */

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return new Response("Invalid signature", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const actorId = session.metadata?.actorId;
    const amount = session.amount_total; // in cents
    const stripeSessionId = session.id;

    if (!actorId || !amount || !stripeSessionId) {
      return new Response("Missing metadata", { status: 400 });
    }

    try {
      // 🔒 Prevent duplicate tip entries
      const existingTip = await prisma.tip.findUnique({
        where: { stripeSessionId },
      });

      if (existingTip) {
        console.log("Duplicate webhook ignored.");
        return new Response("Already processed", { status: 200 });
      }

      // 💾 Save tip
      await prisma.tip.create({
        data: {
          stripeSessionId,
          actorId,
          amount,
        },
      });

      // 📈 Increment actor total
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
}