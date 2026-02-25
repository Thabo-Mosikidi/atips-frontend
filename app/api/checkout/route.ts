/**
 * app/api/checkout/route.ts
 * Purpose: Create Stripe Checkout session safely
 */

import Stripe from "stripe";
import { NextResponse } from "next/server";

// 🔒 Ensure Stripe key exists
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in .env.local");
}

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const actorId = body.actorId;
    const actorName = body.actorName;
    const amountCents = body.amountCents;

    /* --------------------------------------------------
       🔒 SERVER-SIDE VALIDATION
       Never trust frontend validation alone
    ---------------------------------------------------*/

    if (!actorId || !actorName || !amountCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Enforce minimum R10 (1000 cents)
    if (Number(amountCents) < 1000) {
      return NextResponse.json(
        { error: "Minimum tip amount is R10" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: "Base URL not configured" },
        { status: 500 }
      );
    }

    /* --------------------------------------------------
       💳 CREATE STRIPE CHECKOUT SESSION
    ---------------------------------------------------*/

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],

      metadata: {
        actorId: actorId,
      },

      line_items: [
        {
          price_data: {
            currency: "zar",
            product_data: {
              name: `Tip for ${actorName}`,
            },
            unit_amount: Number(amountCents),
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?actor=${actorId}&amount=${Number(amountCents) / 100}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/actors/${actorId}`,
    });

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);

    return NextResponse.json(
      { error: error.message || "Stripe session failed" },
      { status: 500 }
    );
  }
}