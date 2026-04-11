/**
 * PAYFAST WEBHOOK - TV READY & SECURE
 * --------------------------------------------------
 * - Handles PayFast notifications
 * - Verifies signature
 * - Prevents duplicates
 * - Stores tips safely
 */

import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/* --------------------------------------------------
   SIGNATURE VALIDATION
---------------------------------------------------*/
function generateSignature(data: Record<string, string>) {
  const passphrase = process.env.PAYFAST_PASSPHRASE || "";

  const sorted = Object.keys(data)
    .filter((key) => key !== "signature")
    .sort()
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, "+")}`)
    .join("&");

  const stringToHash = passphrase
    ? `${sorted}&passphrase=${encodeURIComponent(passphrase)}`
    : sorted;

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

/* --------------------------------------------------
   POST
---------------------------------------------------*/
export async function POST(req: Request) {
  try {
    /* ---------------- RAW BODY ---------------- */
    const raw = await req.text();

    const params = new URLSearchParams(raw);

    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    /* ---------------- VERIFY SIGNATURE ---------------- */
    const receivedSignature = data.signature;
    const calculatedSignature = generateSignature(data);

    if (receivedSignature !== calculatedSignature) {
      console.error("Invalid PayFast signature");

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    /* ---------------- PAYMENT STATUS ---------------- */
    if (data.payment_status !== "COMPLETE") {
      return NextResponse.json({ received: true });
    }

    /* ---------------- DATA EXTRACTION ---------------- */
    const actorId = data.m_payment_id; // we stored actorId here
    const amount = Math.round(Number(data.amount_gross) * 100); // convert to cents
    const reference = data.pf_payment_id;

    if (!actorId) {
      return NextResponse.json(
        { error: "Missing actorId" },
        { status: 400 }
      );
    }

    /* ---------------- DUPLICATE PROTECTION ---------------- */
    const existing = await prisma.tip.findUnique({
      where: {
        paystackReference: reference, // reuse column (rename later if needed)
      },
    });

    if (existing) {
      return NextResponse.json({
        message: "Already processed",
      });
    }

    /* ---------------- STORE TIP ---------------- */
    await prisma.tip.create({
      data: {
        id: crypto.randomUUID(),
        actorId,
        amount,
        paystackReference: reference, // OK to reuse for now
      },
    });

    console.log("✅ PayFast tip recorded:", reference);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook Error:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}