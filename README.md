# Function Junction

An event-management site for a full-service event atelier — weddings,
birthdays, anniversaries and corporate evenings — built on **Next.js 16** and
**Supabase**, with a custom admin panel, a booking flow and a payment gateway.

![Next.js](https://img.shields.io/badge/Next.js-16-000) ![React](https://img.shields.io/badge/React-19-087ea4) ![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ecf8e) ![Tailwind](https://img.shields.io/badge/Tailwind-v4-38bdf8)

---

## What it does

**Public site**

- Packages for every occasion — three birthday builds, three weddings, an
  anniversary evening and a corporate gala — each with inclusions, bundled
  services, a gallery and a real price.
- Sixteen services across eight categories (decor, catering, entertainment,
  photography, beauty, logistics, desserts, hospitality), filterable and
  individually bookable.
- Gallery lightbox, About, and a contact form that writes to `enquiries`.

**Customers**

- Email/password sign-up and sign-in.
- A four-step booking wizard — occasion → date and venue → add-ons → contact —
  with the quote updating live as choices change.
- Checkout with a 25% advance or payment in full, then a dashboard listing
  every booking, its balance and its status.

**Admin panel** (`/admin`)

- Dashboard: booked value, collected, outstanding, pending bookings and the
  next five events.
- Full CRUD on packages, services, categories and testimonials — every field
  that appears on the public site is editable, including imagery, pricing,
  inclusions, featured flags and sort order.
- Bookings: expand any row to see the full order, move it through its
  lifecycle, and record payments taken by bank transfer, UPI, cash or cheque.
- Enquiries inbox and site-wide settings (company details, hero copy, social
  links, the animated counters).

---

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site runs immediately at <http://localhost:3000>. Without Supabase
credentials it serves the demo catalogue in `src/lib/demo-data.ts` — a mirror
of the SQL seed — so every public page is fully populated. Sign-in, bookings,
payments and `/admin` stay disabled until a project is connected.

### Connecting Supabase

1. Create a project at [supabase.com](https://supabase.com) and copy its URL,
   anon key and service-role key into `.env.local`.

2. Run the migrations and the seed. With the Supabase CLI:

   ```bash
   supabase link --project-ref <your-ref>
   supabase db push                      # applies supabase/migrations/*
   psql "$DATABASE_URL" -f supabase/seed.sql
   ```

   Or paste `supabase/migrations/0001_init.sql`, `0002_rls.sql` and
   `seed.sql` — in that order — into the SQL editor in the dashboard.

3. Restart `npm run dev` and sign up at `/signup`.
   **The first account created becomes the administrator**, so a fresh
   deployment is never locked out of `/admin`. Everyone after that is a
   customer; promote more admins by flipping `profiles.role` to `admin`.

### Turning on real payments

Checkout runs in demo mode until `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
are set — orders are minted locally and settled instantly, with a notice on
the checkout screen saying so. Add the two keys and the real Razorpay checkout
takes over.

For production, also create a webhook in the Razorpay dashboard pointing at
`POST /api/payments/webhook` for `payment.captured` and `payment.failed`, and
put its secret in `RAZORPAY_WEBHOOK_SECRET`. The webhook is the authoritative
record of a capture — the browser callback only exists so the customer sees
their booking confirmed without waiting.

Swapping gateways means reimplementing `createOrder` and `verifySignature` in
`src/lib/payments/razorpay.ts`; nothing else touches the provider.

---

## Data model

| Table | Purpose |
| --- | --- |
| `profiles` | One per auth user, carrying `role` (`customer` \| `admin`) |
| `categories` | Service disciplines — decor, catering, entertainment, … |
| `services` | Individual offerings, priced per event / plate / hour / day |
| `packages` | Complete event builds, tied to an `event_type` |
| `package_services` | Which services a package already bundles |
| `bookings` | A customer's event, with its frozen price breakdown |
| `booking_services` | The add-ons on a booking, as priced at booking time |
| `payments` | Every capture, gateway or offline |
| `testimonials` | The review carousel |
| `enquiries` | Contact-form submissions |
| `site_settings` | One editable row of site-wide copy and counters |

### Security

Row-level security is on for every table (`supabase/migrations/0002_rls.sql`):

- The catalogue is world-readable; only admins may write to it.
- A customer sees only their own bookings and payments, and may edit a booking
  only while it is still `pending`.
- `payments` has **no client INSERT policy** — rows are written exclusively by
  the server with the service-role key, so an amount can never be forged from
  the browser.
- `is_admin()` is `SECURITY DEFINER` so policies on `profiles` can call it
  without re-entering their own RLS check.

Prices are never trusted from the client. `src/lib/pricing.ts` is the single
source of truth: the wizard calls it to preview a total, and the server action
calls it again with rows read straight from the database before writing the
booking.

---

## Project layout

```
src/
├── app/
│   ├── (site)/            public pages — home, packages, services, gallery…
│   ├── (auth)/            sign-in, sign-up, PKCE callback
│   ├── account/           customer dashboard
│   ├── admin/             admin panel
│   └── api/payments/      create-order, verify, webhook
├── components/
│   ├── ui/                buttons, fields, reveal, lightbox-safe images
│   ├── site/              public-site sections and cards
│   └── admin/             panel shell, tables, editors
├── lib/
│   ├── supabase/          browser, server, service-role clients + proxy
│   ├── actions/           server actions (auth, bookings, enquiries, admin)
│   ├── payments/          gateway adapter and settlement
│   ├── pricing.ts         the quote calculation
│   ├── queries.ts         public reads, with demo fallbacks
│   └── demo-data.ts       mirror of supabase/seed.sql
└── proxy.ts               session refresh + route guards
```

## Design

A dark "classical modern" palette — ink, champagne gold and blush — with
Cormorant Garamond for display type against Plus Jakarta Sans. Motion is
handled by `motion/react`: a parallax hero, scroll-triggered reveals, shared
layout transitions on the navigation and filter pills, counters that animate
into view, and an animated step transition in the booking wizard. Everything
collapses gracefully under `prefers-reduced-motion`.

Catalogue imagery is admin-editable and therefore arbitrary, so `SmartImage`
falls back to a deterministic gradient plate derived from the item's name when
a URL fails — a missing photograph still reads as a designed surface rather
than a hole in the layout. The seed points at Unsplash; replace those URLs
from the admin panel with your own photography.

## Scripts

```bash
npm run dev     # development server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```
