import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAccessToken, createOrder, splitAmount } from "@/lib/paypal";
import crypto from "crypto";

interface CreateBookingBody {
  serviceId: string;
  slotId?: string; // optional pre-defined availability slot
  scheduledAt?: string; // ISO; required if no slotId
  sessionToken?: string; // anonymous viewer session (no login)
  contactName?: string;
  contactEmail?: string;
  source?: string; // path to return to on cancel
}

/**
 * POST /api/bookings
 * Creates a Tier 2 booking and a PENDING Transaction, then opens a PayPal
 * order charged in full at booking time. Returns the approval URL; the
 * booking is confirmed on capture in /api/bookings/status (or via webhook).
 *
 * This is the connective tissue between Tier 2 Access (#1) and the booking
 * system (#6): a Service + a time slot + payment = a Booking.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBookingBody;
    const {
      serviceId,
      slotId,
      scheduledAt,
      sessionToken,
      contactName,
      contactEmail,
      source,
    } = body;

    // 1. Validation
    if (!serviceId) {
      return NextResponse.json({ error: "serviceId is required" }, { status: 400 });
    }
    if (!slotId && !scheduledAt) {
      return NextResponse.json(
        { error: "A slotId or scheduledAt time is required" },
        { status: 400 }
      );
    }
    if (!contactEmail) {
      return NextResponse.json(
        { error: "A contact email is required so the actor can reach you" },
        { status: 400 }
      );
    }

    // 2. Load the service (source of truth for price + actor)
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { actor: { select: { id: true, name: true } } },
    });
    if (!service || !service.isActive) {
      return NextResponse.json(
        { error: "Service not found or unavailable" },
        { status: 404 }
      );
    }

    // 3. Resolve the slot / scheduled time
    let resolvedSlotId: string | undefined;
    let resolvedTime: Date;
    if (slotId) {
      const slot = await prisma.availabilitySlot.findUnique({ where: { id: slotId } });
      if (!slot || slot.actorId !== service.actorId) {
        return NextResponse.json({ error: "Invalid slot" }, { status: 400 });
      }
      if (slot.isBooked) {
        return NextResponse.json(
          { error: "That slot is no longer available" },
          { status: 409 }
        );
      }
      resolvedSlotId = slot.id;
      resolvedTime = slot.startTime;
    } else {
      resolvedTime = new Date(scheduledAt!);
      if (isNaN(resolvedTime.getTime()) || resolvedTime.getTime() <= Date.now()) {
        return NextResponse.json(
          { error: "scheduledAt must be a valid future time" },
          { status: 400 }
        );
      }
    }

    // 4. Anonymous, session-based viewer (no login) — same model as tips.
    let viewerId: string | undefined;
    if (sessionToken) {
      const viewer =
        (await prisma.viewer.findUnique({ where: { sessionToken } })) ??
        (await prisma.viewer.create({
          data: {
            sessionToken,
            ipAddress: req.headers.get("x-forwarded-for") || undefined,
            userAgent: req.headers.get("user-agent") || undefined,
          },
        }));
      viewerId = viewer.id;
    }

    // 5. Payment (reuse shared PayPal pipeline — charge in full now)
    const amountZar = service.price / 100;
    const grossCents = service.price;
    const { actorAmount, platformAmount } = splitAmount(grossCents);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const transactionId = crypto.randomUUID();
    const bookingId = crypto.randomUUID();

    const accessToken = await getAccessToken();
    const returnUrl =
      `${baseUrl}/success?type=booking&bookingId=${bookingId}` +
      `&transactionId=${transactionId}` +
      `&actorId=${encodeURIComponent(service.actorId)}` +
      `&actorName=${encodeURIComponent(service.actor.name)}` +
      `&amount=${encodeURIComponent(String(amountZar))}`;
    const cancelUrl = source ? `${baseUrl}${source}` : `${baseUrl}/actors/${service.actorId}`;

    const { orderId, approvalUrl } = await createOrder(accessToken, {
      amountZar,
      referenceId: transactionId,
      description: `${service.title} with ${service.actor.name}`,
      returnUrl,
      cancelUrl,
    });

    // 6. Persist Transaction + Booking (PENDING). Slot is only locked on
    //    capture to avoid holding it for abandoned checkouts.
    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          id: transactionId,
          amount: grossCents,
          currency: "ZAR",
          gateway: "PAYPAL",
          gatewayReference: orderId,
          status: "PENDING",
          type: "BOOKING",
          viewerId,
          actorId: service.actorId,
        },
      }),
      prisma.booking.create({
        data: {
          id: bookingId,
          serviceId: service.id,
          actorId: service.actorId,
          viewerId,
          slotId: resolvedSlotId,
          scheduledAt: resolvedTime,
          status: "PENDING_PAYMENT",
          amount: grossCents,
          actorAmount,
          platformAmount,
          currency: "ZAR",
          contactName,
          contactEmail,
          transactionId,
        },
      }),
    ]);

    return NextResponse.json({ url: approvalUrl, bookingId, transactionId });
  } catch (error) {
    console.error("❌ Booking creation error:", error);
    const message =
      error instanceof Error && error.message ? error.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
