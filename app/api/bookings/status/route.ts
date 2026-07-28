import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessToken, getOrderStatus, captureOrder } from "@/lib/paypal";

interface StatusBody {
  bookingId?: string;
  transactionId?: string;
}

function slugify(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

/**
 * POST /api/bookings/status  { bookingId | transactionId }
 * Verifies + captures the PayPal order for a booking, then confirms it:
 * marks the Transaction COMPLETED, the Booking CONFIRMED, and locks the
 * chosen availability slot. Idempotent — safe to call repeatedly and
 * alongside the webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const { bookingId, transactionId } = (await req.json()) as StatusBody;
    if (!bookingId && !transactionId) {
      return NextResponse.json(
        { error: "bookingId or transactionId is required" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findFirst({
      where: bookingId ? { id: bookingId } : { transactionId },
      include: { transaction: true, actor: { select: { name: true } } },
    });
    if (!booking || !booking.transaction) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Terminal states — return as-is.
    if (booking.status === "CONFIRMED" || booking.status === "COMPLETED") {
      return NextResponse.json({ status: booking.status, booking });
    }
    if (booking.status === "CANCELLED" || booking.status === "REFUNDED") {
      return NextResponse.json({ status: booking.status });
    }

    // Verify with PayPal, capturing if the buyer has approved.
    const accessToken = await getAccessToken();
    let payStatus = await getOrderStatus(accessToken, booking.transaction.gatewayReference);
    if (payStatus === "APPROVED") {
      if (await captureOrder(accessToken, booking.transaction.gatewayReference)) {
        payStatus = "COMPLETED";
      }
    }

    if (payStatus === "COMPLETED") {
      const readableReference = `${slugify(booking.actor.name)}_booking_${booking.id.split("-")[0]}`;

      const confirmed = await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: booking.transactionId! },
          data: { status: "COMPLETED" },
        });
        if (booking.slotId) {
          await tx.availabilitySlot.update({
            where: { id: booking.slotId },
            data: { isBooked: true },
          });
        }
        return tx.booking.update({
          where: { id: booking.id },
          data: { status: "CONFIRMED", readableReference },
        });
      });

      return NextResponse.json({ status: "CONFIRMED", booking: confirmed });
    }

    if (["VOIDED", "EXPIRED"].includes(payStatus || "")) {
      await prisma.$transaction([
        prisma.transaction.update({
          where: { id: booking.transactionId! },
          data: { status: "FAILED" },
        }),
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: "CANCELLED" },
        }),
      ]);
      return NextResponse.json({ status: "CANCELLED" });
    }

    return NextResponse.json({ status: "PENDING_PAYMENT" });
  } catch (error) {
    console.error("❌ Booking status error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
