import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/reveal";

/** The shared masthead for every inner page. */
export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="relative overflow-hidden pb-14 pt-36 sm:pt-44">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="ornament absolute -top-1/3 left-1/2 size-[48rem] -translate-x-1/2 opacity-50" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(232,200,138,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(232,200,138,.7) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(65% 70% at 50% 30%, #000 20%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <span className="eyebrow">
            <span className="h-px w-8 bg-champagne-300/60" />
            {eyebrow}
            <span className="h-px w-8 bg-champagne-300/60" />
          </span>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="font-display mt-5 text-balance text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            {title}
            {accent && <span className="text-foil italic"> {accent}</span>}
          </h1>
        </Reveal>
        {description && (
          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-pretty leading-relaxed text-cream-200/55">
              {description}
            </p>
          </Reveal>
        )}
        {children && <Reveal delay={0.24}>{children}</Reveal>}
      </div>
    </header>
  );
}
