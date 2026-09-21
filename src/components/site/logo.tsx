import Link from "next/link";
import { cn } from "@/lib/utils";

/** The monogram: two interlocking "junction" strokes inside a gold ring. */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)}>
      <span className="relative grid size-10 shrink-0 place-items-center">
        <span className="ornament absolute inset-0 scale-150 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <svg viewBox="0 0 44 44" className="size-10" aria-hidden>
          <circle
            cx="22"
            cy="22"
            r="20"
            fill="none"
            stroke="url(#fj-gold)"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <path
            d="M14 13h15M14 13v18M14 22h10"
            fill="none"
            stroke="url(#fj-gold)"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <path
            d="M31 13v14.5a3.5 3.5 0 0 1-3.5 3.5H25"
            fill="none"
            stroke="url(#fj-gold)"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="fj-gold" x1="0" y1="0" x2="44" y2="44">
              <stop offset="0%" stopColor="#a8823a" />
              <stop offset="45%" stopColor="#f0dcb3" />
              <stop offset="100%" stopColor="#c9a24a" />
            </linearGradient>
          </defs>
        </svg>
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="font-display block text-lg tracking-wide text-cream-50">
            Function <span className="text-foil italic">Junction</span>
          </span>
          <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.34em] text-cream-200/40">
            Event Atelier
          </span>
        </span>
      )}
    </Link>
  );
}
