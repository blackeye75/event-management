import { createClient } from "@/lib/supabase/server";
import {
  demoCategories,
  demoPackageServiceMap,
  demoPackages,
  demoServices,
  demoSettings,
  demoTestimonials,
} from "@/lib/demo-data";
import type {
  Category,
  EventType,
  Package,
  PackageWithServices,
  Profile,
  Service,
  ServiceWithCategory,
  SiteSettings,
  Testimonial,
} from "@/lib/database.types";

/*
 * Every reader here degrades to the demo catalogue when Supabase is absent or
 * the query fails, so a public page never renders an error to a visitor.
 */

export async function getSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  if (!supabase) return demoSettings;

  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
  return (data as SiteSettings | null) ?? demoSettings;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return demoCategories;

  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return data?.length ? (data as Category[]) : demoCategories;
}

export async function getServices(options: { categorySlug?: string } = {}): Promise<
  ServiceWithCategory[]
> {
  const supabase = await createClient();

  if (!supabase) {
    const byId = new Map(demoCategories.map((c) => [c.id, c]));
    return demoServices
      .map((s) => ({ ...s, category: byId.get(s.category_id ?? "") ?? null }))
      .filter((s) => !options.categorySlug || s.category?.slug === options.categorySlug);
  }

  let query = supabase
    .from("services")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("sort_order");

  const { data } = await query;
  const rows = (data ?? []) as unknown as ServiceWithCategory[];

  if (!rows.length) {
    const byId = new Map(demoCategories.map((c) => [c.id, c]));
    return demoServices.map((s) => ({ ...s, category: byId.get(s.category_id ?? "") ?? null }));
  }

  return options.categorySlug
    ? rows.filter((s) => s.category?.slug === options.categorySlug)
    : rows;
}

export async function getServiceBySlug(slug: string): Promise<ServiceWithCategory | null> {
  const supabase = await createClient();

  if (!supabase) {
    const s = demoServices.find((x) => x.slug === slug);
    if (!s) return null;
    return { ...s, category: demoCategories.find((c) => c.id === s.category_id) ?? null };
  }

  const { data } = await supabase
    .from("services")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .maybeSingle();

  if (data) return data as unknown as ServiceWithCategory;

  const s = demoServices.find((x) => x.slug === slug);
  return s ? { ...s, category: demoCategories.find((c) => c.id === s.category_id) ?? null } : null;
}

export async function getPackages(options: { eventType?: EventType } = {}): Promise<Package[]> {
  const supabase = await createClient();

  const fallback = demoPackages.filter(
    (p) => !options.eventType || p.event_type === options.eventType,
  );

  if (!supabase) return fallback;

  let query = supabase.from("packages").select("*").eq("is_active", true).order("sort_order");
  if (options.eventType) query = query.eq("event_type", options.eventType);

  const { data } = await query;
  return data?.length ? (data as Package[]) : fallback;
}

export async function getPackageBySlug(slug: string): Promise<PackageWithServices | null> {
  const supabase = await createClient();

  const demoFallback = (): PackageWithServices | null => {
    const p = demoPackages.find((x) => x.slug === slug);
    if (!p) return null;
    const slugs = demoPackageServiceMap[slug] ?? [];
    return { ...p, services: demoServices.filter((s) => slugs.includes(s.slug)) };
  };

  if (!supabase) return demoFallback();

  const { data } = await supabase
    .from("packages")
    .select("*, package_services(service:services(*))")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return demoFallback();

  const row = data as unknown as Package & {
    package_services: { service: Service | null }[] | null;
  };

  return {
    ...row,
    services: (row.package_services ?? [])
      .map((ps) => ps.service)
      .filter((s): s is Service => Boolean(s)),
  };
}

export async function getFeaturedPackages(limit = 6): Promise<Package[]> {
  const all = await getPackages();
  const featured = all.filter((p) => p.is_featured);
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient();
  if (!supabase) return demoTestimonials;

  const { data } = await supabase
    .from("testimonials")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  return data?.length ? (data as Testimonial[]) : demoTestimonials;
}

/** The signed-in user's profile, or null when signed out / unconfigured. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
}
