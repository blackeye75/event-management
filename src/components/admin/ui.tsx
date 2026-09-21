import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-champagne-300/10 pb-7">
      <div>
        <h1 className="font-display text-4xl leading-tight">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-pretty text-sm text-cream-200/50">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("hairline rounded-2xl bg-ink-900/45", className)}>{children}</div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Panel className="px-6 py-16 text-center">
      <p className="font-display text-2xl text-cream-50">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-cream-200/45">{description}</p>
      {action && <div className="mt-7">{action}</div>}
    </Panel>
  );
}

/** Horizontally scrollable table wrapper — admin tables are wide by nature. */
export function TableWrap({ children }: { children: ReactNode }) {
  return (
    <Panel className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46rem] text-sm">{children}</table>
      </div>
    </Panel>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={cn(
        "border-b border-champagne-300/10 px-5 py-3.5 text-left text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-cream-200/40",
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <td className={cn("border-b border-champagne-300/[0.07] px-5 py-4 align-middle", className)}>
      {children}
    </td>
  );
}

export function StatCard({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "gold" | "plain";
}) {
  const body = (
    <div
      className={cn(
        "hairline h-full rounded-2xl bg-ink-900/45 px-6 py-6 transition-all duration-400",
        href && "hover:-translate-y-0.5 hover:border-champagne-300/35 hover:bg-ink-800/50",
      )}
    >
      <div className="text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">{label}</div>
      <div
        className={cn(
          "font-display mt-2 text-3xl",
          tone === "gold" ? "text-foil" : "text-cream-50",
        )}
      >
        {value}
      </div>
      {hint && <div className="mt-1.5 text-xs text-cream-200/35">{hint}</div>}
    </div>
  );

  return href ? <Link href={href}>{body}</Link> : body;
}
