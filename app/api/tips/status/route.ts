import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

interface StatusRequestBody {
  transactionId: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StatusRequestBody;
    const { transactionId } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 });
    }

    // 1. Fetch transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // 2. If already completed, return status
    if (transaction.status === "COMPLETED") {
      const tip = await prisma.tip.findUnique({
        where: { transactionId },
      });
      return NextResponse.json({ status: "COMPLETED", tip });
    }

    if (transaction.status === "FAILED" || transaction.status === "CANCELLED") {
      return NextResponse.json({ status: transaction.status });
    }

    // 3. Fetch status from PayPal
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const secret = process.env.PAYPAL_SECRET!;
    const isLive = process.env.PAYPAL_LIVE === "true";

    const PAYPAL_BASE = isLive
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

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
      return NextResponse.json({ error: "PayPal authentication failed" }, { status: 500 });
    }

    // Fetch PayPal order details
    const orderRes = await fetch(`${PAYPAL_BASE}/v2/checkout/orders/${transaction.gatewayReference}`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!orderRes.ok) {
      return NextResponse.json({ error: "Failed to retrieve order from PayPal" }, { status: 500 });
    }

    const orderDetails = (await orderRes.json()) as {
      status?: string;
    };

    let paypalStatus = orderDetails.status; // e.g. "APPROVED", "COMPLETED", "SAVED", "VOIDED"

    // 4. Capture Payment if status is APPROVED
    if (paypalStatus === "APPROVED") {
      const captureRes = await fetch(
        `${PAYPAL_BASE}/v2/checkout/orders/${transaction.gatewayReference}/capture`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (captureRes.ok) {
        paypalStatus = "COMPLETED";
      } else {
        const errData = await captureRes.json();
        console.error("❌ PayPal Capture Failed:", errData);
      }
    }

    // 5. Update DB if COMPLETED
    if (paypalStatus === "COMPLETED") {
      const actor = await prisma.actor.findUnique({
        where: { id: transaction.actorId },
      });

      const actorName = actor ? actor.name : "actor";
      const readableReference = `${slugify(actorName)}_atips_${transaction.id.split("-")[0]}`;

      const grossAmount = transaction.amount;
      const actorAmount = Math.round(grossAmount * 0.8);
      const platformAmount = grossAmount - actorAmount; // exactly 20% remainder

      // Run as a transaction to ensure integrity
      const result = await prisma.$transaction(async (tx) => {
        // Update transaction status
        const updatedTx = await tx.transaction.update({
          where: { id: transactionId },
          data: { status: "COMPLETED" },
        });

        // Create the Tip split record
        const tip = await tx.tip.create({
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

        return { updatedTx, tip };
      });

      return NextResponse.json({
        status: "COMPLETED",
        tip: result.tip,
      });
    }

    if (["VOIDED", "EXPIRED"].includes(paypalStatus || "")) {
      await prisma.transaction.update({
        where: { id: transactionId },
        data: { status: "FAILED" },
      });
      return NextResponse.json({ status: "FAILED" });
    }

    return NextResponse.json({ status: "PENDING" });
  } catch (error) {
    console.error("❌ Error updating transaction status:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
