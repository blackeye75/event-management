"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown, Sparkles, Star } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import type { SiteSettings } from "@/lib/database.types";

const FRAMES = [
  { src: "1519225421980-715cb0215aed", label: "Weddings", cls: "left-[4%] top-[18%] w-40 sm:w-52" },
  { src: "1530103862676-de8c9debad1d", label: "Birthdays", cls: "right-[5%] top-[12%] w-36 sm:w-48" },
  { src: "1470229722913-7ea0a0e4b5f5", label: "Sangeet", cls: "right-[9%] bottom-[14%] w-40 sm:w-56" },
  { src: "1555244162-803834f70033", label: "Catering", cls: "left-[7%] bottom-[16%] w-36 sm:w-44" },
];

export function Hero({ settings }: { settings: SiteSettings }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const titleY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const framesY = useTransform(scrollYProgress, [0, 1], [0, -180]);

  // Split the headline so the last two words can carry the foil treatment.
  const words = settings.hero_title.trim().split(" ");
  const head = words.slice(0, -2).join(" ");
  const tail = words.slice(-2).join(" ");

  return (
    <section ref={ref} className="relative min-h-[100svh] overflow-hidden pt-20">
      {/* Atmosphere */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="ornament absolute -top-1/4 left-1/2 size-[60rem] -translate-x-1/2 opacity-60" />
        <div
          className="absolute inset-0 opacity-[0.045]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,200,138,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(232,200,138,.7) 1px, transparent 1px)",
            backgroundSize: "88px 88px",
            maskImage: "radial-gradient(70% 55% at 50% 40%, #000 30%, transparent 78%)",
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-ink-950 to-transparent" />
      </div>

      {/* Floating gallery frames */}
      <motion.div style={{ y: framesY }} aria-hidden className="absolute inset-0 hidden md:block">
        {FRAMES.map((f, i) => (
          <motion.figure
            key={f.label}
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.5 + i * 0.13, ease: [0.16, 1, 0.3, 1] }}
            className={`absolute ${f.cls}`}
          >
            <div
              className="animate-float"
              style={{ animationDelay: `${i * 1.4}s`, animationDuration: `${7 + i}s` }}
            >
              <SmartImage
                src={`https://images.unsplash.com/photo-${f.src}?auto=format&fit=crop&w=500&q=80`}
                alt=""
                seed={f.label}
                className="aspect-[3/4] rounded-2xl border border-champagne-300/20 shadow-[0_30px_70px_-30px_rgba(0,0,0,.9)]"
                imgClassName="opacity-70"
              />
              <figcaption className="mt-2 text-center text-[0.6rem] uppercase tracking-[0.3em] text-champagne-300/50">
                {f.label}
              </figcaption>
            </div>
          </motion.figure>
        ))}
      </motion.div>

      {/* Copy */}
      <motion.div
        style={{ y: titleY, opacity: titleOpacity }}
        className="relative mx-auto flex min-h-[calc(100svh-5rem)] max-w-4xl flex-col items-center justify-center px-5 py-16 text-center sm:px-8"
      >
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="glass flex items-center gap-2.5 rounded-full px-4 py-2 text-xs"
        >
          <span className="relative flex size-2">
            <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-champagne-300" />
            <span className="relative inline-flex size-2 rounded-full bg-champagne-300" />
          </span>
          <span className="text-cream-200/70">
            Now booking {new Date().getFullYear()}–{String(new Date().getFullYear() + 1).slice(2)}{" "}
            wedding season
          </span>
        </motion.div>

        <h1 className="font-display mt-8 text-balance text-5xl leading-[0.98] sm:text-7xl lg:text-[5.5rem]">
          {head.split(" ").map((w, i) => (
            <motion.span
              key={`${w}-${i}`}
              initial={{ opacity: 0, y: 44, rotateX: -60 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.9, delay: 0.1 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className="mr-[0.25em] inline-block"
            >
              {w}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, y: 44 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
            className="text-foil inline-block italic"
          >
            {tail}
          </motion.span>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-cream-200/60 sm:text-lg"
        >
          {settings.hero_subtitle}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.72 }}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <ButtonLink href="/book" size="lg" className="w-full sm:w-auto">
            <Sparkles className="size-4" />
            Plan my event
          </ButtonLink>
          <ButtonLink href="/packages" variant="outline" size="lg" className="w-full sm:w-auto">
            Browse packages
          </ButtonLink>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.95 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-cream-200/40"
        >
          <span className="inline-flex items-center gap-1.5">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-3.5 fill-champagne-300 text-champagne-300" />
              ))}
            </span>
            4.9 from 480+ families
          </span>
          <span>{settings.events_count.toLocaleString("en-IN")}+ events delivered</span>
          <span>{settings.years_count} years on the ground</span>
        </motion.div>
      </motion.div>

      <motion.a
        href="#packages"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        aria-label="Scroll to packages"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 text-champagne-300/50 transition-colors hover:text-champagne-200 sm:block"
      >
        <ArrowDown className="size-5 animate-bounce" />
      </motion.a>
    </section>
  );
}
