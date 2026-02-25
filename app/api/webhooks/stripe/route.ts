/**
 * app/api/webhooks/stripe/route.ts
 * Purpose:
 * - Securely receive Stripe events
 * - Verify Stripe signature
 * - Save successful tips to database
 */

import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-06-20" as any,
});

export async function POST(req: Request) {
  const body = await req.text();
  //const signature = headers().get("stripe-signature") as string;
  const signature = req.headers.get("stripe-signature") as string;

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    // ✅ Verify event is truly from Stripe
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error("Webhook signature verification failed:", error.message);
    return new Response(`Webhook Error: ${error.message}`, {
      status: 400,
    });
  }

  // ✅ Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const actorId = session.metadata?.actorId;
    const amount = session.amount_total; // in cents

    if (!actorId || !amount) {
      console.error("Missing actorId or amount in session metadata.");
      return new Response("Missing metadata", { status: 400 });
    }

    try {
      await prisma.tip.create({
        data: {
          actorId: actorId,
          amount: amount,
        },
      });

      console.log("Tip saved successfully.");
    } catch (dbError) {
      console.error("Database error:", dbError);
      return new Response("Database error", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}