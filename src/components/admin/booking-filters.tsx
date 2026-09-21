"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { BOOKING_STATUSES, cn, titleCase } from "@/lib/utils";
import type { BookingStatus } from "@/lib/database.types";
import { Input } from "@/components/ui/field";

export function BookingFilters({
  active,
  counts,
  total,
  query,
}: {
  active?: BookingStatus;
  counts: Record<string, number>;
  total: number;
  query: string;
}) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-2">
        <Chip href="/admin/bookings" active={!active}>
          All <span className="opacity-50">{total}</span>
        </Chip>
        {BOOKING_STATUSES.map((s) => (
          <Chip key={s} href={`/admin/bookings?status=${s}`} active={active === s}>
            {titleCase(s)} <span className="opacity-50">{counts[s] ?? 0}</span>
          </Chip>
        ))}
      </div>

      <form
        className="relative ml-auto w-full sm:w-64"
        onSubmit={(e) => {
          e.preventDefault();
          const value = new FormData(e.currentTarget).get("q");
          const search = String(value ?? "").trim();
          router.push(search ? `/admin/bookings?q=${encodeURIComponent(search)}` : "/admin/bookings");
        }}
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream-200/30" />
        <Input
          name="q"
          defaultValue={query}
          placeholder="Reference, name, phone…"
          className="pl-10"
          aria-label="Search bookings"
        />
      </form>
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs transition-all duration-300",
        active
          ? "bg-champagne-300 text-ink-950"
          : "hairline text-cream-200/60 hover:border-champagne-300/40 hover:text-cream-50",
      )}
    >
      {children}
    </Link>
  );
}
