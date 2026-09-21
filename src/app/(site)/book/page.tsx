import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile, getPackages, getServices } from "@/lib/queries";
import { PageHeader } from "@/components/site/page-header";
import { BookingWizard } from "@/components/site/booking-wizard";

export const metadata: Metadata = {
  title: "Book an event",
  description: "Reserve your date with Function Junction in four steps.",
};

export default async function BookPage({ searchParams }: PageProps<"/book">) {
  const [params, profile] = await Promise.all([searchParams, getCurrentProfile()]);

  // `proxy.ts` already redirects signed-out visitors; this covers the case
  // where Supabase is not configured at all.
  if (!profile) redirect("/login?next=/book");

  const [packages, services] = await Promise.all([getPackages(), getServices()]);

  const packageSlug = typeof params.package === "string" ? params.package : undefined;
  const serviceSlug = typeof params.service === "string" ? params.service : undefined;
  const service = serviceSlug ? services.find((s) => s.slug === serviceSlug) : undefined;

  return (
    <>
      <PageHeader
        eyebrow="Reserve your date"
        title="Four steps and"
        accent="the date is yours"
        description="Build the evening, see the price update as you go, and pay a 25% advance to lock it in. Everything stays editable until we confirm."
      />

      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <BookingWizard
          packages={packages}
          services={services}
          defaults={{
            packageSlug: packages.some((p) => p.slug === packageSlug) ? packageSlug : undefined,
            serviceId: service?.id,
            name: profile.full_name ?? "",
            email: profile.email ?? "",
            phone: profile.phone ?? "",
          }}
        />
      </section>
    </>
  );
}
