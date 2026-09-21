import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em]",
        "border-champagne-300/30 bg-champagne-300/10 text-champagne-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
