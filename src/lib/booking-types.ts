import type { Booking, BookingService, Package, Payment } from "@/lib/database.types";

/**
 * Lives apart from `lib/bookings.ts` because client components need the shape
 * and the helper below, and that module pulls in `next/headers`.
 */
export type BookingDetail = Booking & {
  package: Pick<Package, "id" | "name" | "slug" | "hero_image_url"> | null;
  booking_services: BookingService[];
  payments: Payment[];
};

/** Rupees captured so far against a booking. */
export function amountCollected(booking: Pick<BookingDetail, "payments">) {
  return booking.payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);
}
