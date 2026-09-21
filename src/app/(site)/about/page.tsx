import type { Metadata } from "next";
import { getSettings, getTestimonials } from "@/lib/queries";
import { PageHeader } from "@/components/site/page-header";
import { Stats } from "@/components/site/stats";
import { Process } from "@/components/site/process";
import { Testimonials } from "@/components/site/testimonials";
import { CtaBand } from "@/components/site/cta-band";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { SmartImage } from "@/components/ui/smart-image";

export const metadata: Metadata = {
  title: "About",
  description:
    "Function Junction is an event atelier that plans, staffs and runs celebrations end to end — one contract, one coordinator, no vendor chasing.",
};

const VALUES = [
  {
    title: "One contract, not eleven",
    body: "Decor, food, sound, beauty and crew sit under a single agreement with a single price. You never hold a vendor together on the day.",
  },
  {
    title: "Our own crew, not a marketplace",
    body: "The people who show up are on our payroll and have worked together before. That is why load-in runs on schedule.",
  },
  {
    title: "Real prices, published",
    body: "Every package and service on this site carries its actual starting rate. No enquiry gate, no revised quote after you have committed.",
  },
  {
    title: "A coordinator who stays",
    body: "The planner who designs your event is the one standing at the back of the room on the night. No handover to a stranger.",
  },
];

export default async function AboutPage() {
  const [settings, testimonials] = await Promise.all([getSettings(), getTestimonials()]);

  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="An atelier for"
        accent="the days that matter"
        description={settings.tagline}
      />

      <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div className="relative">
              <SmartImage
                src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80"
                alt="A Function Junction mandap build"
                seed="about-primary"
                className="aspect-[4/5] w-full rounded-3xl border border-champagne-300/15"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute -bottom-8 -right-4 hidden w-48 sm:block lg:-right-8 lg:w-56">
                <SmartImage
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=600&q=80"
                  alt="A birthday decor build"
                  seed="about-secondary"
                  className="aspect-square w-full rounded-2xl border border-champagne-300/25 shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)]"
                />
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              align="left"
              eyebrow="Since 2014"
              title="We started because"
              accent="nobody answered the phone"
              className="max-w-none"
            />
            <Reveal delay={0.1}>
              <div className="mt-8 space-y-5 text-pretty leading-relaxed text-cream-200/60">
                <p>
                  {settings.company_name} began with one wedding, a borrowed van and a founder who
                  had spent six months chasing eleven vendors for her own sister&apos;s reception.
                  The florist and the caterer had never spoken. The DJ arrived after the ceremony.
                </p>
                <p>
                  A decade on we run {settings.events_count.toLocaleString("en-IN")}+ events a year
                  across {settings.cities_count} cities, with our own decor workshop, kitchen
                  partners on retainer and a standing crew of production staff. The promise has not
                  changed: you make one call, and the evening happens.
                </p>
                <p>
                  We publish our prices, we hold your date for free while you decide, and the
                  planner who draws your mood board is the one who will be standing at the back of
                  the room on the night.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Stats settings={settings} />

      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <SectionHeading eyebrow="How we work" title="Four things we" accent="refuse to compromise" />
        <div className="mt-16 grid gap-px sm:grid-cols-2">
          {VALUES.map((value, i) => (
            <Reveal key={value.title} delay={i * 0.08}>
              <div className="hairline h-full rounded-2xl bg-ink-900/40 p-8 transition-colors duration-500 hover:border-champagne-300/35 hover:bg-ink-800/50">
                <span className="font-display text-5xl text-champagne-300/25">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display mt-4 text-2xl text-cream-50">{value.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-cream-200/55">{value.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y border-champagne-300/10 bg-ink-900/30 py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading eyebrow="The process" title="From first call to" accent="last dance" />
          <Process />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-28 sm:px-8">
        <SectionHeading eyebrow="In their words" title="What families" accent="tell us after" />
        <Testimonials items={testimonials} />
      </section>

      <CtaBand phone={settings.phone} />
    </>
  );
}
