import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { getServiceBySlug, getServices, getSettings } from "@/lib/queries";
import { SmartImage } from "@/components/ui/smart-image";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { ServiceCard } from "@/components/site/service-card";
import { CategoryIcon } from "@/components/site/category-icon";
import { formatCurrency } from "@/lib/utils";

const UNIT_LABEL: Record<string, string> = {
  plate: "per plate",
  hour: "per hour",
  day: "per day",
  event: "per event",
};

export async function generateMetadata({
  params,
}: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };

  return {
    title: service.name,
    description: service.tagline ?? service.description ?? undefined,
  };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const [all, settings] = await Promise.all([getServices(), getSettings()]);
  const related = all
    .filter((s) => s.id !== service.id && s.category?.slug === service.category?.slug)
    .slice(0, 3);

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-32 sm:px-8 sm:pt-40">
        <Reveal>
          <Link
            href={
              service.category ? `/services?category=${service.category.slug}` : "/services"
            }
            className="inline-flex items-center gap-2 text-sm text-cream-200/55 transition-colors hover:text-champagne-200"
          >
            <ArrowLeft className="size-4" />
            {service.category?.name ?? "All services"}
          </Link>
        </Reveal>

        <div className="mt-8 grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <Reveal>
            <SmartImage
              src={service.image_url}
              alt={service.name}
              seed={service.slug}
              priority
              className="aspect-[4/3] w-full rounded-3xl border border-champagne-300/15"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          </Reveal>

          <div className="lg:py-4">
            {service.category && (
              <Reveal>
                <Badge>
                  <CategoryIcon name={service.category.icon} className="size-3" />
                  {service.category.name}
                </Badge>
              </Reveal>
            )}
            <Reveal delay={0.06}>
              <h1 className="font-display mt-5 text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
                {service.name}
              </h1>
            </Reveal>
            {service.tagline && (
              <Reveal delay={0.1}>
                <p className="font-display mt-4 text-xl italic text-champagne-200/75">
                  {service.tagline}
                </p>
              </Reveal>
            )}
            <Reveal delay={0.14}>
              <p className="mt-6 text-pretty leading-relaxed text-cream-200/60">
                {service.description}
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="glass mt-9 rounded-2xl p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <span className="block text-[0.62rem] uppercase tracking-[0.22em] text-cream-200/40">
                      Starting at
                    </span>
                    <span className="font-display mt-1 block text-3xl text-foil">
                      {formatCurrency(service.base_price)}
                      <span className="ml-2 text-sm not-italic text-cream-200/40">
                        {UNIT_LABEL[service.price_unit] ?? `per ${service.price_unit}`}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href={`/book?service=${service.slug}`} className="flex-1">
                    Add to a booking
                  </ButtonLink>
                  <ButtonLink
                    href={`/contact?service=${service.slug}`}
                    variant="outline"
                    className="flex-1"
                  >
                    Get a quote
                  </ButtonLink>
                </div>
              </div>
            </Reveal>

            {service.features.length > 0 && (
              <Reveal delay={0.22}>
                <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.24em] text-champagne-300/80">
                  What you get
                </h2>
                <ul className="mt-5 space-y-3">
                  {service.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-cream-200/65">
                      <Check className="mt-0.5 size-4 shrink-0 text-champagne-300" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}

            <Reveal delay={0.26}>
              <p className="mt-8 text-xs text-cream-200/35">
                Pricing varies with guest count, city and date. Call{" "}
                <a
                  href={`tel:${settings.phone.replace(/\s/g, "")}`}
                  className="text-champagne-200/70 underline decoration-champagne-300/25 underline-offset-4"
                >
                  {settings.phone}
                </a>{" "}
                for an exact figure.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
          <h2 className="font-display text-3xl">
            More from <span className="text-foil italic">{service.category?.name}</span>
          </h2>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
