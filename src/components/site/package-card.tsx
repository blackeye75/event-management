"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { eventTypeLabel, formatCompactCurrency } from "@/lib/utils";
import type { Package } from "@/lib/database.types";

export function PackageCard({ pkg, index = 0 }: { pkg: Package; index?: number }) {
  const price = pkg.sale_price ?? pkg.base_price;
  const discounted = pkg.sale_price != null && pkg.sale_price < pkg.base_price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: Math.min(index, 4) * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link
        href={`/packages/${pkg.slug}`}
        className="hairline block overflow-hidden rounded-3xl bg-ink-900/60 transition-all duration-500 hover:-translate-y-1.5 hover:border-champagne-300/40 hover:shadow-[0_30px_80px_-40px] hover:shadow-champagne-400/40"
      >
        <SmartImage
          src={pkg.hero_image_url}
          alt={pkg.name}
          seed={pkg.slug}
          className="aspect-[4/3] w-full"
          imgClassName="group-hover:scale-[1.07]"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/3] bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent"
        />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <Badge>{eventTypeLabel(pkg.event_type)}</Badge>
          {discounted && (
            <Badge className="border-emerald-400/30 bg-emerald-400/15 text-emerald-200">
              Save {Math.round(((pkg.base_price - price) / pkg.base_price) * 100)}%
            </Badge>
          )}
        </div>

        <div className="relative -mt-16 p-6">
          <h3 className="font-display text-2xl leading-tight text-cream-50 transition-colors group-hover:text-champagne-100">
            {pkg.name}
          </h3>
          {pkg.tagline && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-cream-200/55">
              {pkg.tagline}
            </p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-cream-200/45">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-champagne-400" />
              Up to {pkg.guest_capacity} guests
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5 text-champagne-400" />
              {pkg.duration_hours >= 24
                ? `${Math.round(pkg.duration_hours / 24)} days`
                : `${pkg.duration_hours} hours`}
            </span>
          </div>

          <div className="mt-6 flex items-end justify-between border-t border-champagne-300/10 pt-5">
            <div>
              <span className="block text-[0.65rem] uppercase tracking-[0.2em] text-cream-200/35">
                Starting at
              </span>
              <span className="font-display mt-1 flex items-baseline gap-2 text-2xl text-champagne-200">
                {formatCompactCurrency(price)}
                {discounted && (
                  <span className="text-sm text-cream-200/30 line-through">
                    {formatCompactCurrency(pkg.base_price)}
                  </span>
                )}
              </span>
            </div>
            <span className="hairline grid size-10 place-items-center rounded-full text-champagne-200 transition-all duration-400 group-hover:rotate-45 group-hover:border-champagne-300/60 group-hover:bg-champagne-300 group-hover:text-ink-950">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
