import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface PayPalWebhookEvent {
  event_type?: string;
  resource?: {
    id?: string; // Order ID or Capture ID
    status?: string;
    supplementary_data?: {
      related_ids?: {
        order_id?: string;
      };
    };
    amount?: {
      value?: string;
      currency_code?: string;
    };
  };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export async function POST(req: NextRequest): Promise<Response> {
  try {
    const body = (await req.json()) as PayPalWebhookEvent;
    console.log("📩 Received PayPal Webhook:", body.event_type, body.resource?.id);

    const eventType = body.event_type;
    const resource = body.resource;

    if (!eventType || !resource) {
      return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
    }

    // PayPal Client Setup
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_SECRET!;
    const isLive = process.env.PAYPAL_LIVE === "true";

    const PAYPAL_BASE = isLive
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    // Obtain access token to verify order status with PayPal directly (Fail-safe validation)
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
      console.error("❌ Failed to obtain PayPal token in webhook");
      return NextResponse.json({ error: "Internal Auth Error" }, { status: 500 });
    }

    // Extract PayPal Order ID
    let paypalOrderId = resource.id;
    if (eventType === "PAYMENT.CAPTURE.COMPLETED" && resource.supplementary_data?.related_ids?.order_id) {
      paypalOrderId = resource.supplementary_data.related_ids.order_id;
    }

    if (!paypalOrderId) {
      console.warn("⚠️ Webhook event missing Order ID");
      return NextResponse.json({ message: "No Order ID found" });
    }

    // Fetch transaction from our DB
    const transaction = await prisma.transaction.findUnique({
      where: { gatewayReference: paypalOrderId },
    });

    if (!transaction) {
      console.log("⚠️ Transaction not found in DB for Order:", paypalOrderId);
      return NextResponse.json({ message: "Transaction not found" });
    }

    // If transaction is already completed, do nothing
    if (transaction.status === "COMPLETED") {
      return NextResponse.json({ message: "Already processed" });
    }

    // Fetch PayPal Order status directly from PayPal API to verify webhook validity
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!orderRes.ok) {
      console.error("❌ Webhook fail-safe: Could not fetch order details from PayPal for ID:", paypalOrderId);
      return NextResponse.json({ error: "Gateway verification failed" }, { status: 500 });
    }

    const orderDetails = (await orderRes.json()) as {
      status?: string;
    };

    let paypalStatus = orderDetails.status;

    // Capture payment if APPROVED
    if (paypalStatus === "APPROVED") {
      const captureRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${paypalOrderId}/capture`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json",
        },
      });

      if (captureRes.ok) {
        paypalStatus = "COMPLETED";
      } else {
        console.error("❌ Webhook capture failed for Order ID:", paypalOrderId);
      }
    }

    // Process and record Tip split if COMPLETED
    if (paypalStatus === "COMPLETED") {
      const actor = await prisma.actor.findUnique({
        where: { id: transaction.actorId },
      });

      const actorName = actor ? actor.name : "actor";
      const readableReference = `${slugify(actorName)}_atips_${transaction.id.split("-")[0]}`;

      const grossAmount = transaction.amount;
      const actorAmount = Math.round(grossAmount * 0.8);
      const platformAmount = grossAmount - actorAmount;

      await prisma.$transaction(async (tx) => {
        // Check for duplicate tip entry
        const existingTip = await tx.tip.findUnique({
          where: { transactionId: transaction.id },
        });

        if (existingTip) return;

        // Update transaction status
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { status: "COMPLETED" },
        });

        // Save tip split
        await tx.tip.create({
          data: {
            id: crypto.randomUUID(),
            amount: grossAmount,
            actorAmount,
            platformAmount,
            currency: transaction.currency,
            status: "success",
            actorId: transaction.actorId,
            viewerId: transaction.viewerId,
            transactionId: transaction.id,
            readableReference,
          },
        });
      });

      console.log("✅ Webhook processed and saved tip for actor:", actorName);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Status is " + paypalStatus });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return NextResponse.json({ error: "Webhook execution failed" }, { status: 500 });
  }
}