/**
 * PAYFAST WEBHOOK - FINAL PRODUCTION (CLEAN REFERENCES)
 * --------------------------------------------------
 * ✅ RAW signature validation
 * ✅ Correct UUID extraction
 * ✅ Duplicate-safe
 * ✅ Saves system + human reference
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/* --------------------------------------------------
   HELPER: CLEAN ACTOR NAME
---------------------------------------------------*/
function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    /* ---------------- RAW BODY ---------------- */
    const raw = await req.text();

    /* ---------------- PARSE ---------------- */
    const params = new URLSearchParams(raw);

    const data: Record<string, string> = {};
    params.forEach((value, key) => {
      data[key] = value;
    });

    console.log("📩 PayFast Webhook:", data);

    /* ---------------- SIGNATURE ---------------- */
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    const cleaned = raw
      .split("&")
      .filter((item: string) => !item.startsWith("signature="))
      .join("&");

    const stringToHash = passphrase
      ? `${cleaned}&passphrase=${passphrase}`
      : cleaned;

    const calculatedSignature = crypto
      .createHash("md5")
      .update(stringToHash)
      .digest("hex");

    if (calculatedSignature !== data.signature) {
      console.error("❌ Invalid signature");

      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    /* ---------------- STATUS ---------------- */
    if (data.payment_status !== "COMPLETE") {
      return NextResponse.json({ received: true });
    }

    /* ---------------- EXTRACT ---------------- */
    const mPaymentId = data.m_payment_id || "";

    const actorId = mPaymentId
      .split("-")
      .slice(0, 5)
      .join("-");

    const payfastId = data.pf_payment_id;

    const actorName =
      data.item_name?.replace("Tip for ", "") || "actor";

    const amount = Math.round(
      Number(data.amount_gross || "0") * 100
    );

    if (!actorId || !payfastId) {
      return NextResponse.json(
        { error: "Missing data" },
        { status: 400 }
      );
    }

    /* ---------------- DUPLICATE CHECK ---------------- */
    const existing = await prisma.tip.findUnique({
      where: {
        paystackReference: payfastId,
      },
    });

    if (existing) {
      console.log("⚠️ Duplicate ignored:", payfastId);
      return NextResponse.json({ message: "Already processed" });
    }

    /* ---------------- GENERATE CLEAN REFERENCE ---------------- */
    const readableReference = `${slugify(actorName)}_atips_${payfastId}`;

    /* ---------------- SAVE ---------------- */
    await prisma.tip.create({
      data: {
        id: crypto.randomUUID(),
        actorId,
        amount,

        // 🔥 SYSTEM (UNIQUE)
        paystackReference: payfastId,

        // 🔥 HUMAN FRIENDLY (YOUR FORMAT)
        readableReference,

        currency: "ZAR",
        status: "success",
      },
    });

    console.log("✅ Saved:", readableReference);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("❌ Webhook Error:", error);

    return NextResponse.json(
      { error: "Webhook failed" },
      { status: 500 }
    );
  }
}