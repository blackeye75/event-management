import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  Category,
  Enquiry,
  Package,
  Profile,
  Service,
  SiteSettings,
  Testimonial,
} from "@/lib/database.types";
import type { BookingDetail } from "@/lib/booking-types";

/**
 * Every admin page and action starts here. `proxy.ts` already blocks
 * non-admins at the edge; this is the second gate, so a missing matcher can
 * never expose the panel.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  if (!supabase) redirect("/admin/setup");

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || (profile as Profile).role !== "admin") {
    redirect("/account?denied=admin");
  }

  return { supabase, profile: profile as Profile };
}

/* -------------------------------------------------------------------------- */
/*  Readers — these see everything, including inactive rows.                   */
/* -------------------------------------------------------------------------- */

export async function adminListPackages(): Promise<Package[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("packages").select("*").order("sort_order");
  return (data as Package[]) ?? [];
}

export async function adminGetPackage(id: string) {
  const { supabase } = await requireAdmin();
  const [{ data: pkg }, { data: links }] = await Promise.all([
    supabase.from("packages").select("*").eq("id", id).maybeSingle(),
    supabase.from("package_services").select("service_id").eq("package_id", id),
  ]);

  if (!pkg) return null;
  return {
    pkg: pkg as Package,
    serviceIds: (links ?? []).map((l) => l.service_id as string),
  };
}

export async function adminListServices(): Promise<Service[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("services").select("*").order("sort_order");
  return (data as Service[]) ?? [];
}

export async function adminGetService(id: string): Promise<Service | null> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  return (data as Service | null) ?? null;
}

export async function adminListCategories(): Promise<Category[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("sort_order");
  return (data as Category[]) ?? [];
}

export async function adminListTestimonials(): Promise<Testimonial[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("testimonials").select("*").order("sort_order");
  return (data as Testimonial[]) ?? [];
}

export async function adminListEnquiries(): Promise<Enquiry[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Enquiry[]) ?? [];
}

export async function adminListBookings(): Promise<BookingDetail[]> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase
    .from("bookings")
    .select("*, package:packages(id, name, slug, hero_image_url), booking_services(*), payments(*)")
    .order("created_at", { ascending: false });
  return (data as unknown as BookingDetail[]) ?? [];
}

export async function adminGetSettings(): Promise<SiteSettings | null> {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings | null) ?? null;
}

/* -------------------------------------------------------------------------- */

export type AdminOverview = {
  bookings: BookingDetail[];
  totals: {
    bookings: number;
    pending: number;
    confirmed: number;
    upcoming: number;
    revenue: number;
    collected: number;
    packages: number;
    services: number;
    enquiries: number;
  };
  recent: BookingDetail[];
};

export async function adminOverview(): Promise<AdminOverview> {
  const { supabase } = await requireAdmin();

  const [bookingsRes, packagesRes, servicesRes, enquiriesRes, paymentsRes] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, package:packages(id, name, slug, hero_image_url), booking_services(*), payments(*)")
      .order("created_at", { ascending: false }),
    supabase.from("packages").select("id", { count: "exact", head: true }),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("is_handled", false),
    supabase.from("payments").select("amount").eq("status", "paid"),
  ]);

  const bookings = (bookingsRes.data as unknown as BookingDetail[]) ?? [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const live = bookings.filter((b) => b.status !== "cancelled");

  return {
    bookings: live,
    recent: bookings.slice(0, 8),
    totals: {
      bookings: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      upcoming: live.filter((b) => new Date(b.event_date) >= today).length,
      revenue: live.reduce((sum, b) => sum + Number(b.total), 0),
      collected: (paymentsRes.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0),
      packages: packagesRes.count ?? 0,
      services: servicesRes.count ?? 0,
      enquiries: enquiriesRes.count ?? 0,
    },
  };
}
