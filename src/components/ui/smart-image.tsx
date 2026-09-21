"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Catalogue imagery is admin-editable and therefore arbitrary — a row may point
 * at a URL that has since 404'd. Rather than let the layout collapse, we render
 * a deterministic gradient plate derived from the item's name, so a missing
 * photo still reads as a designed surface.
 *
 * A plain <img> is used on purpose: next/image would route an unknown remote
 * host through the optimizer and fail the whole render instead of falling back.
 */
export function SmartImage({
  src,
  alt,
  seed,
  className,
  imgClassName,
  priority,
  sizes,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const hue = hashHue(seed ?? alt);
  const showImage = Boolean(src) && !failed;

  return (
    <div className={cn("relative overflow-hidden bg-ink-800", className)}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 90% at 20% 15%, hsl(${hue} 55% 34% / 0.85), transparent 60%),
                       radial-gradient(90% 80% at 85% 90%, hsl(${(hue + 48) % 360} 62% 28% / 0.9), transparent 62%),
                       linear-gradient(145deg, #15121f, #07060b)`,
        }}
      />
      {!showImage && (
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(232,200,138,.6) 0 1px, transparent 1px 14px)",
          }}
        />
      )}
      {showImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src as string}
          alt={alt}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-[transform,opacity] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}

function hashHue(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) % 360;
  // Bias away from the greens so the plates stay in the plum/wine/gold family.
  return (h % 120) + 265;
}
