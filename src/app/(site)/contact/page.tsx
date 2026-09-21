import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getPackageBySlug, getServiceBySlug, getSettings } from "@/lib/queries";
import { PageHeader } from "@/components/site/page-header";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Reveal } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to a Function Junction planner about your wedding, birthday or corporate event. We reply within one working day.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const params = await searchParams;
  const settings = await getSettings();

  // Deep links from a package or service card pre-fill the message.
  const packageSlug = typeof params.package === "string" ? params.package : undefined;
  const serviceSlug = typeof params.service === "string" ? params.service : undefined;

  const [pkg, service] = await Promise.all([
    packageSlug ? getPackageBySlug(packageSlug) : null,
    serviceSlug ? getServiceBySlug(serviceSlug) : null,
  ]);

  const defaultMessage = pkg
    ? `I'd like to know more about the "${pkg.name}" package — `
    : service
      ? `I'd like a quote for "${service.name}" — `
      : "";

  const details = [
    { icon: Phone, label: "Call us", value: settings.phone, href: `tel:${settings.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Studio", value: settings.address },
    { icon: Clock, label: "Open", value: "Mon–Sat, 10am – 8pm IST" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Tell us the occasion,"
        accent="we'll take it from there"
        description="Send a note or call the studio. A planner replies within one working day with a costed outline — no deposit needed to see it."
      />

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <div className="space-y-4">
            {details.map((d, i) => (
              <Reveal key={d.label} delay={i * 0.07}>
                <DetailCard {...d} />
              </Reveal>
            ))}

            <Reveal delay={0.3}>
              <div className="hairline rounded-2xl bg-ink-900/40 p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
                  Before you write
                </h3>
                <ul className="mt-4 space-y-2.5 text-sm text-cream-200/55">
                  <li>• Dates inside 30 days are possible, but call rather than email.</li>
                  <li>• We hold a date free for 48 hours while you decide.</li>
                  <li>• Every package price on this site is the real starting figure.</li>
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <EnquiryForm defaultMessage={defaultMessage} />
          </Reveal>
        </div>
      </section>
    </>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="hairline flex items-start gap-4 rounded-2xl bg-ink-900/40 p-5 transition-all duration-400 hover:border-champagne-300/35 hover:bg-ink-800/50">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-champagne-300/20 bg-champagne-300/[0.07]">
        <Icon className="size-4 text-champagne-300" />
      </span>
      <div className="min-w-0">
        <div className="text-[0.62rem] uppercase tracking-[0.22em] text-cream-200/35">{label}</div>
        <div className="mt-1 text-pretty text-sm text-cream-100">{value}</div>
      </div>
    </div>
  );

  return href ? (
    <a href={href} className="block">
      {body}
    </a>
  ) : (
    body
  );
}
