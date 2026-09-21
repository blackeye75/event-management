import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Clock, Sparkles, Users } from "lucide-react";
import { getPackageBySlug, getPackages, getSettings } from "@/lib/queries";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { Gallery } from "@/components/site/gallery";
import { PackageCard } from "@/components/site/package-card";
import { eventTypeLabel, formatCurrency, priceBreakdown } from "@/lib/utils";

export async function generateMetadata({
  params,
}: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) return { title: "Package not found" };

  return {
    title: pkg.name,
    description: pkg.tagline ?? pkg.description ?? undefined,
    openGraph: {
      title: `${pkg.name} · Function Junction`,
      description: pkg.tagline ?? undefined,
      images: pkg.hero_image_url ? [pkg.hero_image_url] : undefined,
    },
  };
}

export default async function PackageDetailPage({ params }: PageProps<"/packages/[slug]">) {
  const { slug } = await params;
  const pkg = await getPackageBySlug(slug);
  if (!pkg) notFound();

  const [settings, siblings] = await Promise.all([
    getSettings(),
    getPackages({ eventType: pkg.event_type }),
  ]);

  const price = pkg.sale_price ?? pkg.base_price;
  const { tax, total } = priceBreakdown(price, 0);
  const related = siblings.filter((p) => p.id !== pkg.id).slice(0, 3);

  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative">
        <SmartImage
          src={pkg.hero_image_url}
          alt={pkg.name}
          seed={pkg.slug}
          priority
          className="h-[70svh] min-h-[30rem] w-full"
          imgClassName="opacity-55"
          sizes="100vw"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/85"
        />

        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-7xl px-5 pb-14 sm:px-8">
            <Reveal>
              <Link
                href="/packages"
                className="inline-flex items-center gap-2 text-sm text-cream-200/60 transition-colors hover:text-champagne-200"
              >
                <ArrowLeft className="size-4" />
                All packages
              </Link>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge>{eventTypeLabel(pkg.event_type)}</Badge>
                {pkg.is_featured && (
                  <Badge className="border-champagne-300/50 bg-champagne-300/20">
                    <Sparkles className="size-3" />
                    Most booked
                  </Badge>
                )}
              </div>
            </Reveal>
            <Reveal delay={0.14}>
              <h1 className="font-display mt-5 max-w-3xl text-balance text-5xl leading-[1.02] sm:text-6xl lg:text-7xl">
                {pkg.name}
              </h1>
            </Reveal>
            {pkg.tagline && (
              <Reveal delay={0.2}>
                <p className="font-display mt-4 max-w-2xl text-xl italic text-champagne-200/80">
                  {pkg.tagline}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Content */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <p className="text-pretty text-lg leading-relaxed text-cream-200/70">
                {pkg.description}
              </p>
            </Reveal>

            <Reveal delay={0.06}>
              <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-champagne-300/12 sm:grid-cols-3">
                <Facet icon={Users} label="Guest capacity" value={`Up to ${pkg.guest_capacity}`} />
                <Facet
                  icon={Clock}
                  label="Coverage"
                  value={
                    pkg.duration_hours >= 24
                      ? `${Math.round(pkg.duration_hours / 24)} days`
                      : `${pkg.duration_hours} hours`
                  }
                />
                <Facet icon={Sparkles} label="Occasion" value={eventTypeLabel(pkg.event_type)} />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h2 className="font-display mt-14 text-3xl">What&apos;s included</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {pkg.inclusions.map((item) => (
                  <li
                    key={item}
                    className="hairline flex items-start gap-3 rounded-xl bg-ink-900/40 px-4 py-3.5 text-sm text-cream-200/70"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-champagne-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            {pkg.services.length > 0 && (
              <Reveal delay={0.14}>
                <h2 className="font-display mt-14 text-3xl">Services bundled in</h2>
                <p className="mt-2 text-sm text-cream-200/45">
                  Each of these is run by our own crew. Swap any of them at the booking step.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {pkg.services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="hairline group flex items-center gap-4 rounded-2xl bg-ink-900/40 p-3 transition-all duration-400 hover:border-champagne-300/40 hover:bg-ink-800/60"
                    >
                      <SmartImage
                        src={service.image_url}
                        alt={service.name}
                        seed={service.slug}
                        className="size-16 shrink-0 rounded-xl"
                        imgClassName="opacity-80 group-hover:opacity-100 group-hover:scale-105"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-cream-50">{service.name}</p>
                        <p className="truncate text-xs text-cream-200/45">{service.tagline}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}

            {pkg.gallery.length > 0 && (
              <Reveal delay={0.18}>
                <h2 className="font-display mt-14 text-3xl">From this build</h2>
                <Gallery
                  className="mt-6"
                  items={pkg.gallery.map((src, i) => ({
                    src,
                    alt: `${pkg.name} — photo ${i + 1}`,
                    seed: `${pkg.slug}-${i}`,
                  }))}
                />
              </Reveal>
            )}
          </div>

          {/* ------------------------------------------------------ Price card */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={0.1}>
              <div className="glass rounded-3xl p-7">
                <span className="text-[0.65rem] uppercase tracking-[0.22em] text-cream-200/40">
                  Package price
                </span>
                <div className="font-display mt-2 flex flex-wrap items-baseline gap-3">
                  <span className="text-4xl text-foil">{formatCurrency(price)}</span>
                  {pkg.sale_price != null && pkg.sale_price < pkg.base_price && (
                    <span className="text-lg text-cream-200/30 line-through">
                      {formatCurrency(pkg.base_price)}
                    </span>
                  )}
                </div>

                <dl className="mt-7 space-y-3 border-t border-champagne-300/12 pt-6 text-sm">
                  <Row label="Package" value={formatCurrency(price)} />
                  <Row label="GST (18%)" value={formatCurrency(tax)} />
                  <Row label="Payable today" value="25% advance" muted />
                  <div className="flex items-baseline justify-between border-t border-champagne-300/12 pt-4">
                    <dt className="text-cream-100">Total</dt>
                    <dd className="font-display text-2xl text-champagne-200">
                      {formatCurrency(total)}
                    </dd>
                  </div>
                </dl>

                <ButtonLink
                  href={`/book?package=${pkg.slug}`}
                  size="lg"
                  className="mt-7 w-full"
                >
                  Book this package
                </ButtonLink>
                <ButtonLink
                  href={`/contact?package=${pkg.slug}`}
                  variant="outline"
                  size="md"
                  className="mt-3 w-full"
                >
                  Ask a question first
                </ButtonLink>

                <p className="mt-5 text-center text-xs leading-relaxed text-cream-200/35">
                  Free date hold for 48 hours. Full refund on cancellations more than 30 days out.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.16}>
              <div className="hairline mt-4 rounded-2xl bg-ink-900/40 p-5 text-sm">
                <p className="text-cream-200/55">
                  Prefer to talk it through? Call{" "}
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, "")}`}
                    className="text-champagne-200 underline decoration-champagne-300/30 underline-offset-4"
                  >
                    {settings.phone}
                  </a>
                  .
                </p>
              </div>
            </Reveal>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
          <h2 className="font-display text-3xl">
            Other <span className="text-foil italic">{eventTypeLabel(pkg.event_type)}</span>{" "}
            packages
          </h2>
          <div className="mt-8 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              <PackageCard key={p.id} pkg={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

function Facet({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-ink-900/50 px-5 py-6">
      <Icon className="size-4 text-champagne-400" />
      <div className="mt-3 text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">
        {label}
      </div>
      <div className="mt-1 text-sm text-cream-50">{value}</div>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-cream-200/50">{label}</dt>
      <dd className={muted ? "text-cream-200/50" : "text-cream-100"}>{value}</dd>
    </div>
  );
}
