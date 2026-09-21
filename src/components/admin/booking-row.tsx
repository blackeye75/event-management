"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import {
  recordOfflinePayment,
  updateBookingStatus,
  type ActionResult,
} from "@/lib/actions/admin";
import { Td } from "@/components/admin/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import { Toast } from "@/components/ui/toast";
import { amountCollected, type BookingDetail } from "@/lib/booking-types";
import {
  BOOKING_STATUSES,
  PAYMENT_STATUSES,
  eventTypeLabel,
  formatCurrency,
  formatDate,
  formatTime,
  statusTone,
  titleCase,
} from "@/lib/utils";

export function BookingRow({ booking }: { booking: BookingDetail }) {
  const [open, setOpen] = useState(false);
  const collected = amountCollected(booking);
  const outstanding = Math.max(0, Number(booking.total) - collected);

  return (
    <>
      <tr className="transition-colors hover:bg-champagne-300/[0.03]">
        <Td>
          <span className="text-champagne-200/85">{booking.booking_ref}</span>
          <div className="text-xs text-cream-200/30">{formatDate(booking.created_at)}</div>
        </Td>
        <Td>
          <div className="truncate text-cream-100">{booking.contact_name}</div>
          <div className="truncate text-xs text-cream-200/35">{booking.contact_phone}</div>
        </Td>
        <Td>
          <div className="truncate text-cream-200/70">
            {booking.package?.name ?? `Custom ${eventTypeLabel(booking.event_type)}`}
          </div>
          <div className="whitespace-nowrap text-xs text-cream-200/35">
            {formatDate(booking.event_date)} · {booking.guest_count} guests
          </div>
        </Td>
        <Td className="whitespace-nowrap text-right text-cream-100">
          {formatCurrency(booking.total)}
        </Td>
        <Td className="whitespace-nowrap text-right">
          <span className={collected > 0 ? "text-emerald-300" : "text-cream-200/35"}>
            {formatCurrency(collected)}
          </span>
          {outstanding > 0 && (
            <div className="text-xs text-cream-200/30">{formatCurrency(outstanding)} due</div>
          )}
        </Td>
        <Td>
          <div className="flex flex-wrap gap-1.5">
            <Badge className={statusTone(booking.status)}>{titleCase(booking.status)}</Badge>
            <Badge className={statusTone(booking.payment_status)}>
              {titleCase(booking.payment_status)}
            </Badge>
          </div>
        </Td>
        <Td className="text-right">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Hide details" : "Show details"}
            className="hairline grid size-8 place-items-center rounded-lg text-cream-200/55 transition-colors hover:border-champagne-300/40 hover:text-champagne-200"
          >
            <ChevronDown
              className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            />
          </button>
        </Td>
      </tr>

      <AnimatePresence initial={false}>
        {open && (
          <tr>
            <td colSpan={7} className="border-b border-champagne-300/[0.07] p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <Detail booking={booking} outstanding={outstanding} />
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

function Detail({ booking, outstanding }: { booking: BookingDetail; outstanding: number }) {
  const [payState, payAction] = useActionState<ActionResult, FormData>(recordOfflinePayment, null);

  return (
    <div className="grid gap-8 bg-ink-950/40 px-5 py-7 lg:grid-cols-3">
      {/* ------------------------------------------------------ Event detail */}
      <div>
        <h3 className="text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">Event</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <Line label="Occasion" value={eventTypeLabel(booking.event_type)} />
          <Line
            label="When"
            value={`${formatDate(booking.event_date)} · ${formatTime(booking.event_time)}`}
          />
          <Line label="Guests" value={String(booking.guest_count)} />
          <Line label="Venue" value={booking.venue_name || "—"} />
          <Line label="City" value={booking.city || "—"} />
          <Line label="Address" value={booking.venue_address || "—"} />
          <Line label="Email" value={booking.contact_email} />
        </dl>

        {booking.notes && (
          <>
            <h3 className="mt-6 text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">
              Customer notes
            </h3>
            <p className="mt-2 text-pretty text-sm leading-relaxed text-cream-200/55">
              {booking.notes}
            </p>
          </>
        )}
      </div>

      {/* ---------------------------------------------------------- Line items */}
      <div>
        <h3 className="text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">Order</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <Line label="Package" value={formatCurrency(booking.package_price)} />
          {booking.booking_services.map((s) => (
            <Line
              key={s.id}
              label={`${s.name}${s.quantity > 1 ? ` × ${s.quantity}` : ""}`}
              value={formatCurrency(s.line_total)}
            />
          ))}
          <Line label="GST (18%)" value={formatCurrency(booking.tax)} />
          <div className="flex items-baseline justify-between border-t border-champagne-300/12 pt-2.5">
            <dt className="text-cream-100">Total</dt>
            <dd className="text-champagne-200">{formatCurrency(booking.total)}</dd>
          </div>
        </dl>

        {booking.payments.length > 0 && (
          <>
            <h3 className="mt-6 text-[0.62rem] uppercase tracking-[0.2em] text-cream-200/35">
              Payments
            </h3>
            <ul className="mt-3 space-y-2 text-xs">
              {booking.payments.map((p) => (
                <li key={p.id} className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-cream-200/50">
                    {formatDate(p.created_at)} · {p.provider}
                    {p.method ? ` · ${p.method}` : ""}
                  </span>
                  <span
                    className={
                      p.status === "paid" ? "shrink-0 text-emerald-300" : "shrink-0 text-cream-200/35"
                    }
                  >
                    {formatCurrency(p.amount)}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* --------------------------------------------------------- Admin ops */}
      <div className="space-y-6">
        <form action={updateBookingStatus} className="space-y-4">
          <input type="hidden" name="id" value={booking.id} />

          <Field label="Booking status" htmlFor={`status-${booking.id}`}>
            <Select id={`status-${booking.id}`} name="status" defaultValue={booking.status}>
              {BOOKING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Payment status" htmlFor={`payment-${booking.id}`}>
            <Select
              id={`payment-${booking.id}`}
              name="payment_status"
              defaultValue={booking.payment_status}
            >
              {PAYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </Select>
          </Field>

          <SaveButton label="Update statuses" />
        </form>

        {outstanding > 0 && (
          <form action={payAction} className="space-y-4 border-t border-champagne-300/10 pt-6">
            <input type="hidden" name="booking_id" value={booking.id} />

            <Field
              label="Record an offline payment"
              htmlFor={`amount-${booking.id}`}
              hint={`${formatCurrency(outstanding)} due`}
            >
              <Input
                id={`amount-${booking.id}`}
                name="amount"
                type="number"
                min={1}
                step={1}
                defaultValue={outstanding}
              />
            </Field>

            <Field label="Method" htmlFor={`method-${booking.id}`}>
              <Select id={`method-${booking.id}`} name="method" defaultValue="bank transfer">
                <option value="bank transfer">Bank transfer</option>
                <option value="upi">UPI</option>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
              </Select>
            </Field>

            {payState && (
              <Toast state={{ tone: payState.ok ? "ok" : "error", message: payState.message }} />
            )}

            <SaveButton label="Record payment" variant="outline" />
          </form>
        )}
      </div>
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="shrink-0 text-cream-200/40">{label}</dt>
      <dd className="truncate text-right text-cream-200/75">{value}</dd>
    </div>
  );
}

function SaveButton({
  label,
  variant = "primary",
}: {
  label: string;
  variant?: "primary" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending} className="w-full">
      {pending ? "Saving…" : label}
    </Button>
  );
}
