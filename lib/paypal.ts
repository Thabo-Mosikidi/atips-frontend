/**
 * lib/paypal.ts
 * Shared PayPal REST helpers used by every payment surface — tips, Tier 2
 * bookings, and promotional boosts — so they all run through one identical,
 * verified gateway pipeline (charge-in-full / capture flow).
 */

const RATE_ZAR_PER_USD = 18; // keep in sync with the tip flow's conversion

export function convertZarToUsd(amountZar: number): string {
  return (amountZar / RATE_ZAR_PER_USD).toFixed(2);
}

export function paypalBase(): string {
  return process.env.PAYPAL_LIVE === "true"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

/** Fetch an OAuth2 access token. Throws if PayPal auth fails. */
export async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_SECRET!;
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");

  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) {
    console.error("❌ PayPal token error:", data);
    throw new Error("PayPal authentication failed");
  }
  return data.access_token;
}

interface CreateOrderArgs {
  amountZar: number;
  referenceId: string; // our Transaction id
  description: string;
  returnUrl: string;
  cancelUrl: string;
}

/**
 * Create a CAPTURE-intent order. Returns the PayPal order id and the
 * approval URL the buyer is redirected to.
 */
export async function createOrder(
  accessToken: string,
  { amountZar, referenceId, description, returnUrl, cancelUrl }: CreateOrderArgs
): Promise<{ orderId: string; approvalUrl: string }> {
  const res = await fetch(`${paypalBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: referenceId,
          description,
          amount: { currency_code: "USD", value: convertZarToUsd(amountZar) },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: "PAY_NOW",
      },
    }),
  });

  const data = (await res.json()) as {
    id?: string;
    links?: Array<{ rel?: string; href?: string }>;
  };
  const approvalUrl = data.links?.find((l) => l.rel === "approve")?.href;
  if (!data.id || !approvalUrl) {
    console.error("❌ PayPal order error:", data);
    throw new Error("Could not create payment session");
  }
  return { orderId: data.id, approvalUrl };
}

/** Retrieve an order's current status from PayPal. */
export async function getOrderStatus(
  accessToken: string,
  orderId: string
): Promise<string | undefined> {
  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { status?: string };
  return data.status;
}

/** Capture an APPROVED order. Returns true on success. */
export async function captureOrder(
  accessToken: string,
  orderId: string
): Promise<boolean> {
  const res = await fetch(
    `${paypalBase()}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (!res.ok) {
    console.error("❌ PayPal capture failed:", await res.json().catch(() => ({})));
    return false;
  }
  return true;
}

/** 80% actor / 20% platform split, matching the tip flow. */
export function splitAmount(grossCents: number): {
  actorAmount: number;
  platformAmount: number;
} {
  const actorAmount = Math.round(grossCents * 0.8);
  return { actorAmount, platformAmount: grossCents - actorAmount };
}
