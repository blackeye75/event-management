"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { Badge } from "@/components/ui/badge";
import { cancelBooking } from "@/lib/actions/bookings";
import { amountCollected, type BookingDetail } from "@/lib/booking-types";
import {
  cn,
  eventTypeLabel,
  formatCurrency,
  formatDate,
  formatTime,
  statusTone,
  titleCase,
} from "@/lib/utils";

export function BookingCard({
  booking,
  index = 0,
  muted,
}: {
  booking: BookingDetail;
  index?: number;
  muted?: boolean;
}) {
  const collected = amountCollected(booking);
  const outstanding = Math.max(0, Number(booking.total) - collected);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: Math.min(index, 5) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "hairline overflow-hidden rounded-3xl bg-ink-900/45 transition-colors duration-400 hover:border-champagne-300/30",
        muted && "opacity-60",
      )}
    >
      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
        <SmartImage
          src={booking.package?.hero_image_url}
          alt={booking.package?.name ?? eventTypeLabel(booking.event_type)}
          seed={booking.booking_ref}
          className="aspect-[16/9] w-full shrink-0 rounded-2xl sm:aspect-square sm:size-28"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] text-cream-200/35">
              {booking.booking_ref}
            </span>
            <Badge className={statusTone(booking.status)}>{titleCase(booking.status)}</Badge>
            <Badge className={statusTone(booking.payment_status)}>
              {titleCase(booking.payment_status)}
            </Badge>
          </div>

          <h3 className="font-display mt-2 truncate text-xl text-cream-50">
            {booking.package?.name ?? `Custom ${eventTypeLabel(booking.event_type)}`}
          </h3>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-cream-200/45">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-champagne-400" />
              {formatDate(booking.event_date)} · {formatTime(booking.event_time)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-champagne-400" />
              {booking.guest_count} guests
            </span>
            {booking.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5 text-champagne-400" />
                {booking.city}
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-champagne-300/10 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right">
          <div className="text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">Total</div>
          <div className="font-display mt-1 text-2xl text-champagne-200">
            {formatCurrency(booking.total)}
          </div>
          {outstanding > 0 && booking.status !== "cancelled" && (
            <div className="mt-1 text-xs text-cream-200/40">
              {formatCurrency(outstanding)} outstanding
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 sm:justify-end">
            {outstanding > 0 && booking.status !== "cancelled" ? (
              <Link
                href={`/checkout/${booking.booking_ref}`}
                className="rounded-full bg-champagne-300 px-4 py-2 text-xs font-medium text-ink-950 transition-colors hover:bg-champagne-200"
              >
                Pay {formatCurrency(outstanding)}
              </Link>
            ) : (
              <Link
                href={`/checkout/${booking.booking_ref}`}
                className="hairline rounded-full px-4 py-2 text-xs text-cream-200/65 transition-colors hover:border-champagne-300/45 hover:text-champagne-200"
              >
                View details
              </Link>
            )}

            {booking.status === "pending" && (
              <form action={cancelBooking}>
                <input type="hidden" name="booking_id" value={booking.id} />
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-xs text-cream-200/35 transition-colors hover:text-rose-300"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
