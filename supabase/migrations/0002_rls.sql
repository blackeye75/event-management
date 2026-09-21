-- ============================================================================
-- Function Junction — row level security
--
-- Shape of the rules:
--   * catalogue tables (categories/services/packages/testimonials/settings) are
--     world-readable but only admins may write;
--   * a customer sees and creates only their own bookings and payments;
--   * admins see everything.
-- ============================================================================

alter table public.profiles         enable row level security;
alter table public.categories       enable row level security;
alter table public.services         enable row level security;
alter table public.packages         enable row level security;
alter table public.package_services enable row level security;
alter table public.bookings         enable row level security;
alter table public.booking_services enable row level security;
alter table public.payments         enable row level security;
alter table public.testimonials     enable row level security;
alter table public.enquiries        enable row level security;
alter table public.site_settings    enable row level security;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
drop policy if exists "profiles readable by owner or admin" on public.profiles;
create policy "profiles readable by owner or admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles updatable by owner" on public.profiles;
create policy "profiles updatable by owner" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles manageable by admin" on public.profiles;
create policy "profiles manageable by admin" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Public catalogue: read for everyone, write for admins
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['categories', 'services', 'packages', 'package_services', 'testimonials']
  loop
    execute format('drop policy if exists %I on public.%I', t || ' are public', t);
    execute format('create policy %I on public.%I for select using (true)', t || ' are public', t);

    execute format('drop policy if exists %I on public.%I', t || ' writable by admin', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',
      t || ' writable by admin', t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------
drop policy if exists "settings are public" on public.site_settings;
create policy "settings are public" on public.site_settings
  for select using (true);

drop policy if exists "settings writable by admin" on public.site_settings;
create policy "settings writable by admin" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
drop policy if exists "bookings readable by owner or admin" on public.bookings;
create policy "bookings readable by owner or admin" on public.bookings
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "bookings created by owner" on public.bookings;
create policy "bookings created by owner" on public.bookings
  for insert to authenticated with check (user_id = auth.uid());

-- A customer may edit their own booking only while it is still pending
-- (e.g. to cancel it); everything after that is the admin's job.
drop policy if exists "pending bookings updatable by owner" on public.bookings;
create policy "pending bookings updatable by owner" on public.bookings
  for update to authenticated
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid());

drop policy if exists "bookings manageable by admin" on public.bookings;
create policy "bookings manageable by admin" on public.bookings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- booking_services — inherit access from the parent booking
-- ---------------------------------------------------------------------------
drop policy if exists "booking services follow booking" on public.booking_services;
create policy "booking services follow booking" on public.booking_services
  for select to authenticated using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and (b.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "booking services created with booking" on public.booking_services;
create policy "booking services created with booking" on public.booking_services
  for insert to authenticated with check (
    exists (select 1 from public.bookings b where b.id = booking_id and b.user_id = auth.uid())
  );

drop policy if exists "booking services manageable by admin" on public.booking_services;
create policy "booking services manageable by admin" on public.booking_services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- payments — readable by the payer, written only by the server (service role,
-- which bypasses RLS) so that an amount can never be forged from the browser.
-- ---------------------------------------------------------------------------
drop policy if exists "payments readable by owner or admin" on public.payments;
create policy "payments readable by owner or admin" on public.payments
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists "payments manageable by admin" on public.payments;
create policy "payments manageable by admin" on public.payments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- enquiries — anyone may submit, only admins may read
-- ---------------------------------------------------------------------------
drop policy if exists "anyone can submit an enquiry" on public.enquiries;
create policy "anyone can submit an enquiry" on public.enquiries
  for insert with check (true);

drop policy if exists "enquiries readable by admin" on public.enquiries;
create policy "enquiries readable by admin" on public.enquiries
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
