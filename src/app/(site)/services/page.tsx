import type { Metadata } from "next";
import Link from "next/link";
import { getCategories, getServices, getSettings } from "@/lib/queries";
import { PageHeader } from "@/components/site/page-header";
import { ServiceCard } from "@/components/site/service-card";
import { CategoryIcon } from "@/components/site/category-icon";
import { CtaBand } from "@/components/site/cta-band";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Services",
  description:
    "DJs, catering, decor, photography, bridal beauty, venue sourcing and hospitality — every event service Function Junction runs with its own crew.",
};

export default async function ServicesPage({ searchParams }: PageProps<"/services">) {
  const params = await searchParams;
  const requested = typeof params.category === "string" ? params.category : undefined;

  const [categories, services, settings] = await Promise.all([
    getCategories(),
    getServices(),
    getSettings(),
  ]);

  const active = categories.find((c) => c.slug === requested)?.slug;
  const visible = active ? services.filter((s) => s.category?.slug === active) : services;

  const counts = services.reduce<Record<string, number>>((acc, s) => {
    const key = s.category?.slug;
    if (key) acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <PageHeader
        eyebrow="Our services"
        title="Book the whole evening, or"
        accent="just the missing piece"
        description="Sixteen services across eight disciplines, each staffed and run by our own teams. Prices below are the real starting rates — no enquiry form required to see them."
      />

      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Category rail */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <FilterChip href="/services" active={!active}>
            All services
            <span className="ml-1.5 opacity-50">{services.length}</span>
          </FilterChip>
          {categories.map((c) => (
            <FilterChip
              key={c.id}
              href={`/services?category=${c.slug}`}
              active={active === c.slug}
            >
              <CategoryIcon name={c.icon} className="size-3.5" />
              {c.name}
              <span className="ml-1 opacity-50">{counts[c.slug] ?? 0}</span>
            </FilterChip>
          ))}
        </div>

        {active && (
          <p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-relaxed text-cream-200/45">
            {categories.find((c) => c.slug === active)?.description}
          </p>
        )}

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        {!visible.length && (
          <p className="hairline mt-12 rounded-3xl bg-ink-900/50 px-6 py-20 text-center text-cream-200/50">
            Nothing listed under this category yet.
          </p>
        )}
      </section>

      <CtaBand phone={settings.phone} />
    </>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs transition-all duration-300",
        active
          ? "bg-champagne-300 text-ink-950"
          : "hairline text-cream-200/60 hover:border-champagne-300/40 hover:text-cream-50",
      )}
    >
      {children}
    </Link>
  );
}
