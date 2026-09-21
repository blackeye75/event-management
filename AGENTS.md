# Function Junction — working notes

Next.js 16 (App Router, React 19, Tailwind v4) on Supabase. See `README.md`
for setup; this file covers the conventions worth knowing before editing.

## Conventions

- **Never price anything on the client.** `src/lib/pricing.ts` is the single
  source of truth. The booking wizard calls it for a preview; the server
  action calls it again with rows read from the database. Adding a priced
  field means changing it in one place.
- **Public reads degrade.** Everything in `src/lib/queries.ts` falls back to
  `src/lib/demo-data.ts` when Supabase is absent or a query returns nothing,
  so a public page never shows a visitor an error. Keep `demo-data.ts` in step
  with `supabase/seed.sql`.
- **Admin reads do not degrade.** `src/lib/admin.ts` always goes through
  `requireAdmin()` and returns real rows, including inactive ones.
- **`payments` is server-write only.** The table has no client INSERT policy;
  anything that writes it uses `createAdminClient()` after checking the caller.
- Client components must not import from `src/lib/bookings.ts` or
  `src/lib/supabase/server.ts` — both pull in `next/headers`. Shared shapes and
  helpers live in `src/lib/booking-types.ts`.
- Route guards live in `src/proxy.ts` (Next 16 renamed `middleware`), with
  `requireAdmin()` as the second gate inside the admin tree.

## Schema changes

Add a numbered file under `supabase/migrations/`, mirror the shape in
`src/lib/database.types.ts`, and update `supabase/seed.sql` plus
`src/lib/demo-data.ts` if the change affects seeded content.

## Before committing

```bash
npm run lint && npm run build
```
