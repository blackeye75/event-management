import type { SVGProps } from "react";

/**
 * lucide-react no longer ships brand marks, so the three we need are inlined
 * here as simple single-path glyphs that inherit `currentColor`.
 */
type IconProps = SVGProps<SVGSVGElement>;

export function InstagramIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M15.5 3h-2.3A4.2 4.2 0 0 0 9 7.2V10H6.5v3.2H9V21h3.2v-7.8h2.6l.7-3.2h-3.3V7.6c0-.8.4-1.4 1.3-1.4h2z" />
    </svg>
  );
}

export function YoutubeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <rect x="2" y="5" width="20" height="14" rx="4.5" />
      <path d="m10.2 9.2 4.6 2.8-4.6 2.8z" fill="currentColor" stroke="none" />
    </svg>
  );
}
