/**
 * app/api/checkout/route.ts
 *
 * FINAL TV-READY VERSION
 * --------------------------------------------------
 * - Strong validation (min + max)
 * - Strict numeric checks
 * - Safer reference generation
 * - Abuse protection
 * - Production-ready
 */

import { NextResponse } from "next/server";

/* --------------------------------------------------
   🔒 ENV CHECK
---------------------------------------------------*/
if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error("PAYSTACK_SECRET_KEY is not set");
}

/* --------------------------------------------------
   ⚡ RATE LIMITING (MVP SAFE)
---------------------------------------------------*/
const requestLog = new Map<string, { count: number; timestamp: number }>();

const MAX_REQUESTS = 100;
const WINDOW_MS = 60 * 1000;

function isRateLimited(ip: string) {
  const now = Date.now();
  const record = requestLog.get(ip);

  if (!record) {
    requestLog.set(ip, { count: 1, timestamp: now });
    return false;
  }

  if (now - record.timestamp > WINDOW_MS) {
    requestLog.set(ip, { count: 1, timestamp: now });
    return false;
  }

  record.count++;

  return record.count > MAX_REQUESTS;
}

/* --------------------------------------------------
   LIMITS (VERY IMPORTANT)
---------------------------------------------------*/
const MIN_AMOUNT = 1000;     // R10
const MAX_AMOUNT = 500000;   // R5,000

/* --------------------------------------------------
   POST ROUTE
---------------------------------------------------*/
export async function POST(req: Request) {
  try {

    /* ---------------- RATE LIMIT ---------------- */
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    /* ---------------- BODY ---------------- */
    const body = await req.json();

    const actorId = body.actorId;
    const actorName = body.actorName;
    const rawAmount = body.amountCents;

    /* ---------------- VALIDATION ---------------- */

    if (!actorId || !actorName || !rawAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* STRICT number validation */
    const amountCents = Number(rawAmount);

    if (!Number.isInteger(amountCents)) {
      return NextResponse.json(
        { error: "Invalid amount format" },
        { status: 400 }
      );
    }

    if (amountCents < MIN_AMOUNT) {
      return NextResponse.json(
        { error: "Minimum tip is R10" },
        { status: 400 }
      );
    }

    if (amountCents > MAX_AMOUNT) {
      return NextResponse.json(
        { error: "Maximum tip is R5000" },
        { status: 400 }
      );
    }

    /* Basic actorId validation */
    if (typeof actorId !== "string" || actorId.length < 10) {
      return NextResponse.json(
        { error: "Invalid actor ID" },
        { status: 400 }
      );
    }

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      return NextResponse.json(
        { error: "Base URL missing" },
        { status: 500 }
      );
    }

    /* ---------------- REFERENCE ---------------- */

    const safeActorName = actorName
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

    const reference = `${safeActorName}_atips_${crypto.randomUUID().slice(0, 8)}`;

    /* ---------------- TIMEOUT ---------------- */

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);

    /* ---------------- PAYSTACK ---------------- */

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
          email: `fan_${Date.now()}@atips.co.za`, // ✅ dynamic email

          amount: amountCents,
          currency: "ZAR",
          reference,

          metadata: {
            actorId,
            actorName,
          },

          description: `Tip for ${actorName}`,

          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?actorId=${actorId}&actorName=${encodeURIComponent(actorName)}&amount=${amountCents / 100}`,
        }),
      }
    );

    const data = await response.json();

    if (!data.status) {
      console.error("Paystack Error:", data);
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      url: data.data.authorization_url,
      reference,
    });

  } catch (error: any) {
    console.error("Checkout Error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}