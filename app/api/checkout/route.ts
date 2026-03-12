/**
 * app/api/checkout/route.ts
 * Purpose: Initialize Paystack payment safely
 */

import { NextResponse } from "next/server";

/* --------------------------------------------------
   🔒 Ensure Paystack key exists
---------------------------------------------------*/
if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in .env.local");
}

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

    // Minimum R10
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
       💳 INITIALIZE PAYSTACK TRANSACTION
    ---------------------------------------------------*/

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email: "fan@atips.app", 
          // Paystack requires an email (can later be real fan email)

          amount: Number(amountCents), 
          // Paystack also uses cents (kobo equivalent)

          currency: "ZAR",

          metadata: {
          actorId: actorId,
          actorName: actorName,
          },

          description: `Tip for ${actorName}`,

          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?actor=${actorId}&amount=${Number(amountCents) / 100}`,
        }),
      }
    );

    const data = await response.json();

    /* --------------------------------------------------
       🔒 PAYSTACK ERROR HANDLING
    ---------------------------------------------------*/

    if (!data.status) {
      console.error("Paystack Init Error:", data);

      return NextResponse.json(
        { error: "Paystack transaction initialization failed" },
        { status: 500 }
      );
    }

    /* --------------------------------------------------
       🔁 RETURN CHECKOUT URL
       Frontend will redirect user to this
    ---------------------------------------------------*/

    return NextResponse.json({
      url: data.data.authorization_url,
    });

  } catch (error: any) {
    console.error("Paystack Checkout Error:", error);

    return NextResponse.json(
      { error: error.message || "Paystack session failed" },
      { status: 500 }
    );
  }
}