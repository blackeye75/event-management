"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { quoteBooking } from "@/lib/pricing";
import { EVENT_TYPES } from "@/lib/utils";
import type { BookingStatus, EventType, Package, Service } from "@/lib/database.types";

const eventTypes = EVENT_TYPES.map((t) => t.value) as [EventType, ...EventType[]];

const schema = z.object({
  package_slug: z.string().trim().optional().or(z.literal("")),
  event_type: z.enum(eventTypes),
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose an event date."),
  event_time: z.string().regex(/^\d{2}:\d{2}$/, "Choose a start time."),
  guest_count: z.coerce.number().int().min(1, "At least one guest.").max(5000),
  venue_name: z.string().trim().max(120).optional().or(z.literal("")),
  venue_address: z.string().trim().max(400).optional().or(z.literal("")),
  city: z.string().trim().min(2, "Which city?"),
  contact_name: z.string().trim().min(2, "Who should we call?"),
  contact_phone: z.string().trim().min(6, "A reachable phone number, please."),
  contact_email: z.string().trim().email("Enter a valid email address."),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  service_ids: z.array(z.string()).default([]),
});

export type BookingResult = { ok: false; message: string } | null;

export async function createBooking(
  _prev: BookingResult,
  formData: FormData,
): Promise<BookingResult> {
  const parsed = schema.safeParse({
    package_slug: formData.get("package_slug"),
    event_type: formData.get("event_type"),
    event_date: formData.get("event_date"),
    event_time: formData.get("event_time"),
    guest_count: formData.get("guest_count"),
    venue_name: formData.get("venue_name"),
    venue_address: formData.get("venue_address"),
    city: formData.get("city"),
    contact_name: formData.get("contact_name"),
    contact_phone: formData.get("contact_phone"),
    contact_email: formData.get("contact_email"),
    notes: formData.get("notes"),
    service_ids: formData.getAll("service_ids").map(String).filter(Boolean),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const input = parsed.data;

  // An event date in the past is almost always a mis-tap on the date picker.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (new Date(`${input.event_date}T00:00:00`) < today) {
    return { ok: false, message: "That date has already passed — pick a future date." };
  }

  const supabase = await createClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Bookings need a Supabase project. Add your credentials to .env.local and retry.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/book");
  }

  // Re-read the catalogue server-side: the browser never gets to set a price.
  const { data: pkg } = input.package_slug
    ? await supabase
        .from("packages")
        .select("id, base_price, sale_price, event_type")
        .eq("slug", input.package_slug)
        .eq("is_active", true)
        .maybeSingle()
    : { data: null };

  if (input.package_slug && !pkg) {
    return { ok: false, message: "That package is no longer available. Please pick another." };
  }

  const { data: services } = input.service_ids.length
    ? await supabase
        .from("services")
        .select("id, name, base_price, price_unit")
        .in("id", input.service_ids)
        .eq("is_active", true)
    : { data: [] };

  const quote = quoteBooking({
    pkg: pkg as Pick<Package, "base_price" | "sale_price"> | null,
    services: (services ?? []) as Pick<Service, "id" | "name" | "base_price" | "price_unit">[],
    guestCount: input.guest_count,
  });

  if (quote.total <= 0) {
    return {
      ok: false,
      message: "Pick a package or at least one service so we have something to quote.",
    };
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      package_id: pkg?.id ?? null,
      event_type: input.event_type,
      event_date: input.event_date,
      event_time: input.event_time,
      guest_count: input.guest_count,
      venue_name: input.venue_name || null,
      venue_address: input.venue_address || null,
      city: input.city,
      contact_name: input.contact_name,
      contact_phone: input.contact_phone,
      contact_email: input.contact_email,
      notes: input.notes || null,
      package_price: quote.packagePrice,
      addons_total: quote.addonsTotal,
      tax: quote.tax,
      total: quote.total,
      status: "pending" satisfies BookingStatus,
    })
    .select("id, booking_ref")
    .single();

  if (error || !booking) {
    return { ok: false, message: "We could not save that booking. Please try again." };
  }

  if (quote.addons.length) {
    await supabase.from("booking_services").insert(
      quote.addons.map((a) => ({
        booking_id: booking.id,
        service_id: a.service_id,
        name: a.name,
        quantity: a.quantity,
        unit_price: a.unit_price,
        line_total: a.line_total,
      })),
    );
  }

  revalidatePath("/account");
  redirect(`/checkout/${booking.booking_ref}`);
}

/** A customer cancelling their own still-pending booking. */
export async function cancelBooking(formData: FormData) {
  const id = String(formData.get("booking_id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS additionally restricts this to the owner's pending bookings.
  await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "pending");

  revalidatePath("/account");
}
