"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CategoryIcon } from "@/components/site/category-icon";
import type { Category } from "@/lib/database.types";

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
      {categories.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link
            href={`/services?category=${c.slug}`}
            title={c.description ?? c.name}
            className="hairline group flex h-full flex-col items-center gap-3 rounded-2xl bg-ink-900/40 px-3 py-6 text-center transition-all duration-400 hover:-translate-y-1 hover:border-champagne-300/45 hover:bg-champagne-300/[0.06]"
          >
            <CategoryIcon
              name={c.icon}
              className="size-6 text-champagne-300/80 transition-transform duration-400 group-hover:scale-110 group-hover:text-champagne-200"
            />
            <span className="text-xs leading-tight text-cream-200/60 transition-colors group-hover:text-cream-50">
              {c.name}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
