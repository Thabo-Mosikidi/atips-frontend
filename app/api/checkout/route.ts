/**
 * PayFast Checkout API (FINAL - PRODUCTION READY)
 * ---------------------------------------------------
 * ✅ Live / Sandbox switching
 * ✅ Correct signature generation
 * ✅ Passphrase support
 * ✅ Clean redirect handling
 * ✅ Debug logs included
 */

import { NextResponse } from "next/server";
import crypto from "crypto";

/* --------------------------------------------------
   PAYFAST ENCODE (IMPORTANT)
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
    const passphrase = process.env.PAYFAST_PASSPHRASE || "";

    const isLive = process.env.PAYFAST_LIVE === "true";

    /* ---------------- PAYMENT ID ---------------- */
    const m_payment_id = `${actorId}-${Date.now()}`;

    /* ---------------- REDIRECT URLs ---------------- */

    const return_url = `${baseUrl}/success?actorId=${encodeURIComponent(
      actorId
    )}&actorName=${encodeURIComponent(actorName)}&amount=${encodeURIComponent(
      String(amount)
    )}`;

    const cancel_url = source
      ? `${baseUrl}${source}`
      : `${baseUrl}/`;

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

    const signatureBase = passphrase
      ? `${query}&passphrase=${encodePF(passphrase)}`
      : query;

    const signature = crypto
      .createHash("md5")
      .update(signatureBase)
      .digest("hex");

    /* ---------------- PAYFAST URL ---------------- */
    const PAYFAST_URL = isLive
      ? "https://www.payfast.co.za/eng/process"
      : "https://sandbox.payfast.co.za/eng/process";

    /* ---------------- DEBUG LOGS ---------------- */
    console.log("🚀 PAYFAST MODE:", isLive ? "LIVE" : "SANDBOX");
    console.log("🔗 PAYFAST URL:", PAYFAST_URL);

    /* ---------------- FINAL REDIRECT ---------------- */
    const redirectUrl = `${PAYFAST_URL}?${query}&signature=${signature}`;

    return NextResponse.json({ url: redirectUrl });

  } catch (error) {
    console.error("❌ Checkout error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}