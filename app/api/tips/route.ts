import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface CreateTipBody {
  actorId: string;
  amount: number; // In ZAR
  sessionToken?: string;
  showId?: string;
  episodeId?: string;
  qrCodeId?: string;
  source?: string;
}

function convertZarToUsd(amount: number) {
  const rate = 18; // ZAR to USD rate
  return (amount / rate).toFixed(2);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateTipBody;
    const { actorId, amount, sessionToken, showId, episodeId, qrCodeId, source } = body;

    // 1. Validation
    if (!actorId || !amount) {
      return NextResponse.json({ error: "Actor ID and amount are required" }, { status: 400 });
    }

    if (amount < 10) {
      return NextResponse.json({ error: "Minimum tip is R10" }, { status: 400 });
    }

    // Verify actor exists
    const actor = await prisma.actor.findUnique({
      where: { id: actorId },
    });

    if (!actor) {
      return NextResponse.json({ error: "Actor not found" }, { status: 404 });
    }

    // 2. Fetch or create viewer session
    let viewerId: string | undefined;
    if (sessionToken) {
      let viewer = await prisma.viewer.findUnique({
        where: { sessionToken },
      });

      if (!viewer) {
        viewer = await prisma.viewer.create({
          data: {
            sessionToken,
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
            userAgent: req.headers.get("user-agent") || undefined,
          },
        });
      }
      viewerId = viewer.id;
    }

    // 3. PayPal Setup
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_SECRET!;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const isLive = process.env.PAYPAL_LIVE === "true";

    const PAYPAL_BASE = isLive
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Obtain access token
    const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
    const tokenRes = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = (await tokenRes.json()) as { access_token?: string };

    if (!tokenData.access_token) {
      console.error("❌ PayPal Token Error:", tokenData);
      return NextResponse.json({ error: "Payment gateway authentication failed" }, { status: 500 });
    }

    // Prepare PayPal Order
    const usdAmount = convertZarToUsd(amount);

    // Save temporary transaction row to generate reference
    const transactionId = crypto.randomUUID();
    const returnUrl = `${baseUrl}/success?actorId=${encodeURIComponent(
      actorId
    )}&actorName=${encodeURIComponent(actor.name)}&amount=${encodeURIComponent(
      String(amount)
    )}&transactionId=${transactionId}`;

    const cancelUrl = source
      ? `${baseUrl}${source}`
      : `${baseUrl}/actors/${actorId}`;

    // Create PayPal order via API
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
            reference_id: transactionId,
            description: `Tip for ${actor.name}`,
            amount: {
              currency_code: "USD",
              value: usdAmount,
            },
          },
        ],
        application_context: {
          return_url: returnUrl,
          cancel_url: cancelUrl,
          user_action: "PAY_NOW",
        },
      }),
    });

    const orderData = (await orderRes.json()) as {
      id?: string;
      links?: Array<{ rel?: string; href?: string }>;
    };

    const approvalUrl = orderData.links?.find((link) => link.rel === "approve")?.href;
    const paypalOrderId = orderData.id;

    if (!approvalUrl || !paypalOrderId) {
      console.error("❌ PayPal Order Error:", orderData);
      return NextResponse.json({ error: "Could not create payment session" }, { status: 500 });
    }

    // 4. Save Transaction in Database
    // Note: Database stores ZAR amount in Cents (e.g. R25 = 2500 cents)
    await prisma.transaction.create({
      data: {
        id: transactionId,
        amount: Math.round(amount * 100),
        currency: "ZAR",
        gateway: "PAYPAL",
        gatewayReference: paypalOrderId,
        status: "PENDING",
        viewerId,
        actorId,
        showId,
        episodeId,
        qrCodeId,
      },
    });

    return NextResponse.json({
      url: approvalUrl,
      transactionId,
      gatewayReference: paypalOrderId,
    });
  } catch (error) {
    console.error("❌ Tip creation error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
