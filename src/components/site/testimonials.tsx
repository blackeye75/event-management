"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import type { Testimonial } from "@/lib/database.types";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [[index, direction], setState] = useState<[number, number]>([0, 0]);

  const go = useCallback(
    (delta: number) => {
      setState(([i]) => [(i + delta + items.length) % items.length, delta]);
    },
    [items.length],
  );

  // Auto-advance, paused while the tab is hidden.
  useEffect(() => {
    if (items.length < 2) return;
    const id = setInterval(() => {
      if (!document.hidden) go(1);
    }, 7000);
    return () => clearInterval(id);
  }, [go, items.length]);

  if (!items.length) return null;
  const item = items[index];

  return (
    <div className="relative mx-auto mt-16 max-w-4xl">
      <Quote
        aria-hidden
        className="mx-auto size-10 text-champagne-400/30"
        strokeWidth={1.2}
      />

      <div className="relative mt-6 min-h-72 overflow-hidden sm:min-h-64">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.blockquote
            key={item.id}
            custom={direction}
            initial={{ opacity: 0, x: direction >= 0 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction >= 0 ? -60 : 60 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center text-center"
          >
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={
                    i < item.rating
                      ? "size-4 fill-champagne-300 text-champagne-300"
                      : "size-4 text-cream-200/20"
                  }
                />
              ))}
            </div>

            <p className="font-display mt-6 text-pretty text-2xl leading-snug text-cream-100 sm:text-3xl">
              “{item.quote}”
            </p>

            <footer className="mt-8 flex items-center gap-3">
              <SmartImage
                src={item.avatar_url}
                alt={item.author_name}
                seed={item.author_name}
                className="size-12 shrink-0 rounded-full border border-champagne-300/25"
              />
              <div className="text-left">
                <cite className="block not-italic text-sm font-medium text-cream-50">
                  {item.author_name}
                </cite>
                {item.author_role && (
                  <span className="block text-xs text-cream-200/40">{item.author_role}</span>
                )}
              </div>
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous testimonial"
          className="hairline grid size-10 place-items-center rounded-full text-cream-200/60 transition-all hover:border-champagne-300/50 hover:text-champagne-200"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex gap-2">
          {items.map((t, i) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setState([i, i > index ? 1 : -1])}
              aria-label={`Testimonial ${i + 1}`}
              aria-current={i === index}
              className={
                "h-1.5 rounded-full transition-all duration-400 " +
                (i === index
                  ? "w-8 bg-champagne-300"
                  : "w-1.5 bg-cream-200/25 hover:bg-cream-200/50")
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next testimonial"
          className="hairline grid size-10 place-items-center rounded-full text-cream-200/60 transition-all hover:border-champagne-300/50 hover:text-champagne-200"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
