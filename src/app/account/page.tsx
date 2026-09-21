import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import { getCurrentProfile } from "@/lib/queries";
import { getMyBookings, amountCollected } from "@/lib/bookings";
import { PageHeader } from "@/components/site/page-header";
import { BookingCard } from "@/components/site/booking-card";
import { ProfileForm } from "@/components/site/profile-form";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "My bookings" };

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/account");

  const bookings = await getMyBookings();
  const upcoming = bookings.filter(
    (b) => b.status !== "cancelled" && new Date(b.event_date) >= startOfToday(),
  );
  const past = bookings.filter((b) => !upcoming.includes(b));

  const outstanding = upcoming.reduce(
    (sum, b) => sum + Math.max(0, Number(b.total) - amountCollected(b)),
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow={`Signed in as ${profile.email ?? "guest"}`}
        title="Hello,"
        accent={(profile.full_name ?? "there").split(" ")[0]}
        description="Every booking, payment and change to your events lives here."
      >
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/book">
            <Plus className="size-4" />
            Book another event
          </ButtonLink>
          {profile.role === "admin" && (
            <ButtonLink href="/admin" variant="outline">
              <Sparkles className="size-4" />
              Admin panel
            </ButtonLink>
          )}
        </div>
      </PageHeader>

      <section className="mx-auto max-w-6xl px-5 pb-10 sm:px-8">
        {/* Snapshot */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Upcoming events" value={String(upcoming.length)} />
          <Stat label="Total bookings" value={String(bookings.length)} />
          <Stat label="Outstanding" value={formatCurrency(outstanding)} />
        </div>

        <h2 className="font-display mt-16 text-3xl">Upcoming</h2>
        {upcoming.length ? (
          <div className="mt-6 space-y-4">
            {upcoming.map((booking, i) => (
              <BookingCard key={booking.id} booking={booking} index={i} />
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="hairline mt-6 rounded-3xl bg-ink-900/40 px-6 py-16 text-center">
              <CalendarDays className="mx-auto size-8 text-champagne-300/50" />
              <p className="font-display mt-5 text-2xl">Nothing on the calendar yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-cream-200/45">
                Pick a package, tell us the date, and we will hold it for 48 hours while you decide.
              </p>
              <ButtonLink href="/packages" className="mt-7">
                Browse packages
              </ButtonLink>
            </div>
          </Reveal>
        )}

        {past.length > 0 && (
          <>
            <h2 className="font-display mt-16 text-3xl">Past & cancelled</h2>
            <div className="mt-6 space-y-4">
              {past.map((booking, i) => (
                <BookingCard key={booking.id} booking={booking} index={i} muted />
              ))}
            </div>
          </>
        )}

        <h2 className="font-display mt-16 text-3xl">Your details</h2>
        <p className="mt-2 text-sm text-cream-200/45">
          These pre-fill every booking form. Changing them here does not alter bookings already
          placed.
        </p>
        <div className="mt-6 max-w-xl">
          <ProfileForm profile={profile} />
        </div>

        <form action="/auth/signout" method="post" className="mt-10">
          <button
            type="submit"
            className="text-sm text-cream-200/40 underline decoration-cream-200/20 underline-offset-4 transition-colors hover:text-rose-300"
          >
            Sign out
          </button>
        </form>

        <p className="mt-6 text-xs text-cream-200/30">
          Need a change we cannot make here?{" "}
          <Link href="/contact" className="text-champagne-200/60 underline underline-offset-4">
            Talk to your planner
          </Link>
          .
        </p>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Reveal>
      <div className="hairline rounded-2xl bg-ink-900/40 px-6 py-7">
        <div className="text-[0.62rem] uppercase tracking-[0.22em] text-cream-200/35">{label}</div>
        <div className="font-display mt-2 text-3xl text-champagne-200">{value}</div>
      </div>
    </Reveal>
  );
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
