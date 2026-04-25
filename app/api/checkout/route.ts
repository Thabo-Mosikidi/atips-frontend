/**
 * PAYPAL CHECKOUT API (DROP-IN REPLACEMENT)
 * ---------------------------------------------------
 * ✅ Same route: /api/checkout
 * ✅ Same response: { url }
 * ✅ No UI changes required
 * ✅ ZAR → USD conversion
 */

import { NextResponse } from "next/server";

/* ---------------- ZAR → USD ---------------- */
function convertZarToUsd(amount: number) {
  const rate = 18; // keep your existing rate
  return (amount / rate).toFixed(2);
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
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_SECRET!;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL!;

    const isLive = process.env.PAYPAL_LIVE === "true";

    const PAYPAL_BASE = isLive
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    /* ---------------- GET ACCESS TOKEN ---------------- */
    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

    const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      console.error("❌ PayPal Token Error:", tokenData);
      return NextResponse.json(
        { error: "PayPal auth failed" },
        { status: 500 }
      );
    }

    /* ---------------- ORDER ---------------- */
    const usdAmount = convertZarToUsd(Number(amount));

    const return_url = `${baseUrl}/success?actorId=${encodeURIComponent(
      actorId
    )}&actorName=${encodeURIComponent(actorName)}&amount=${encodeURIComponent(
      String(amount)
    )}`;

    const cancel_url = source
      ? `${baseUrl}${source}`
      : `${baseUrl}/`;

    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: actorId,
            description: `Tip for ${actorName}`,
            amount: {
              currency_code: "USD",
              value: usdAmount,
            },
          },
        ],
        application_context: {
          return_url,
          cancel_url,
          user_action: "PAY_NOW",
        },
      }),
    });

    const orderData = await orderRes.json();

    const approvalUrl = orderData.links?.find(
      (link: any) => link.rel === "approve"
    )?.href;

    if (!approvalUrl) {
      console.error("❌ PayPal Order Error:", orderData);
      return NextResponse.json(
        { error: "No approval URL" },
        { status: 500 }
      );
    }

    /* ---------------- DEBUG ---------------- */
    console.log("🚀 PAYPAL MODE:", isLive ? "LIVE" : "SANDBOX");
    console.log("💰 USD:", usdAmount);

    /* ---------------- RETURN SAME FORMAT ---------------- */
    return NextResponse.json({ url: approvalUrl });

  } catch (error) {
    console.error("❌ Checkout error:", error);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}