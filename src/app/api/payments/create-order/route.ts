import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrder, isDemoMode } from "@/lib/payments/razorpay";
import { ADVANCE_RATE } from "@/lib/pricing";

export const runtime = "nodejs";

const schema = z.object({
  booking_ref: z.string().trim().min(3),
  mode: z.enum(["advance", "full"]),
});

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

  // RLS restricts this select to the caller's own bookings.
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, booking_ref, total, status, payment_status, contact_name, contact_email, contact_phone")
    .eq("booking_ref", parsed.data.booking_ref)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  if (booking.payment_status === "paid") {
    return NextResponse.json({ error: "This booking is already paid in full." }, { status: 409 });
  }

  if (booking.status === "cancelled") {
    return NextResponse.json({ error: "This booking was cancelled." }, { status: 409 });
  }

  // The amount is derived from the stored total, never from the request body.
  const total = Number(booking.total);
  const amount =
    parsed.data.mode === "advance" ? Math.round(total * ADVANCE_RATE) : Math.round(total);

  const order = await createOrder({
    amount,
    receipt: booking.booking_ref,
    notes: { booking_ref: booking.booking_ref, mode: parsed.data.mode },
  });

  // Payments are written with the service role so the amount can never be
  // forged from the browser (the table has no client INSERT policy).
  const admin = createAdminClient() ?? supabase;

  const { error } = await admin.from("payments").insert({
    booking_id: booking.id,
    user_id: user.id,
    provider: order.demo ? "demo" : "razorpay",
    provider_order_id: order.orderId,
    amount,
    currency: order.currency,
    status: "unpaid",
    method: parsed.data.mode,
  });

  if (error) {
    return NextResponse.json({ error: "Could not start the payment." }, { status: 500 });
  }

  return NextResponse.json({
    order_id: order.orderId,
    amount: order.amountPaise,
    currency: order.currency,
    key_id: order.keyId,
    demo: isDemoMode,
    prefill: {
      name: booking.contact_name,
      email: booking.contact_email,
      contact: booking.contact_phone,
    },
  });
}
