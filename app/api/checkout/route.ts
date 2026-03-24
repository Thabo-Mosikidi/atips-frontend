/**
 * app/api/checkout/route.ts
 *
 * Purpose:
 * Safely initialize a Paystack payment session.
 *
 * Improvements included:
 * - Server side validation
 * - Unique transaction reference
 * - Timeout protection
 * - Basic rate limiting
 * - Improved error handling
 */

import { NextResponse } from "next/server";

/* --------------------------------------------------
   🔒 Ensure Paystack key exists when server starts
---------------------------------------------------*/
if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set in environment variables");
}

/* --------------------------------------------------
   ⚡ SIMPLE RATE LIMITING (MVP SAFE VERSION)

   Prevents abuse such as bots spamming checkout.
   This stores IP request counts temporarily.

   NOTE:
   This works fine for MVP. In production at scale,
   a Redis based limiter would be better.
---------------------------------------------------*/

const requestLog = new Map<string, { count: number; timestamp: number }>();

const MAX_REQUESTS = 100; // requests
const WINDOW_MS = 60 * 1000; // per 60 seconds

function isRateLimited(ip: string) {
  const now = Date.now();

  const record = requestLog.get(ip);

  if (!record) {
    requestLog.set(ip, { count: 1, timestamp: now });
    return false;
  }

  // Reset window if expired
  if (now - record.timestamp > WINDOW_MS) {
    requestLog.set(ip, { count: 1, timestamp: now });
    return false;
  }

  record.count++;

  if (record.count > MAX_REQUESTS) {
    return true;
  }

  return false;
}

/* --------------------------------------------------
   POST ROUTE
---------------------------------------------------*/

export async function POST(req: Request) {
  try {

    /* --------------------------------------------------
       📡 RATE LIMIT CHECK
    ---------------------------------------------------*/

    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        { status: 429 }
      );
    }

    /* --------------------------------------------------
       📥 READ BODY DATA
    ---------------------------------------------------*/

    const body = await req.json();

    const actorId = body.actorId;
    const actorName = body.actorName;
    const amountCents = Number(body.amountCents);

    /* --------------------------------------------------
       🔒 VALIDATE INPUT
    ---------------------------------------------------*/

    if (!actorId || !actorName || !amountCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Minimum tip = R10
    if (amountCents < 1000) {
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
       🔑 CREATE OUR OWN UNIQUE TRANSACTION REFERENCE

       Why?
       - prevents duplicate transactions
       - easier database tracking
       - more control over transactions
    ---------------------------------------------------*/

    
    /**
 * Create a human readable reference
 * Example:
 * nomzamo_mbatha_atips_4f2e7c8d
 */

const safeActorName = actorName
  .toLowerCase()
  .replace(/\s+/g, "_")
  .replace(/[^a-z0-9_]/g, "");

const reference = `${safeActorName}_atips_${crypto.randomUUID().slice(0,8)}`;

    /* --------------------------------------------------
       ⏱ TIMEOUT PROTECTION

       Prevents the server from hanging if Paystack
       takes too long to respond.
    ---------------------------------------------------*/

    const controller = new AbortController();

    setTimeout(() => controller.abort(), 8000); // 8 second timeout

    /* --------------------------------------------------
       💳 INITIALIZE PAYSTACK TRANSACTION
    ---------------------------------------------------*/

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        signal: controller.signal,

        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({

          /* Paystack requires an email */
          email: "fan@atips.co.za",

          /* Amount in cents */
          amount: amountCents,

          currency: "ZAR",

          /* Our custom reference */
          reference: reference,

          /* Metadata used by webhook later */
          metadata: {
            actorId,
            actorName,
          },

          description: `Tip for ${actorName}`,

          callback_url:
            `${process.env.NEXT_PUBLIC_BASE_URL}/success?actorId=${actorId}&actorName=${encodeURIComponent(actorName)}&amount=${amountCents / 100}`,

        }),
      }
    );

    const data = await response.json();

    /* --------------------------------------------------
       🔒 HANDLE PAYSTACK FAILURE
    ---------------------------------------------------*/

    if (!data.status) {

      console.error("Paystack Init Error:", data);

      return NextResponse.json(
        { error: "Paystack transaction initialization failed" },
        { status: 500 }
      );
    }

    /* --------------------------------------------------
       🔁 RETURN PAYMENT URL TO FRONTEND
    ---------------------------------------------------*/

    return NextResponse.json({
      url: data.data.authorization_url,
      reference: reference,
    });

  } catch (error: any) {

    console.error("Checkout Error:", error);

    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 500 }
    );
  }
}