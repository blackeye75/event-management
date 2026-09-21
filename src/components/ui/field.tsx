import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-xl border border-champagne-300/15 bg-ink-900/70 px-4 py-3 text-sm text-cream-100 placeholder:text-cream-200/30 transition-colors outline-none focus:border-champagne-300/60 focus:bg-ink-900 focus:ring-2 focus:ring-champagne-300/15 disabled:opacity-50";

export function Label({
  children,
  htmlFor,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  hint?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 flex items-baseline justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-cream-200/55"
    >
      <span>{children}</span>
      {hint && <span className="text-[0.65rem] normal-case tracking-normal text-cream-200/35">{hint}</span>}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(control, className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(control, "min-h-28 resize-y", className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <select className={cn(control, "appearance-none pr-10", className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} hint={hint}>
        {label}
      </Label>
      {children}
      {error && <p className="mt-1.5 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
