import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  YoutubeIcon,
} from "@/components/site/social-icons";
import { getSettings } from "@/lib/queries";
import { Logo } from "@/components/site/logo";
import { EVENT_TYPES } from "@/lib/utils";

export async function Footer() {
  const s = await getSettings();
  const year = new Date().getFullYear();

  const socials = [
    { href: s.instagram_url, icon: InstagramIcon, label: "Instagram" },
    { href: s.facebook_url, icon: FacebookIcon, label: "Facebook" },
    { href: s.youtube_url, icon: YoutubeIcon, label: "YouTube" },
  ].filter((x) => Boolean(x.href));

  return (
    <footer className="relative mt-32 overflow-hidden border-t border-champagne-300/10 bg-ink-900">
      <div
        aria-hidden
        className="ornament pointer-events-none absolute -top-40 left-1/2 size-[42rem] -translate-x-1/2 opacity-40"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-cream-200/50">{s.tagline}</p>
            <div className="mt-7 flex gap-3">
              {socials.map(({ href, icon: Icon, label }) => (
                <a
                  key={label}
                  href={href as string}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="hairline grid size-10 place-items-center rounded-full text-cream-200/60 transition-all duration-300 hover:border-champagne-300/50 hover:bg-champagne-300/10 hover:text-champagne-200"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn title="Explore">
            {[
              ["/packages", "All packages"],
              ["/services", "Services"],
              ["/gallery", "Gallery"],
              ["/about", "About us"],
              ["/contact", "Contact"],
            ].map(([href, label]) => (
              <FooterLink key={href} href={href}>
                {label}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Occasions">
            {EVENT_TYPES.map((t) => (
              <FooterLink key={t.value} href={`/packages?type=${t.value}`}>
                {t.label}s
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Studio">
            <li className="flex gap-3 text-sm text-cream-200/55">
              <MapPin className="mt-0.5 size-4 shrink-0 text-champagne-400" />
              <span className="text-pretty">{s.address}</span>
            </li>
            <li>
              <a
                href={`tel:${s.phone.replace(/\s/g, "")}`}
                className="flex gap-3 text-sm text-cream-200/55 transition-colors hover:text-champagne-200"
              >
                <Phone className="mt-0.5 size-4 shrink-0 text-champagne-400" />
                {s.phone}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${s.email}`}
                className="flex gap-3 text-sm text-cream-200/55 transition-colors hover:text-champagne-200"
              >
                <Mail className="mt-0.5 size-4 shrink-0 text-champagne-400" />
                {s.email}
              </a>
            </li>
          </FooterColumn>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-champagne-300/10 pt-8 text-xs text-cream-200/35 sm:flex-row">
          <p>
            © {year} {s.company_name}. All rights reserved.
          </p>
          <p className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-champagne-400" />
            Crafted for celebrations across {s.cities_count} cities.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-champagne-300/80">
        {title}
      </h3>
      <ul className="mt-6 space-y-3.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-sm text-cream-200/55 transition-colors hover:text-champagne-200"
      >
        <span className="h-px w-0 bg-champagne-300 transition-all duration-300 group-hover:w-4" />
        {children}
      </Link>
    </li>
  );
}
