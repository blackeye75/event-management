import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { adminOverview } from "@/lib/admin";
import { AdminHeading, Panel, StatCard, TableWrap, Td, Th } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import {
  eventTypeLabel,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  statusTone,
  titleCase,
} from "@/lib/utils";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminDashboard() {
  const { totals, bookings, recent } = await adminOverview();

  const outstanding = Math.max(0, totals.revenue - totals.collected);
  const upcoming = [...bookings]
    .filter((b) => new Date(b.event_date) >= startOfToday())
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 5);

  return (
    <>
      <AdminHeading
        title="Dashboard"
        description="Everything booked, collected and waiting on you, as of right now."
        action={
          <ButtonLink href="/admin/packages/new" size="sm">
            <Plus className="size-4" />
            New package
          </ButtonLink>
        }
      />

      <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Booked value"
          value={formatCompactCurrency(totals.revenue)}
          hint={`${totals.bookings} bookings all time`}
          tone="gold"
        />
        <StatCard
          label="Collected"
          value={formatCompactCurrency(totals.collected)}
          hint={`${formatCompactCurrency(outstanding)} outstanding`}
        />
        <StatCard
          label="Awaiting confirmation"
          value={String(totals.pending)}
          hint="pending bookings"
          href="/admin/bookings?status=pending"
        />
        <StatCard
          label="New enquiries"
          value={String(totals.enquiries)}
          hint="unhandled"
          href="/admin/enquiries"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <StatCard label="Upcoming events" value={String(totals.upcoming)} />
        <StatCard label="Packages live" value={String(totals.packages)} href="/admin/packages" />
        <StatCard label="Services live" value={String(totals.services)} href="/admin/services" />
      </div>

      {/* ---------------------------------------------------------- Next up */}
      <section className="mt-14">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Next five events</h2>
          <Link
            href="/admin/bookings"
            className="group inline-flex items-center gap-1.5 text-sm text-champagne-200"
          >
            All bookings
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {upcoming.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((b) => (
              <Panel key={b.id} className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.62rem] uppercase tracking-[0.18em] text-cream-200/35">
                    {b.booking_ref}
                  </span>
                  <Badge className={statusTone(b.status)}>{titleCase(b.status)}</Badge>
                </div>
                <p className="font-display mt-3 truncate text-lg text-cream-50">
                  {b.package?.name ?? `Custom ${eventTypeLabel(b.event_type)}`}
                </p>
                <p className="mt-1 text-xs text-cream-200/45">
                  {formatDate(b.event_date)} · {b.guest_count} guests · {b.city ?? "—"}
                </p>
                <p className="mt-3 text-sm text-champagne-200">{formatCurrency(b.total)}</p>
              </Panel>
            ))}
          </div>
        ) : (
          <Panel className="mt-5 px-6 py-12 text-center text-sm text-cream-200/45">
            Nothing on the calendar yet.
          </Panel>
        )}
      </section>

      {/* -------------------------------------------------------- Latest in */}
      <section className="mt-14">
        <h2 className="font-display text-2xl">Latest bookings</h2>

        {recent.length ? (
          <div className="mt-5">
            <TableWrap>
              <thead>
                <tr>
                  <Th>Reference</Th>
                  <Th>Customer</Th>
                  <Th>Event</Th>
                  <Th>Date</Th>
                  <Th className="text-right">Total</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-champagne-300/[0.03]">
                    <Td>
                      <Link
                        href={`/admin/bookings?q=${b.booking_ref}`}
                        className="text-champagne-200/85 hover:text-champagne-100"
                      >
                        {b.booking_ref}
                      </Link>
                    </Td>
                    <Td>
                      <div className="truncate text-cream-100">{b.contact_name}</div>
                      <div className="truncate text-xs text-cream-200/35">{b.contact_phone}</div>
                    </Td>
                    <Td className="text-cream-200/65">
                      {b.package?.name ?? eventTypeLabel(b.event_type)}
                    </Td>
                    <Td className="whitespace-nowrap text-cream-200/65">
                      {formatDate(b.event_date)}
                    </Td>
                    <Td className="text-right text-cream-100">{formatCurrency(b.total)}</Td>
                    <Td>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge className={statusTone(b.status)}>{titleCase(b.status)}</Badge>
                        <Badge className={statusTone(b.payment_status)}>
                          {titleCase(b.payment_status)}
                        </Badge>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          </div>
        ) : (
          <Panel className="mt-5 px-6 py-12 text-center text-sm text-cream-200/45">
            No bookings have come in yet.
          </Panel>
        )}
      </section>
    </>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
