import crypto from "node:crypto";

/**
 * Razorpay adapter.
 *
 * The gateway is isolated behind this module so it can be swapped (Stripe,
 * Cashfree, PayU) by reimplementing `createOrder` and `verifySignature`.
 *
 * When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are absent the adapter runs in
 * DEMO mode: orders are minted locally and settled instantly, so the whole
 * booking-to-confirmation flow is walkable without a merchant account. Set the
 * two keys and demo mode turns itself off.
 */

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID ?? "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET ?? "";
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET ?? "";

export const isDemoMode = !RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET;

export type CreatedOrder = {
  orderId: string;
  amountPaise: number;
  currency: string;
  keyId: string | null;
  demo: boolean;
};

export async function createOrder({
  amount,
  receipt,
  notes,
}: {
  amount: number; // rupees
  receipt: string;
  notes?: Record<string, string>;
}): Promise<CreatedOrder> {
  const amountPaise = Math.round(amount * 100);

  if (isDemoMode) {
    return {
      orderId: `order_demo_${crypto.randomBytes(9).toString("hex")}`,
      amountPaise,
      currency: "INR",
      keyId: null,
      demo: true,
    };
  }

  const { default: Razorpay } = await import("razorpay");
  const client = new Razorpay({ key_id: RAZORPAY_KEY_ID, key_secret: RAZORPAY_KEY_SECRET });

  const order = await client.orders.create({
    amount: amountPaise,
    currency: "INR",
    receipt,
    notes,
  });

  return {
    orderId: order.id,
    amountPaise,
    currency: "INR",
    keyId: RAZORPAY_KEY_ID,
    demo: false,
  };
}

/** HMAC-SHA256 over `order_id|payment_id`, per Razorpay's checkout docs. */
export function verifySignature({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  if (isDemoMode) return false;

  const expected = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return timingSafeEqual(expected, signature);
}

/** HMAC-SHA256 over the raw webhook body. */
export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!WEBHOOK_SECRET) return false;

  const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");
  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(a: string, b: string) {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}
