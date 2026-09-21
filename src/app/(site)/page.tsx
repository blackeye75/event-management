import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCategories, getFeaturedPackages, getServices, getSettings, getTestimonials } from "@/lib/queries";
import { Hero } from "@/components/site/hero";
import { Marquee } from "@/components/site/marquee";
import { Stats } from "@/components/site/stats";
import { Process } from "@/components/site/process";
import { Testimonials } from "@/components/site/testimonials";
import { CtaBand } from "@/components/site/cta-band";
import { PackageCard } from "@/components/site/package-card";
import { ServiceCard } from "@/components/site/service-card";
import { CategoryStrip } from "@/components/site/category-strip";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { Reveal } from "@/components/ui/reveal";
import type { Package } from "@/lib/database.types";

export default async function HomePage() {
  const [settings, packages, services, categories, testimonials] = await Promise.all([
    getSettings(),
    getFeaturedPackages(6),
    getServices(),
    getCategories(),
    getTestimonials(),
  ]);

  const featuredServices = services.filter((s) => s.is_featured).slice(0, 6);

  return (
    <>
      <Hero settings={settings} />
      <Marquee />

      {/* ------------------------------------------------------------ Packages */}
      <section id="packages" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-28 sm:px-8">
        <SectionHeading
          eyebrow="Signature packages"
          title="Built for the occasions"
          accent="you'll remember"
          description="Every package below is a complete evening — decor, food, sound, crew and coverage. Swap anything out at the booking step; the price updates as you go."
        />

        <div className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <ButtonLink href="/packages" variant="outline" size="lg">
            See all packages
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </ButtonLink>
        </div>
      </section>

      <Stats settings={settings} />

      {/* ------------------------------------------------------------ Services */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <SectionHeading
          eyebrow="What we bring"
          title="Every vendor you'd otherwise chase,"
          accent="under one roof"
          description="Book a full package or just the pieces you are missing. Each service is staffed and run by our own crew, not a marketplace of strangers."
        />

        <CategoryStrip categories={categories} />

        <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <ButtonLink href="/services" variant="outline" size="lg">
            Explore all {services.length} services
            <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </ButtonLink>
        </div>
      </section>

      {/* ------------------------------------------------------------- Process */}
      <section className="border-y border-champagne-300/10 bg-ink-900/30 py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="Four steps from idea to"
            accent="the actual night"
          />
          <Process />
        </div>
      </section>

      {/* -------------------------------------------------------- Testimonials */}
      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <SectionHeading eyebrow="In their words" title="Families who let us" accent="run the day" />
        <Testimonials items={testimonials} />
      </section>

      {/* ------------------------------------------------------------- Gallery */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            align="left"
            eyebrow="From recent events"
            title="A look at the"
            accent="last few months"
            className="max-w-xl"
          />
          <Link
            href="/gallery"
            className="group inline-flex items-center gap-2 text-sm text-champagne-200"
          >
            Open the gallery
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
        <HomeGalleryStrip packages={packages} />
      </section>

      <CtaBand phone={settings.phone} />
    </>
  );
}


/** A tight mosaic pulled from the featured packages' own galleries. */
function HomeGalleryStrip({ packages }: { packages: Package[] }) {
  const shots = packages
    .flatMap((p) => p.gallery.map((src) => ({ src, seed: p.slug, alt: p.name })))
    .slice(0, 8);

  return (
    <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {shots.map((shot, i) => (
        <Reveal key={`${shot.src}-${i}`} delay={i * 0.05}>
          <SmartImage
            src={shot.src}
            alt={shot.alt}
            seed={`${shot.seed}-${i}`}
            className={
              "group w-full rounded-2xl border border-champagne-300/10 " +
              (i % 5 === 0 ? "aspect-[3/4]" : "aspect-square")
            }
            imgClassName="opacity-75 transition-all duration-700 hover:opacity-100 hover:scale-105"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        </Reveal>
      ))}
    </div>
  );
}
