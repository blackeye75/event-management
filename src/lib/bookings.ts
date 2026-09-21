import { createClient } from "@/lib/supabase/server";
import type { BookingDetail } from "@/lib/booking-types";

export { amountCollected } from "@/lib/booking-types";
export type { BookingDetail } from "@/lib/booking-types";

const DETAIL_SELECT =
  "*, package:packages(id, name, slug, hero_image_url), booking_services(*), payments(*)";

/** One booking with everything the checkout and account pages need. */
export async function getBookingByRef(ref: string): Promise<BookingDetail | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("booking_ref", ref)
    .maybeSingle();

  return (data as unknown as BookingDetail | null) ?? null;
}

export async function getMyBookings(): Promise<BookingDetail[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("bookings")
    .select(DETAIL_SELECT)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data as unknown as BookingDetail[]) ?? [];
}
