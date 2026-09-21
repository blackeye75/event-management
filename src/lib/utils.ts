import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BookingStatus, EventType, PaymentStatus } from "@/lib/database.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number | string | null | undefined) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return inr.format(Number.isFinite(n) ? n : 0);
}

/** "₹12.9L" / "₹95K" — for cards where the full figure is too wide. */
export function formatCompactCurrency(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return "₹0";
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(n % 10_000_000 === 0 ? 0 : 1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(n % 100_000 === 0 ? 0 : 1)}L`;
  if (n >= 1_000) return `₹${Math.round(n / 1_000)}K`;
  return inr.format(n);
}

export function formatDate(value: string | Date | null | undefined, withYear = true) {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    ...(withYear ? { year: "numeric" } : {}),
  });
}

export function formatTime(value: string | null | undefined) {
  if (!value) return "—";
  const [h, m] = value.split(":");
  const hour = Number(h);
  if (!Number.isFinite(hour)) return value;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display}:${m ?? "00"} ${suffix}`;
}

export const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "wedding", label: "Wedding" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "corporate", label: "Corporate" },
  { value: "baby_shower", label: "Baby Shower" },
];

export function eventTypeLabel(value: EventType | null | undefined) {
  return EVENT_TYPES.find((t) => t.value === value)?.label ?? "Event";
}

export const BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "unpaid",
  "partial",
  "paid",
  "refunded",
  "failed",
];

export function statusTone(status: BookingStatus | PaymentStatus) {
  switch (status) {
    case "confirmed":
    case "paid":
    case "completed":
      return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    case "in_progress":
    case "partial":
      return "border-sky-400/30 bg-sky-400/10 text-sky-300";
    case "cancelled":
    case "failed":
      return "border-rose-400/30 bg-rose-400/10 text-rose-300";
    case "refunded":
      return "border-violet-400/30 bg-violet-400/10 text-violet-300";
    default:
      return "border-champagne-300/30 bg-champagne-300/10 text-champagne-200";
  }
}

export function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** GST at 18%, the rate that applies to event-management services in India. */
export const TAX_RATE = 0.18;

export function priceBreakdown(packagePrice: number, addonsTotal: number) {
  const subtotal = packagePrice + addonsTotal;
  const tax = Math.round(subtotal * TAX_RATE);
  return { subtotal, tax, total: subtotal + tax };
}
