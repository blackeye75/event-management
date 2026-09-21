import type { Metadata } from "next";
import { adminListBookings } from "@/lib/admin";
import { AdminHeading, EmptyState, TableWrap, Th } from "@/components/admin/ui";
import { BookingRow } from "@/components/admin/booking-row";
import { BookingFilters } from "@/components/admin/booking-filters";
import { BOOKING_STATUSES } from "@/lib/utils";
import type { BookingStatus } from "@/lib/database.types";

export const metadata: Metadata = { title: "Bookings · Admin" };

export default async function AdminBookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  const params = await searchParams;
  const all = await adminListBookings();

  const statusParam = typeof params.status === "string" ? params.status : undefined;
  const status = BOOKING_STATUSES.includes(statusParam as BookingStatus)
    ? (statusParam as BookingStatus)
    : undefined;

  const q = (typeof params.q === "string" ? params.q : "").trim().toLowerCase();

  const bookings = all.filter((b) => {
    if (status && b.status !== status) return false;
    if (!q) return true;
    return [b.booking_ref, b.contact_name, b.contact_email, b.contact_phone, b.city]
      .filter(Boolean)
      .some((field) => String(field).toLowerCase().includes(q));
  });

  const counts = all.reduce<Record<string, number>>((acc, b) => {
    acc[b.status] = (acc[b.status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <AdminHeading
        title="Bookings"
        description="Move a booking through its lifecycle, record payments taken offline and see exactly what each customer ordered."
      />

      <div className="mt-8">
        <BookingFilters active={status} counts={counts} total={all.length} query={q} />
      </div>

      {bookings.length ? (
        <div className="mt-6">
          <TableWrap>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Customer</Th>
                <Th>Event</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right">Collected</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </tbody>
          </TableWrap>
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            title="Nothing matches"
            description={
              all.length
                ? "Try a different status or clear the search."
                : "Bookings placed on the site will appear here."
            }
          />
        </div>
      )}
    </>
  );
}
