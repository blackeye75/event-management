import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-champagne-300 disabled:cursor-not-allowed disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-champagne-400 via-champagne-200 to-champagne-400 bg-[length:200%_100%] text-ink-950 shadow-[0_10px_40px_-12px] shadow-champagne-400/60 hover:bg-[position:100%_0] hover:shadow-[0_16px_50px_-10px] hover:shadow-champagne-300/70",
  outline:
    "hairline text-cream-100 hover:border-champagne-300/60 hover:bg-champagne-300/10 hover:text-champagne-100",
  ghost: "text-cream-200/80 hover:bg-cream-100/5 hover:text-champagne-200",
  danger:
    "border border-rose-400/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20 hover:text-rose-100",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-sm sm:text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size; children: ReactNode }) {
  return (
    <Link className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
