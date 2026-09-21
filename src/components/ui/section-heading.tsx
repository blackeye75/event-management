import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  accent?: string;
  description?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" ? "mx-auto text-center" : "text-left",
        className,
      )}
    >
      {eyebrow && (
        <Reveal>
          <span className="eyebrow">
            <span className="h-px w-8 bg-champagne-300/60" />
            {eyebrow}
            {align === "center" && <span className="h-px w-8 bg-champagne-300/60" />}
          </span>
        </Reveal>
      )}
      <Reveal delay={0.08}>
        <h2 className="font-display mt-5 text-balance text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
          {title}
          {accent && <span className="text-foil italic"> {accent}</span>}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.16}>
          <p className="mt-5 text-pretty text-base leading-relaxed text-cream-200/60 sm:text-lg">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
