"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAdmin } from "@/lib/admin";
import { BOOKING_STATUSES, EVENT_TYPES, PAYMENT_STATUSES, slugify } from "@/lib/utils";
import { refreshBookingPaymentState } from "@/lib/payments/settle";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookingStatus, EventType, PaymentStatus } from "@/lib/database.types";

export type ActionResult = { ok: boolean; message: string } | null;

const eventTypes = EVENT_TYPES.map((t) => t.value) as [EventType, ...EventType[]];
const bookingStatuses = BOOKING_STATUSES as [BookingStatus, ...BookingStatus[]];
const paymentStatuses = PAYMENT_STATUSES as [PaymentStatus, ...PaymentStatus[]];

/** Textareas collect one item per line; blank lines are dropped. */
function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function num(value: FormDataEntryValue | null, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function bool(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

/* ========================================================================== */
/*  Packages                                                                  */
/* ========================================================================== */

const packageSchema = z.object({
  name: z.string().trim().min(2, "A package needs a name."),
  slug: z.string().trim().min(2),
  event_type: z.enum(eventTypes),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  hero_image_url: z.string().trim().url("Use a full image URL.").optional().or(z.literal("")),
  base_price: z.number().min(0),
  sale_price: z.number().min(0).nullable(),
  guest_capacity: z.number().int().min(1).max(10000),
  duration_hours: z.number().int().min(1).max(1000),
});

export async function savePackage(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const salePriceRaw = String(formData.get("sale_price") ?? "").trim();

  const parsed = packageSchema.safeParse({
    name,
    slug: String(formData.get("slug") ?? "").trim() || slugify(name),
    event_type: formData.get("event_type"),
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    hero_image_url: formData.get("hero_image_url"),
    base_price: num(formData.get("base_price")),
    sale_price: salePriceRaw === "" ? null : num(formData.get("sale_price")),
    guest_capacity: num(formData.get("guest_capacity"), 50),
    duration_hours: num(formData.get("duration_hours"), 4),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    tagline: parsed.data.tagline || null,
    description: parsed.data.description || null,
    hero_image_url: parsed.data.hero_image_url || null,
    gallery: lines(formData.get("gallery")),
    inclusions: lines(formData.get("inclusions")),
    is_active: bool(formData.get("is_active")),
    is_featured: bool(formData.get("is_featured")),
    sort_order: num(formData.get("sort_order")),
  };

  const { data, error } = id
    ? await supabase.from("packages").update(row).eq("id", id).select("id").single()
    : await supabase.from("packages").insert(row).select("id").single();

  if (error || !data) {
    return {
      ok: false,
      message: error?.code === "23505" ? "That slug is already taken." : "Could not save.",
    };
  }

  // Replace the bundled-services set wholesale — simpler than diffing, and the
  // table is tiny.
  const serviceIds = formData.getAll("service_ids").map(String).filter(Boolean);
  await supabase.from("package_services").delete().eq("package_id", data.id);
  if (serviceIds.length) {
    await supabase
      .from("package_services")
      .insert(serviceIds.map((service_id) => ({ package_id: data.id, service_id })));
  }

  revalidateCatalogue();
  redirect("/admin/packages?saved=1");
}

export async function deletePackage(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await supabase.from("packages").delete().eq("id", id);
  revalidateCatalogue();
  redirect("/admin/packages?deleted=1");
}

/* ========================================================================== */
/*  Services                                                                  */
/* ========================================================================== */

const serviceSchema = z.object({
  name: z.string().trim().min(2, "A service needs a name."),
  slug: z.string().trim().min(2),
  category_id: z.string().uuid("Pick a category.").nullable(),
  tagline: z.string().trim().max(200).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  image_url: z.string().trim().url("Use a full image URL.").optional().or(z.literal("")),
  base_price: z.number().min(0),
  price_unit: z.enum(["event", "plate", "hour", "day"]),
});

export async function saveService(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "");
  const categoryId = String(formData.get("category_id") ?? "").trim();

  const parsed = serviceSchema.safeParse({
    name,
    slug: String(formData.get("slug") ?? "").trim() || slugify(name),
    category_id: categoryId || null,
    tagline: formData.get("tagline"),
    description: formData.get("description"),
    image_url: formData.get("image_url"),
    base_price: num(formData.get("base_price")),
    price_unit: formData.get("price_unit"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0].message };
  }

  const row = {
    ...parsed.data,
    tagline: parsed.data.tagline || null,
    description: parsed.data.description || null,
    image_url: parsed.data.image_url || null,
    features: lines(formData.get("features")),
    is_active: bool(formData.get("is_active")),
    is_featured: bool(formData.get("is_featured")),
    sort_order: num(formData.get("sort_order")),
  };

  const { error } = id
    ? await supabase.from("services").update(row).eq("id", id)
    : await supabase.from("services").insert(row);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "That slug is already taken." : "Could not save.",
    };
  }

  revalidateCatalogue();
  redirect("/admin/services?saved=1");
}

export async function deleteService(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await supabase.from("services").delete().eq("id", id);
  revalidateCatalogue();
  redirect("/admin/services?deleted=1");
}

/* ========================================================================== */
/*  Categories                                                                */
/* ========================================================================== */

export async function saveCategory(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { ok: false, message: "A category needs a name." };

  const id = String(formData.get("id") ?? "");
  const row = {
    name,
    slug: String(formData.get("slug") ?? "").trim() || slugify(name),
    description: String(formData.get("description") ?? "").trim() || null,
    icon: String(formData.get("icon") ?? "sparkles"),
    sort_order: num(formData.get("sort_order")),
    is_active: bool(formData.get("is_active")),
  };

  const { error } = id
    ? await supabase.from("categories").update(row).eq("id", id)
    : await supabase.from("categories").insert(row);

  if (error) {
    return {
      ok: false,
      message: error.code === "23505" ? "That slug is already taken." : "Could not save.",
    };
  }

  revalidateCatalogue();
  return { ok: true, message: `Saved “${name}”.` };
}

export async function deleteCategory(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  // services.category_id is ON DELETE SET NULL, so the services survive.
  if (id) await supabase.from("categories").delete().eq("id", id);
  revalidateCatalogue();
  revalidatePath("/admin/categories");
}

/* ========================================================================== */
/*  Testimonials                                                              */
/* ========================================================================== */

export async function saveTestimonial(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const author_name = String(formData.get("author_name") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();

  if (author_name.length < 2) return { ok: false, message: "Who said it?" };
  if (quote.length < 10) return { ok: false, message: "The quote is a little short." };

  const eventType = String(formData.get("event_type") ?? "").trim();
  const id = String(formData.get("id") ?? "");

  const row = {
    author_name,
    author_role: String(formData.get("author_role") ?? "").trim() || null,
    event_type: (eventTypes.includes(eventType as EventType)
      ? (eventType as EventType)
      : null) as EventType | null,
    rating: Math.min(5, Math.max(1, num(formData.get("rating"), 5))),
    quote,
    avatar_url: String(formData.get("avatar_url") ?? "").trim() || null,
    is_published: bool(formData.get("is_published")),
    sort_order: num(formData.get("sort_order")),
  };

  const { error } = id
    ? await supabase.from("testimonials").update(row).eq("id", id)
    : await supabase.from("testimonials").insert(row);

  if (error) return { ok: false, message: "Could not save that testimonial." };

  revalidateCatalogue();
  return { ok: true, message: `Saved ${author_name}'s review.` };
}

export async function deleteTestimonial(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await supabase.from("testimonials").delete().eq("id", id);
  revalidateCatalogue();
  revalidatePath("/admin/testimonials");
}

/* ========================================================================== */
/*  Bookings                                                                  */
/* ========================================================================== */

const bookingUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(bookingStatuses),
  payment_status: z.enum(paymentStatuses),
});

export async function updateBookingStatus(formData: FormData) {
  const { supabase } = await requireAdmin();

  const parsed = bookingUpdateSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
    payment_status: formData.get("payment_status"),
  });

  if (!parsed.success) return;

  await supabase
    .from("bookings")
    .update({ status: parsed.data.status, payment_status: parsed.data.payment_status })
    .eq("id", parsed.data.id);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/account");
}

/** Logs money taken outside the gateway (bank transfer, cash, cheque). */
export async function recordOfflinePayment(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const bookingId = String(formData.get("booking_id") ?? "");
  const amount = num(formData.get("amount"));
  const method = String(formData.get("method") ?? "offline").trim() || "offline";

  if (!bookingId) return { ok: false, message: "Missing booking." };
  if (amount <= 0) return { ok: false, message: "Enter an amount above zero." };

  // Payments have no client INSERT policy, so this needs the service role.
  const admin = createAdminClient();
  if (!admin) {
    return {
      ok: false,
      message: "Set SUPABASE_SERVICE_ROLE_KEY to record payments taken outside the gateway.",
    };
  }

  const { error } = await admin.from("payments").insert({
    booking_id: bookingId,
    provider: "offline",
    amount,
    currency: "INR",
    status: "paid",
    method,
  });

  if (error) return { ok: false, message: "Could not record that payment." };

  await refreshBookingPaymentState(admin, bookingId);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
  revalidatePath("/account");

  return { ok: true, message: "Payment recorded." };
}

/* ========================================================================== */
/*  Enquiries                                                                 */
/* ========================================================================== */

export async function toggleEnquiryHandled(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const handled = bool(formData.get("is_handled"));
  if (id) await supabase.from("enquiries").update({ is_handled: !handled }).eq("id", id);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function deleteEnquiry(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (id) await supabase.from("enquiries").delete().eq("id", id);
  revalidatePath("/admin/enquiries");
}

/* ========================================================================== */
/*  Site settings                                                             */
/* ========================================================================== */

export async function saveSettings(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const { supabase } = await requireAdmin();

  const text = (key: string) => String(formData.get(key) ?? "").trim();

  if (!text("company_name")) return { ok: false, message: "The company needs a name." };

  const { error } = await supabase
    .from("site_settings")
    .update({
      company_name: text("company_name"),
      tagline: text("tagline"),
      hero_title: text("hero_title"),
      hero_subtitle: text("hero_subtitle"),
      phone: text("phone"),
      email: text("email"),
      address: text("address"),
      instagram_url: text("instagram_url") || null,
      facebook_url: text("facebook_url") || null,
      youtube_url: text("youtube_url") || null,
      events_count: num(formData.get("events_count")),
      cities_count: num(formData.get("cities_count")),
      years_count: num(formData.get("years_count")),
    })
    .eq("id", 1);

  if (error) return { ok: false, message: "Could not save those settings." };

  revalidateCatalogue();
  return { ok: true, message: "Settings saved — the site is already showing them." };
}

/* -------------------------------------------------------------------------- */

/** Anything an admin edits is visible on the public site, so blow both away. */
function revalidateCatalogue() {
  revalidatePath("/", "layout");
}
