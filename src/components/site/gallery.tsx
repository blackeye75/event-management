"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";

export type GalleryItem = { src: string; alt: string; seed?: string; caption?: string };

/** Masonry-ish grid with a keyboard-navigable lightbox. */
export function Gallery({ items, className }: { items: GalleryItem[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? null : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, step]);

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3", className)}>
        {items.map((item, i) => (
          <motion.button
            key={`${item.src}-${i}`}
            type="button"
            onClick={() => setOpen(i)}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: (i % 6) * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group relative overflow-hidden rounded-2xl border border-champagne-300/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-champagne-300"
            aria-label={`Open ${item.alt}`}
          >
            <SmartImage
              src={item.src}
              alt={item.alt}
              seed={item.seed ?? item.alt}
              className={cn("w-full", i % 7 === 0 ? "aspect-[3/4]" : "aspect-square")}
              imgClassName="opacity-80 group-hover:scale-105 group-hover:opacity-100"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent opacity-0 transition-opacity duration-400 group-hover:opacity-100"
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/95 p-4 backdrop-blur-md sm:p-10"
          >
            <button
              type="button"
              onClick={() => setOpen(null)}
              aria-label="Close"
              className="hairline absolute right-5 top-5 grid size-11 place-items-center rounded-full text-cream-100 transition-colors hover:border-champagne-300/50 hover:text-champagne-200"
            >
              <X className="size-5" />
            </button>

            {items.length > 1 && (
              <>
                <NavButton side="left" onClick={() => step(-1)} />
                <NavButton side="right" onClick={() => step(1)} />
              </>
            )}

            <motion.div
              key={open}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full w-full max-w-4xl"
            >
              <SmartImage
                src={items[open].src}
                alt={items[open].alt}
                seed={items[open].seed ?? items[open].alt}
                className="aspect-[3/2] w-full rounded-2xl border border-champagne-300/20"
                imgClassName="object-contain"
              />
              <p className="mt-4 text-center text-sm text-cream-200/50">
                {items[open].caption ?? items[open].alt}
                <span className="ml-3 text-cream-200/30">
                  {open + 1} / {items.length}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function NavButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={cn(
        "hairline absolute top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink-900/70 text-cream-100 transition-colors hover:border-champagne-300/50 hover:text-champagne-200",
        side === "left" ? "left-3 sm:left-8" : "right-3 sm:right-8",
      )}
    >
      <Icon className="size-5" />
    </button>
  );
}
