import { ArrowRight, PhoneCall } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

export function CtaBand({ phone }: { phone: string }) {
  return (
    <section className="relative mt-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="hairline relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-800 via-ink-900 to-ink-950 px-6 py-20 text-center sm:px-16">
          <div
            aria-hidden
            className="ornament pointer-events-none absolute -bottom-1/2 left-1/2 size-[44rem] -translate-x-1/2 opacity-70"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #e8c88a 0 1px, transparent 1px 22px)",
            }}
          />

          <div className="relative">
            <Reveal>
              <span className="eyebrow justify-center">
                <span className="h-px w-8 bg-champagne-300/60" />
                Let&apos;s begin
                <span className="h-px w-8 bg-champagne-300/60" />
              </span>
            </Reveal>
            <Reveal delay={0.08}>
              <h2 className="font-display mt-6 text-balance text-4xl leading-tight sm:text-6xl">
                Your date is still <span className="text-foil italic">available.</span>
              </h2>
            </Reveal>
            <Reveal delay={0.16}>
              <p className="mx-auto mt-5 max-w-lg text-pretty text-cream-200/55">
                Tell us the occasion and we will come back within one working day with a costed
                plan — no obligation, no deposit to see it.
              </p>
            </Reveal>
            <Reveal delay={0.24}>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <ButtonLink href="/book" size="lg" className="w-full sm:w-auto">
                  Start a booking
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </ButtonLink>
                <ButtonLink
                  href={`tel:${phone.replace(/\s/g, "")}`}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <PhoneCall className="size-4" />
                  {phone}
                </ButtonLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
