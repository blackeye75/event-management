"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * A styled checkbox. The real <input> stays in the DOM (visually hidden) so
 * the value posts with the surrounding form and keyboard focus still works.
 */
export function Switch({
  name,
  label,
  hint,
  defaultChecked = false,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked?: boolean;
}) {
  const [on, setOn] = useState(defaultChecked);

  return (
    <label className="flex cursor-pointer items-start gap-3.5">
      <input
        type="checkbox"
        name={name}
        checked={on}
        onChange={(e) => setOn(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border p-0.5 transition-colors duration-300 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-champagne-300",
          on ? "border-champagne-300/60 bg-champagne-300/25" : "border-cream-200/20 bg-ink-950",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
          className={cn(
            "size-4 rounded-full transition-colors",
            on ? "ml-auto bg-champagne-300" : "bg-cream-200/35",
          )}
        />
      </span>
      <span className="min-w-0">
        <span className="block text-sm text-cream-100">{label}</span>
        {hint && <span className="block text-xs text-cream-200/40">{hint}</span>}
      </span>
    </label>
  );
}
