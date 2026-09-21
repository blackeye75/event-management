import type { Metadata } from "next";
import { getPackages, getSettings } from "@/lib/queries";
import { PageHeader } from "@/components/site/page-header";
import { PackageCard } from "@/components/site/package-card";
import { PackageFilters } from "@/components/site/package-filters";
import { CtaBand } from "@/components/site/cta-band";
import { EVENT_TYPES } from "@/lib/utils";
import type { EventType } from "@/lib/database.types";

export const metadata: Metadata = {
  title: "Packages",
  description:
    "Complete, costed event packages for weddings, birthdays, anniversaries and corporate evenings — decor, catering, entertainment and crew included.",
};

export default async function PackagesPage({ searchParams }: PageProps<"/packages">) {
  const params = await searchParams;
  const raw = typeof params.type === "string" ? params.type : undefined;
  const active = EVENT_TYPES.some((t) => t.value === raw) ? (raw as EventType) : undefined;

  const [packages, settings] = await Promise.all([getPackages(), getSettings()]);
  const visible = active ? packages.filter((p) => p.event_type === active) : packages;

  return (
    <>
      <PageHeader
        eyebrow="Curated packages"
        title="Pick a starting point,"
        accent="then make it yours"
        description="Each package is a full evening with a real price attached. Nothing here is a teaser rate — add or remove services at the booking step and the total updates live."
      >
        <PackageFilters active={active} counts={countByType(packages)} />
      </PageHeader>

      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        {visible.length ? (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} index={i} />
            ))}
          </div>
        ) : (
          <p className="hairline rounded-3xl bg-ink-900/50 px-6 py-20 text-center text-cream-200/50">
            No packages under this occasion yet — tell us what you have in mind and we will build
            one.
          </p>
        )}
      </section>

      <CtaBand phone={settings.phone} />
    </>
  );
}

function countByType(packages: { event_type: EventType }[]) {
  return packages.reduce<Record<string, number>>((acc, p) => {
    acc[p.event_type] = (acc[p.event_type] ?? 0) + 1;
    return acc;
  }, {});
}
