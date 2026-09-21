"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Check } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { formatCurrency } from "@/lib/utils";
import type { ServiceWithCategory } from "@/lib/database.types";

const UNIT_LABEL: Record<string, string> = {
  plate: "per plate",
  hour: "per hour",
  day: "per day",
  event: "per event",
};

export function ServiceCard({
  service,
  index = 0,
}: {
  service: ServiceWithCategory;
  index?: number;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay: Math.min(index, 5) * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        href={`/services/${service.slug}`}
        className="hairline group flex h-full flex-col overflow-hidden rounded-3xl bg-ink-900/50 transition-all duration-500 hover:-translate-y-1 hover:border-champagne-300/40 hover:bg-ink-800/60"
      >
        <SmartImage
          src={service.image_url}
          alt={service.name}
          seed={service.slug}
          className="aspect-[16/10] w-full"
          imgClassName="opacity-80 group-hover:scale-105 group-hover:opacity-100"
          sizes="(max-width: 768px) 100vw, 33vw"
        />

        <div className="flex flex-1 flex-col p-6">
          {service.category && (
            <span className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-champagne-400/80">
              {service.category.name}
            </span>
          )}
          <h3 className="font-display mt-2.5 text-xl text-cream-50 transition-colors group-hover:text-champagne-100">
            {service.name}
          </h3>
          {service.tagline && (
            <p className="mt-2 text-sm leading-relaxed text-cream-200/50">{service.tagline}</p>
          )}

          <ul className="mt-4 space-y-2">
            {service.features.slice(0, 3).map((f) => (
              <li key={f} className="flex items-start gap-2 text-xs text-cream-200/45">
                <Check className="mt-0.5 size-3 shrink-0 text-champagne-400" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between border-t border-champagne-300/10 pt-5">
            <span className="text-sm">
              <span className="text-champagne-200">{formatCurrency(service.base_price)}</span>
              <span className="ml-1.5 text-xs text-cream-200/35">
                {UNIT_LABEL[service.price_unit] ?? `per ${service.price_unit}`}
              </span>
            </span>
            <ArrowRight className="size-4 text-champagne-300/60 transition-transform duration-400 group-hover:translate-x-1 group-hover:text-champagne-200" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
