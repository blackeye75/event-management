import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, MapPin, Users } from "lucide-react";
import { getBookingByRef, amountCollected } from "@/lib/bookings";
import { CheckoutPanel } from "@/components/site/checkout-panel";
import { Logo } from "@/components/site/logo";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { SmartImage } from "@/components/ui/smart-image";
import { isDemoMode } from "@/lib/payments/razorpay";
import {
  eventTypeLabel,
  formatCurrency,
  formatDate,
  formatTime,
  statusTone,
  titleCase,
} from "@/lib/utils";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({ params }: PageProps<"/checkout/[ref]">) {
  const { ref } = await params;
  const booking = await getBookingByRef(ref);
  if (!booking) notFound();

  const collected = amountCollected(booking);
  const outstanding = Math.max(0, Number(booking.total) - collected);
  const settled = booking.payment_status === "paid" || outstanding === 0;

  return (
    <div className="min-h-svh">
      <header className="border-b border-champagne-300/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-6 sm:px-8">
          <Logo />
          <Link href="/account" className="text-sm text-cream-200/50 hover:text-champagne-200">
            My bookings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-center gap-3">
          <Badge>{booking.booking_ref}</Badge>
          <Badge className={statusTone(booking.status)}>{titleCase(booking.status)}</Badge>
          <Badge className={statusTone(booking.payment_status)}>
            {titleCase(booking.payment_status)}
          </Badge>
        </div>

        <h1 className="font-display mt-6 text-balance text-4xl leading-tight sm:text-5xl">
          {settled ? (
            <>
              Your date is <span className="text-foil italic">locked in.</span>
            </>
          ) : (
            <>
              One step left — <span className="text-foil italic">secure the date.</span>
            </>
          )}
        </h1>

        <p className="mt-4 max-w-xl text-pretty text-cream-200/55">
          {settled
            ? "A planner will be in touch within one working day to start your run-of-show. Everything below stays visible in your dashboard."
            : "Pay the 25% advance to hold your date, or settle the full amount now. The balance is always payable later from your dashboard."}
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
          {/* ------------------------------------------------ Booking summary */}
          <section className="hairline overflow-hidden rounded-3xl bg-ink-900/50">
            {booking.package && (
              <div className="relative">
                <SmartImage
                  src={booking.package.hero_image_url}
                  alt={booking.package.name}
                  seed={booking.package.slug}
                  className="aspect-[16/7] w-full"
                  imgClassName="opacity-60"
                  sizes="(max-width: 1024px) 100vw, 55vw"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent"
                />
                <h2 className="font-display absolute bottom-5 left-6 text-2xl text-cream-50">
                  {booking.package.name}
                </h2>
              </div>
            )}

            <div className="space-y-5 p-6">
              {!booking.package && (
                <h2 className="font-display text-2xl text-cream-50">
                  Custom {eventTypeLabel(booking.event_type)}
                </h2>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail icon={CalendarDays} label="Date & time">
                  {formatDate(booking.event_date)} · {formatTime(booking.event_time)}
                </Detail>
                <Detail icon={Users} label="Guests">
                  {booking.guest_count}
                </Detail>
                <Detail icon={MapPin} label="Where">
                  {[booking.venue_name, booking.city].filter(Boolean).join(", ") || "To be decided"}
                </Detail>
                <Detail icon={CheckCircle2} label="Occasion">
                  {eventTypeLabel(booking.event_type)}
                </Detail>
              </div>

              {booking.booking_services.length > 0 && (
                <div className="border-t border-champagne-300/12 pt-5">
                  <h3 className="text-[0.62rem] uppercase tracking-[0.22em] text-cream-200/35">
                    Add-ons
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {booking.booking_services.map((s) => (
                      <li key={s.id} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate text-cream-200/65">
                          {s.name}
                          {s.quantity > 1 && (
                            <span className="ml-1.5 text-xs text-cream-200/35">× {s.quantity}</span>
                          )}
                        </span>
                        <span className="shrink-0 text-cream-100">
                          {formatCurrency(s.line_total)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {booking.notes && (
                <div className="border-t border-champagne-300/12 pt-5">
                  <h3 className="text-[0.62rem] uppercase tracking-[0.22em] text-cream-200/35">
                    Your notes
                  </h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-cream-200/55">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ------------------------------------------------------- Payment */}
          <aside className="lg:sticky lg:top-8 lg:self-start">
            {settled ? (
              <div className="glass rounded-3xl p-7 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/10">
                  <CheckCircle2 className="size-6 text-emerald-300" />
                </span>
                <h2 className="font-display mt-5 text-2xl">Paid in full</h2>
                <p className="mt-2 text-sm text-cream-200/50">
                  {formatCurrency(collected)} received against {booking.booking_ref}.
                </p>
                <ButtonLink href="/account" size="lg" className="mt-7 w-full">
                  Go to my bookings
                </ButtonLink>
              </div>
            ) : (
              <CheckoutPanel
                bookingRef={booking.booking_ref}
                total={Number(booking.total)}
                packagePrice={Number(booking.package_price)}
                addonsTotal={Number(booking.addons_total)}
                tax={Number(booking.tax)}
                collected={collected}
                demo={isDemoMode}
              />
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}

function Detail({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-champagne-400" />
      <div className="min-w-0">
        <div className="text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">{label}</div>
        <div className="mt-1 text-pretty text-sm text-cream-100">{children}</div>
      </div>
    </div>
  );
}
