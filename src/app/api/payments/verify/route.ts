import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isDemoMode, verifySignature } from "@/lib/payments/razorpay";
import { settlePayment } from "@/lib/payments/settle";

export const runtime = "nodejs";

const schema = z.object({
  razorpay_order_id: z.string().trim().min(3),
  razorpay_payment_id: z.string().trim().min(3).optional(),
  razorpay_signature: z.string().trim().min(3).optional(),
});

/**
 * Called by the browser once Razorpay's checkout reports success. The webhook
 * is the authoritative path — this one exists so the customer sees their
 * booking confirmed immediately rather than waiting on the callback.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is required to settle payments." },
      { status: 503 },
    );
  }

  // Look the order up under the caller's own RLS first: that is what ties the
  // order id to this user, so one customer can never settle another's booking.
  const { data: payment } = await supabase
    .from("payments")
    .select("id, booking_id, amount, status")
    .eq("provider_order_id", razorpay_order_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!payment) {
    return NextResponse.json({ error: "Unknown order." }, { status: 404 });
  }

  if (isDemoMode) {
    // No signature exists to check — demo orders are minted by this server and
    // are only reachable when no Razorpay credentials are configured.
    const result = await settlePayment(admin, {
      paymentRowId: payment.id,
      providerPaymentId: razorpay_payment_id ?? `pay_demo_${payment.id.slice(0, 12)}`,
    });
    return NextResponse.json(result);
  }

  if (!razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ error: "Missing payment signature." }, { status: 400 });
  }

  const valid = verifySignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    await admin.from("payments").update({ status: "failed" }).eq("id", payment.id);
    return NextResponse.json({ error: "Signature check failed." }, { status: 400 });
  }

  const result = await settlePayment(admin, {
    paymentRowId: payment.id,
    providerPaymentId: razorpay_payment_id,
  });

  return NextResponse.json(result);
}
