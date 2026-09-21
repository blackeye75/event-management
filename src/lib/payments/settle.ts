import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, PaymentStatus } from "@/lib/database.types";

type Admin = SupabaseClient<Database>;

/**
 * Marks a payment captured and rolls the booking forward.
 *
 * Idempotent: both the browser callback and the Razorpay webhook run this, and
 * whichever arrives second sees the row is already `paid` and only recomputes
 * the booking totals.
 */
export async function settlePayment(
  admin: Admin,
  { paymentRowId, providerPaymentId }: { paymentRowId: string; providerPaymentId: string },
) {
  const { data: payment } = await admin
    .from("payments")
    .select("id, booking_id, amount, status")
    .eq("id", paymentRowId)
    .maybeSingle();

  if (!payment) return { ok: false as const, error: "Unknown payment." };

  if (payment.status !== "paid") {
    await admin
      .from("payments")
      .update({ status: "paid", provider_payment_id: providerPaymentId })
      .eq("id", payment.id);
  }

  return refreshBookingPaymentState(admin, payment.booking_id);
}

/** Recomputes a booking's payment_status from the sum of its captured payments. */
export async function refreshBookingPaymentState(admin: Admin, bookingId: string) {
  const [{ data: booking }, { data: paid }] = await Promise.all([
    admin.from("bookings").select("id, booking_ref, total, status").eq("id", bookingId).maybeSingle(),
    admin.from("payments").select("amount").eq("booking_id", bookingId).eq("status", "paid"),
  ]);

  if (!booking) return { ok: false as const, error: "Unknown booking." };

  const collected = (paid ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const total = Number(booking.total);

  // A rupee of slack absorbs rounding on the 25% advance.
  const paymentStatus: PaymentStatus =
    collected <= 0 ? "unpaid" : collected + 1 >= total ? "paid" : "partial";

  await admin
    .from("bookings")
    .update({
      payment_status: paymentStatus,
      // Any money received moves a pending booking to confirmed; we never
      // downgrade a booking an admin has already moved further along.
      status: booking.status === "pending" && collected > 0 ? "confirmed" : booking.status,
    })
    .eq("id", booking.id);

  return {
    ok: true as const,
    booking_ref: booking.booking_ref,
    collected,
    total,
    payment_status: paymentStatus,
  };
}
