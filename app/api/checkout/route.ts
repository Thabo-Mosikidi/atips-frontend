/**
 * PAYFAST CHECKOUT - FINAL LIVE VERSION (TV READY)
 * --------------------------------------------------
 * ✅ Strong validation
 * ✅ Rate limiting
 * ✅ Secure PayFast integration
 * ✅ Correct LIVE URL usage
 * ✅ Clean success + profile redirects
 * ✅ Stable signature generation
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

/* --------------------------------------------------
   ⚡ RATE LIMITING
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
   💰 LIMITS
---------------------------------------------------*/
const MIN_AMOUNT = 1000;   // R10
const MAX_AMOUNT = 500000; // R5000

/* --------------------------------------------------
   🔐 SIGNATURE GENERATOR (VERY IMPORTANT)
---------------------------------------------------*/
function generateSignature(data: Record<string, string>) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";

  const sorted = Object.keys(data)
    .filter((key) => data[key] !== "")
    .sort()
    .map(
      (key) =>
        `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`
    )
    .join("&");

  const stringToHash = passphrase
    ? `${sorted}&passphrase=${encodeURIComponent(passphrase)}`
    : sorted;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

/* --------------------------------------------------
   🚀 POST ROUTE
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

    const { actorId, actorName, amountCents } = body;

    /* ---------------- VALIDATION ---------------- */
    if (!actorId || !actorName || !amountCents) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const amountInt = Number(amountCents);

    if (!Number.isInteger(amountInt)) {
      return NextResponse.json(
        { error: "Invalid amount format" },
        { status: 400 }
      );
    }

    if (amountInt < MIN_AMOUNT) {
      return NextResponse.json(
        { error: "Minimum tip is R10" },
        { status: 400 }
      );
    }

    if (amountInt > MAX_AMOUNT) {
      return NextResponse.json(
        { error: "Maximum tip is R5000" },
        { status: 400 }
      );
    }

    if (typeof actorId !== "string" || actorId.length < 5) {
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

    /* ---------------- CLEAN DATA ---------------- */
    const amount = (amountInt / 100).toFixed(2);

    const reference = `${actorId}_${crypto.randomUUID().slice(0, 8)}`;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    /* --------------------------------------------------
       🔥 PAYFAST DATA (LIVE SAFE)
    ---------------------------------------------------*/
    const paymentData: Record<string, string> = {
      merchant_id: process.env.PAYFAST_MERCHANT_ID!,
      merchant_key: process.env.PAYFAST_MERCHANT_KEY!,

      return_url: `${baseUrl}/success?actorId=${actorId}&actorName=${encodeURIComponent(
        actorName
      )}&amount=${amount}`,

      cancel_url: `${baseUrl}/actors/${actorId}`,

      notify_url: `${baseUrl}/api/payfast/webhook`,

      name_first: "A.Tips User",
      //email_address: `fan_${Date.now()}@atips.co.za`,

      m_payment_id: reference,
      amount: amount,
      item_name: `Tip for ${actorName}`,
      item_description: `A.Tips payment for ${actorName}`,
    };

    /* ---------------- SIGNATURE ---------------- */
    const signature = generateSignature(paymentData);

    /* ---------------- FINAL URL ---------------- */
    const query = new URLSearchParams({
      ...paymentData,
      signature,
    }).toString();

    const payfastUrl = `https://www.payfast.co.za/eng/process?${query}`;

    return NextResponse.json({
      url: payfastUrl,
      reference,
    });

  } catch (error) {
    console.error("Checkout Error:", error);

    return NextResponse.json(
      { error: "Checkout failed" },
      { status: 500 }
    );
  }
}