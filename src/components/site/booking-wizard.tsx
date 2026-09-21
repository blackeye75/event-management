"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, Sparkles } from "lucide-react";
import { createBooking, type BookingResult } from "@/lib/actions/bookings";
import { quoteBooking, ADVANCE_RATE } from "@/lib/pricing";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { SmartImage } from "@/components/ui/smart-image";
import { EVENT_TYPES, cn, eventTypeLabel, formatCurrency } from "@/lib/utils";
import type { EventType, Package, ServiceWithCategory } from "@/lib/database.types";

const STEPS = ["Occasion", "Details", "Add-ons", "Confirm"] as const;

export function BookingWizard({
  packages,
  services,
  defaults,
}: {
  packages: Package[];
  services: ServiceWithCategory[];
  defaults: {
    packageSlug?: string;
    serviceId?: string;
    name: string;
    email: string;
    phone: string;
  };
}) {
  const [state, action] = useActionState<BookingResult, FormData>(createBooking, null);
  const [step, setStep] = useState(0);

  const [packageSlug, setPackageSlug] = useState(defaults.packageSlug ?? "");
  const [eventType, setEventType] = useState<EventType>(
    packages.find((p) => p.slug === defaults.packageSlug)?.event_type ?? "wedding",
  );
  const [guestCount, setGuestCount] = useState(
    packages.find((p) => p.slug === defaults.packageSlug)?.guest_capacity ?? 100,
  );
  const [selected, setSelected] = useState<string[]>(
    defaults.serviceId ? [defaults.serviceId] : [],
  );

  const pkg = packages.find((p) => p.slug === packageSlug) ?? null;

  // Services already bundled into the chosen package are hidden from the
  // add-on list so nobody pays for the same DJ twice.
  const bundledIds = useMemo(
    () => new Set((pkg?.id ? (bundledFor(pkg, services) ?? []) : []).map((s) => s.id)),
    [pkg, services],
  );

  const addonCandidates = services.filter((s) => !bundledIds.has(s.id));

  const quote = useMemo(
    () =>
      quoteBooking({
        pkg,
        services: addonCandidates.filter((s) => selected.includes(s.id)),
        guestCount,
      }),
    [pkg, addonCandidates, selected, guestCount],
  );

  const choosePackage = (slug: string) => {
    setPackageSlug(slug);
    const next = packages.find((p) => p.slug === slug);
    if (next) {
      setEventType(next.event_type);
      setGuestCount(next.guest_capacity);
    }
    // Drop any add-on that the new package already bundles.
    const bundled = next ? new Set((bundledFor(next, services) ?? []).map((s) => s.id)) : new Set();
    setSelected((prev) => prev.filter((id) => !bundled.has(id)));
  };

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
      {/* Hidden inputs carry the wizard's state into the server action. */}
      <input type="hidden" name="package_slug" value={packageSlug} />
      <input type="hidden" name="event_type" value={eventType} />
      {selected.map((id) => (
        <input key={id} type="hidden" name="service_ids" value={id} />
      ))}

      <div>
        <Stepper step={step} onStep={setStep} />

        <div className="relative mt-10 min-h-[28rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <StepOccasion
                  packages={packages}
                  packageSlug={packageSlug}
                  onChoose={choosePackage}
                  eventType={eventType}
                  onEventType={setEventType}
                />
              )}
              {step === 1 && (
                <StepDetails
                  guestCount={guestCount}
                  onGuestCount={setGuestCount}
                  capacity={pkg?.guest_capacity}
                />
              )}
              {step === 2 && (
                <StepAddons
                  services={addonCandidates}
                  selected={selected}
                  onToggle={(id) =>
                    setSelected((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                    )
                  }
                  guestCount={guestCount}
                />
              )}
              {step === 3 && <StepConfirm defaults={defaults} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-champagne-300/12 pt-7">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} size="lg">
              Continue
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </Button>
          ) : (
            <SubmitButton />
          )}
        </div>

        {state && (
          <div className="mt-5">
            <Toast state={{ tone: "error", message: state.message }} />
          </div>
        )}
      </div>

      <Summary
        pkg={pkg}
        eventType={eventType}
        guestCount={guestCount}
        quote={quote}
        addonNames={addonCandidates.filter((s) => selected.includes(s.id)).map((s) => s.name)}
      />
    </form>
  );
}

/* -------------------------------------------------------------------------- */

function bundledFor(pkg: Package, services: ServiceWithCategory[]) {
  // The listing query does not join package_services, so the wizard matches on
  // the inclusion copy instead — close enough to avoid obvious duplicates.
  return services.filter((s) =>
    pkg.inclusions.some((inc) => inc.toLowerCase().includes(s.name.toLowerCase().split(" ")[0])),
  );
}

function Stepper({ step, onStep }: { step: number; onStep: (n: number) => void }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-2 gap-y-3">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i <= step && onStep(i)}
              disabled={i > step}
              className={cn(
                "flex items-center gap-2.5 rounded-full px-3.5 py-2 text-xs transition-all duration-300",
                active && "bg-champagne-300 text-ink-950",
                done && "text-champagne-200 hover:bg-champagne-300/10",
                !active && !done && "text-cream-200/35",
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-[0.6rem] font-bold",
                  active ? "bg-ink-950/15" : done ? "bg-champagne-300/20" : "bg-cream-100/10",
                )}
              >
                {done ? <Check className="size-3" /> : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-champagne-300/20 sm:w-8" />}
          </li>
        );
      })}
    </ol>
  );
}

/* ------------------------------------------------------------ step 1 */

function StepOccasion({
  packages,
  packageSlug,
  onChoose,
  eventType,
  onEventType,
}: {
  packages: Package[];
  packageSlug: string;
  onChoose: (slug: string) => void;
  eventType: EventType;
  onEventType: (t: EventType) => void;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl">What are we celebrating?</h2>
      <p className="mt-2 text-sm text-cream-200/50">
        Start from a package, or build the evening from individual services.
      </p>

      <div className="mt-7 flex flex-wrap gap-2">
        {EVENT_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => onEventType(t.value)}
            className={cn(
              "rounded-full px-4 py-2 text-xs transition-all duration-300",
              eventType === t.value
                ? "bg-champagne-300 text-ink-950"
                : "hairline text-cream-200/60 hover:border-champagne-300/40 hover:text-cream-50",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {packages
          .filter((p) => p.event_type === eventType)
          .map((p) => {
            const active = p.slug === packageSlug;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onChoose(active ? "" : p.slug)}
                className={cn(
                  "group flex gap-4 rounded-2xl border p-3 text-left transition-all duration-400",
                  active
                    ? "border-champagne-300/70 bg-champagne-300/[0.08]"
                    : "border-champagne-300/12 bg-ink-900/40 hover:border-champagne-300/35",
                )}
              >
                <SmartImage
                  src={p.hero_image_url}
                  alt={p.name}
                  seed={p.slug}
                  className="size-20 shrink-0 rounded-xl"
                  imgClassName="group-hover:scale-105"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-cream-50">{p.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-cream-200/45">{p.tagline}</p>
                  <p className="mt-2 text-sm text-champagne-200">
                    {formatCurrency(p.sale_price ?? p.base_price)}
                  </p>
                </div>
                {active && (
                  <span className="grid size-6 shrink-0 place-items-center self-start rounded-full bg-champagne-300 text-ink-950">
                    <Check className="size-3.5" />
                  </span>
                )}
              </button>
            );
          })}

        <button
          type="button"
          onClick={() => onChoose("")}
          className={cn(
            "flex min-h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-4 text-center transition-all duration-400",
            packageSlug === ""
              ? "border-champagne-300/70 bg-champagne-300/[0.08]"
              : "border-champagne-300/20 hover:border-champagne-300/45",
          )}
        >
          <Sparkles className="size-5 text-champagne-300" />
          <span className="text-sm text-cream-50">Build from scratch</span>
          <span className="text-xs text-cream-200/40">Pick individual services instead</span>
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ step 2 */

function StepDetails({
  guestCount,
  onGuestCount,
  capacity,
}: {
  guestCount: number;
  onGuestCount: (n: number) => void;
  capacity?: number;
}) {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const min = today.toISOString().slice(0, 10);

  return (
    <div>
      <h2 className="font-display text-3xl">When and where?</h2>
      <p className="mt-2 text-sm text-cream-200/50">
        We hold your date free for 48 hours once the booking is in.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Event date" htmlFor="event_date">
          <Input id="event_date" name="event_date" type="date" required min={min} />
        </Field>

        <Field label="Start time" htmlFor="event_time">
          <Input id="event_time" name="event_time" type="time" required defaultValue="18:00" />
        </Field>

        <Field
          label="Guests"
          htmlFor="guest_count"
          hint={capacity ? `package covers ${capacity}` : undefined}
          className="sm:col-span-2"
        >
          <div className="flex items-center gap-3">
            <StepperButton onClick={() => onGuestCount(Math.max(1, guestCount - 10))}>
              <Minus className="size-4" />
            </StepperButton>
            <Input
              id="guest_count"
              name="guest_count"
              type="number"
              min={1}
              max={5000}
              required
              value={guestCount}
              onChange={(e) => onGuestCount(Number(e.target.value) || 1)}
              className="text-center"
            />
            <StepperButton onClick={() => onGuestCount(Math.min(5000, guestCount + 10))}>
              <Plus className="size-4" />
            </StepperButton>
          </div>
        </Field>

        <Field label="City" htmlFor="city">
          <Input id="city" name="city" required placeholder="Mumbai" autoComplete="address-level2" />
        </Field>

        <Field label="Venue" htmlFor="venue_name" hint="if you have one">
          <Input id="venue_name" name="venue_name" placeholder="The Taj Lands End" />
        </Field>

        <Field label="Venue address" htmlFor="venue_address" hint="optional" className="sm:col-span-2">
          <Input id="venue_address" name="venue_address" placeholder="Band Stand, Bandra West" />
        </Field>
      </div>
    </div>
  );
}

function StepperButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="hairline grid size-11 shrink-0 place-items-center rounded-xl text-cream-200/70 transition-colors hover:border-champagne-300/45 hover:text-champagne-200"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------ step 3 */

function StepAddons({
  services,
  selected,
  onToggle,
  guestCount,
}: {
  services: ServiceWithCategory[];
  selected: string[];
  onToggle: (id: string) => void;
  guestCount: number;
}) {
  const grouped = services.reduce<Record<string, ServiceWithCategory[]>>((acc, s) => {
    const key = s.category?.name ?? "Other";
    (acc[key] ??= []).push(s);
    return acc;
  }, {});

  return (
    <div>
      <h2 className="font-display text-3xl">Anything to add?</h2>
      <p className="mt-2 text-sm text-cream-200/50">
        Per-plate services are priced against your {guestCount} guests. Skip this step entirely if
        the package covers you.
      </p>

      <div className="mt-7 space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-champagne-300/70">
              {category}
            </h3>
            <div className="mt-3 space-y-2">
              {items.map((s) => {
                const active = selected.includes(s.id);
                const qty = s.price_unit === "plate" ? guestCount : 1;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onToggle(s.id)}
                    className={cn(
                      "flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-300",
                      active
                        ? "border-champagne-300/60 bg-champagne-300/[0.08]"
                        : "border-champagne-300/12 bg-ink-900/40 hover:border-champagne-300/30",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md border transition-colors",
                        active
                          ? "border-champagne-300 bg-champagne-300 text-ink-950"
                          : "border-cream-200/25",
                      )}
                    >
                      {active && <Check className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-cream-50">{s.name}</span>
                      <span className="block truncate text-xs text-cream-200/40">{s.tagline}</span>
                    </span>
                    <span className="shrink-0 text-right text-sm">
                      <span className="block text-champagne-200">
                        {formatCurrency(Number(s.base_price) * qty)}
                      </span>
                      {s.price_unit === "plate" && (
                        <span className="block text-[0.65rem] text-cream-200/35">
                          {formatCurrency(s.base_price)} × {guestCount}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ step 4 */

function StepConfirm({
  defaults,
}: {
  defaults: { name: string; email: string; phone: string };
}) {
  return (
    <div>
      <h2 className="font-display text-3xl">Who do we call on the day?</h2>
      <p className="mt-2 text-sm text-cream-200/50">
        Nothing is charged yet — you will review the payment on the next screen.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Contact name" htmlFor="contact_name">
          <Input
            id="contact_name"
            name="contact_name"
            required
            defaultValue={defaults.name}
            autoComplete="name"
          />
        </Field>

        <Field label="Phone" htmlFor="contact_phone">
          <Input
            id="contact_phone"
            name="contact_phone"
            required
            defaultValue={defaults.phone}
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        </Field>

        <Field label="Email" htmlFor="contact_email" className="sm:col-span-2">
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            required
            defaultValue={defaults.email}
            autoComplete="email"
          />
        </Field>

        <Field
          label="Anything we should know?"
          htmlFor="notes"
          hint="optional"
          className="sm:col-span-2"
        >
          <Textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Dietary restrictions, a colour palette, a song that has to be played…"
          />
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ summary */

function Summary({
  pkg,
  eventType,
  guestCount,
  quote,
  addonNames,
}: {
  pkg: Package | null;
  eventType: EventType;
  guestCount: number;
  quote: ReturnType<typeof quoteBooking>;
  addonNames: string[];
}) {
  return (
    <aside className="lg:sticky lg:top-28 lg:self-start">
      <div className="glass rounded-3xl p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne-300/80">
          Your quote
        </h3>

        <dl className="mt-6 space-y-3 text-sm">
          <SummaryRow label="Occasion" value={eventTypeLabel(eventType)} />
          <SummaryRow label="Guests" value={String(guestCount)} />
          <SummaryRow label="Package" value={pkg?.name ?? "Custom build"} />
        </dl>

        <dl className="mt-6 space-y-3 border-t border-champagne-300/12 pt-6 text-sm">
          <SummaryRow
            label={pkg ? "Package price" : "Package"}
            value={formatCurrency(quote.packagePrice)}
          />
          <SummaryRow
            label={`Add-ons${addonNames.length ? ` (${addonNames.length})` : ""}`}
            value={formatCurrency(quote.addonsTotal)}
          />
          <SummaryRow label="GST (18%)" value={formatCurrency(quote.tax)} />
        </dl>

        {addonNames.length > 0 && (
          <ul className="mt-3 space-y-1">
            {addonNames.map((n) => (
              <li key={n} className="truncate text-xs text-cream-200/35">
                · {n}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-baseline justify-between border-t border-champagne-300/12 pt-5">
          <span className="text-cream-100">Total</span>
          <motion.span
            key={quote.total}
            initial={{ opacity: 0.4, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl text-foil"
          >
            {formatCurrency(quote.total)}
          </motion.span>
        </div>

        <p className="mt-4 rounded-xl border border-champagne-300/15 bg-champagne-300/[0.06] px-4 py-3 text-xs leading-relaxed text-cream-200/55">
          Pay {Math.round(ADVANCE_RATE * 100)}% today —{" "}
          <span className="text-champagne-200">{formatCurrency(quote.advance)}</span> — and the
          balance before the event.
        </p>
      </div>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-cream-200/45">{label}</dt>
      <dd className="truncate text-right text-cream-100">{value}</dd>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Reserving…" : "Confirm & continue to payment"}
      <ArrowRight className="size-4" />
    </Button>
  );
}
