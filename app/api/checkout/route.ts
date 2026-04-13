/**
 * PayFast Checkout API (FINAL - STABLE + SUCCESS FIX)
 * ---------------------------------------------------
 * ✅ No signature mismatch
 * ✅ Passes actorName + amount to success page
 * ✅ Keeps cancel returning correctly
 * ✅ Works with existing UI (no styling changes)
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

/* --------------------------------------------------
   PAYFAST ENCODE
---------------------------------------------------*/
function encodePF(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { actorId, actorName, amount, source } = body;

    /* ---------------- VALIDATION ---------------- */
    if (!actorId || !actorName || !amount) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    if (Number(amount) < 10) {
      return NextResponse.json(
        { error: "Minimum tip is R10" },
        { status: 400 }
      );
    }

    /* ---------------- ENV ---------------- */
    const merchant_id = process.env.PAYFAST_MERCHANT_ID!;
    const merchant_key = process.env.PAYFAST_MERCHANT_KEY!;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    /* 🔥 DO NOT CHANGE STRUCTURE */
    const m_payment_id = `${actorId}-${Date.now()}`;

    /* ---------------- REDIRECTS ---------------- */

    // ✅ SUCCESS PAGE (SAFE QUERY PARAMS)
    const return_url = `${baseUrl}/success?actorId=${encodeURIComponent(
      actorId
    )}&actorName=${encodeURIComponent(actorName)}&amount=${encodeURIComponent(
      String(amount)
    )}`;

    // ✅ CANCEL RETURNS TO ORIGINAL PAGE
    const cancel_url = source
      ? `${baseUrl}${source}`
      : `${baseUrl}/`;

    // ✅ WEBHOOK
    const notify_url = `${baseUrl}/api/webhooks/payfast`;

    /* ---------------- PAYMENT DATA ---------------- */
    const paymentData: Record<string, string> = {
      merchant_id,
      merchant_key,
      return_url,
      cancel_url,
      notify_url,
      name_first: "Supporter",
      name_last: "User",
      email_address: "test@atips.co.za",
      m_payment_id,
      amount: Number(amount).toFixed(2),
      item_name: `Tip for ${actorName.trim()}`,
    };

    /* ---------------- SIGNATURE ---------------- */
    const sortedKeys = Object.keys(paymentData).sort();

    const query = sortedKeys
      .map((key) => `${key}=${encodePF(paymentData[key])}`)
      .join("&");

    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    const signatureBase = passphrase
      ? `${query}&passphrase=${encodePF(passphrase)}`
      : query;

    const signature = crypto
      .createHash("md5")
      .update(signatureBase)
      .digest("hex");

    /* ---------------- PAYFAST URL ---------------- */
    const url =
      process.env.PAYFAST_LIVE === "true"
        ? "https://www.payfast.co.za/eng/process"
        : "https://sandbox.payfast.co.za/eng/process";

    const redirectUrl = `${url}?${query}&signature=${signature}`;

    return NextResponse.json({ url: redirectUrl });

  } catch (error) {
    console.error("Checkout error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}