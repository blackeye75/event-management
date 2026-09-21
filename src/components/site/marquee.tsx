const WORDS = [
  "Weddings",
  "Birthdays",
  "Sangeet Nights",
  "Anniversaries",
  "Corporate Galas",
  "Baby Showers",
  "Receptions",
  "Mehendi",
];

/** Infinite gold ticker. The list is duplicated so the keyframe can loop at -50%. */
export function Marquee() {
  return (
    <div className="relative flex overflow-hidden border-y border-champagne-300/10 bg-ink-900/40 py-5">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-950 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-950 to-transparent"
      />
      <div className="animate-marquee flex shrink-0 items-center gap-10 pr-10">
        {[...WORDS, ...WORDS].map((word, i) => (
          <span key={i} className="flex shrink-0 items-center gap-10">
            <span className="font-display text-2xl tracking-wide text-cream-100/70 sm:text-3xl">
              {word}
            </span>
            <span className="size-1.5 rotate-45 bg-champagne-400/70" />
          </span>
        ))}
      </div>
    </div>
  );
}
