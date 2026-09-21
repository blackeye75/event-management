import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyWebhookSignature } from "@/lib/payments/razorpay";
import { settlePayment } from "@/lib/payments/settle";

export const runtime = "nodejs";

/**
 * Razorpay webhook — the authoritative record of a capture, since the browser
 * can always be closed before the callback fires.
 *
 * Point your Razorpay dashboard at POST /api/payments/webhook for the
 * `payment.captured` and `payment.failed` events, and set
 * RAZORPAY_WEBHOOK_SECRET to the secret you chose there.
 */
export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const rawBody = await request.text();

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service role key missing." }, { status: 503 });
  }

  let event: {
    event?: string;
    payload?: { payment?: { entity?: { id?: string; order_id?: string; method?: string } } };
  };

  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed body." }, { status: 400 });
  }

  const entity = event.payload?.payment?.entity;
  if (!entity?.order_id) {
    return NextResponse.json({ received: true });
  }

  const { data: payment } = await admin
    .from("payments")
    .select("id")
    .eq("provider_order_id", entity.order_id)
    .maybeSingle();

  if (!payment) {
    // An order this deployment does not know about — acknowledge so Razorpay
    // stops retrying.
    return NextResponse.json({ received: true });
  }

  if (event.event === "payment.failed") {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return NextResponse.json({ received: true });
  }

  if (event.event === "payment.captured") {
    await admin.from("payments").update({ method: entity.method ?? null }).eq("id", payment.id);
    await settlePayment(admin, {
      paymentRowId: payment.id,
      providerPaymentId: entity.id ?? "",
    });
  }

  return NextResponse.json({ received: true });
}
