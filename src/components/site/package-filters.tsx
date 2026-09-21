"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { EVENT_TYPES } from "@/lib/utils";
import type { EventType } from "@/lib/database.types";
import { cn } from "@/lib/utils";

export function PackageFilters({
  active,
  counts,
}: {
  active?: EventType;
  counts: Record<string, number>;
}) {
  const options = [
    { value: undefined, label: "All occasions" },
    ...EVENT_TYPES.filter((t) => (counts[t.value] ?? 0) > 0),
  ];

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {options.map((option) => {
        const isActive = option.value === active;
        return (
          <Link
            key={option.label}
            href={option.value ? `/packages?type=${option.value}` : "/packages"}
            scroll={false}
            className={cn(
              "relative rounded-full px-5 py-2.5 text-sm transition-colors",
              isActive ? "text-ink-950" : "hairline text-cream-200/65 hover:text-cream-50",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="pkg-filter"
                className="absolute inset-0 rounded-full bg-champagne-300"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            <span className="relative">
              {option.label}
              {option.value && (
                <span className={cn("ml-1.5 text-xs", isActive ? "opacity-60" : "opacity-40")}>
                  {counts[option.value]}
                </span>
              )}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
