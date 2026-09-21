"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import type { SiteSettings } from "@/lib/database.types";

/** Counts from 0 to `to` once the block scrolls into view. */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 1600;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      // easeOutExpo, so the number settles rather than stopping dead
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setValue(Math.round(eased * to));
      if (p < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

export function Stats({ settings }: { settings: SiteSettings }) {
  const items = [
    { value: settings.events_count, suffix: "+", label: "Events delivered" },
    { value: settings.cities_count, suffix: "", label: "Cities covered" },
    { value: settings.years_count, suffix: "", label: "Years in the trade" },
    { value: 98, suffix: "%", label: "Would book again" },
  ];

  return (
    <section className="relative border-y border-champagne-300/10 bg-ink-900/30">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px px-5 sm:px-8 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="px-4 py-12 text-center lg:py-16">
            <div className="font-display text-4xl text-foil sm:text-5xl lg:text-6xl">
              <Counter to={item.value} suffix={item.suffix} />
            </div>
            <div className="mt-3 text-[0.68rem] uppercase tracking-[0.24em] text-cream-200/40">
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
