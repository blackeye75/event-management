-- ============================================================================
-- Function Junction — core schema
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.event_type as enum ('birthday', 'wedding', 'anniversary', 'corporate', 'baby_shower');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum ('unpaid', 'partial', 'paid', 'refunded', 'failed');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  phone       text,
  avatar_url  text,
  role        public.user_role not null default 'customer',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- `is_admin` is SECURITY DEFINER so that policies on `profiles` can call it
-- without re-entering their own RLS check.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Every new auth user gets a profile. The first user ever to sign up becomes
-- the admin, so a fresh deployment is never locked out of /admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  seeded_role public.user_role;
begin
  if not exists (select 1 from public.profiles) then
    seeded_role := 'admin';
  else
    seeded_role := 'customer';
  end if;

  insert into public.profiles (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    seeded_role
  )
  on conflict (id) do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories  (DJ, Catering, Decor, ...)
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  icon        text not null default 'sparkles',
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- services
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid references public.categories(id) on delete set null,
  slug         text not null unique,
  name         text not null,
  tagline      text,
  description  text,
  image_url    text,
  base_price   numeric(12,2) not null default 0,
  price_unit   text not null default 'event',   -- event | plate | hour | day
  features     text[] not null default '{}',
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists services_category_idx on public.services(category_id);

drop trigger if exists services_updated_at on public.services;
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- packages  (birthday / wedding / ...)
-- ---------------------------------------------------------------------------
create table if not exists public.packages (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique,
  name           text not null,
  event_type     public.event_type not null,
  tagline        text,
  description    text,
  hero_image_url text,
  gallery        text[] not null default '{}',
  base_price     numeric(12,2) not null default 0,
  sale_price     numeric(12,2),
  guest_capacity int not null default 50,
  duration_hours int not null default 4,
  inclusions     text[] not null default '{}',
  is_active      boolean not null default true,
  is_featured    boolean not null default false,
  sort_order     int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists packages_event_type_idx on public.packages(event_type);

drop trigger if exists packages_updated_at on public.packages;
create trigger packages_updated_at before update on public.packages
  for each row execute function public.set_updated_at();

-- package <-> service
create table if not exists public.package_services (
  package_id uuid not null references public.packages(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  primary key (package_id, service_id)
);

-- ---------------------------------------------------------------------------
-- bookings
-- ---------------------------------------------------------------------------
create sequence if not exists public.booking_ref_seq start 1001;

create table if not exists public.bookings (
  id             uuid primary key default gen_random_uuid(),
  booking_ref    text not null unique default ('FJ-' || to_char(now(), 'YY') || '-' || nextval('public.booking_ref_seq')),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  package_id     uuid references public.packages(id) on delete set null,
  event_type     public.event_type not null,
  event_date     date not null,
  event_time     time not null default '18:00',
  guest_count    int not null default 50,
  venue_name     text,
  venue_address  text,
  city           text,
  contact_name   text not null,
  contact_phone  text not null,
  contact_email  text not null,
  notes          text,
  package_price  numeric(12,2) not null default 0,
  addons_total   numeric(12,2) not null default 0,
  tax            numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  status         public.booking_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists bookings_user_idx on public.bookings(user_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_event_date_idx on public.bookings(event_date);

drop trigger if exists bookings_updated_at on public.bookings;
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

create table if not exists public.booking_services (
  id         uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  name       text not null,
  quantity   int not null default 1,
  unit_price numeric(12,2) not null default 0,
  line_total numeric(12,2) not null default 0
);

create index if not exists booking_services_booking_idx on public.booking_services(booking_id);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
create table if not exists public.payments (
  id                  uuid primary key default gen_random_uuid(),
  booking_id          uuid not null references public.bookings(id) on delete cascade,
  user_id             uuid references public.profiles(id) on delete set null,
  provider            text not null default 'razorpay',
  provider_order_id   text,
  provider_payment_id text,
  amount              numeric(12,2) not null,
  currency            text not null default 'INR',
  status              public.payment_status not null default 'unpaid',
  method              text,
  created_at          timestamptz not null default now()
);

create index if not exists payments_booking_idx on public.payments(booking_id);

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  author_name  text not null,
  author_role  text,
  event_type   public.event_type,
  rating       int not null default 5 check (rating between 1 and 5),
  quote        text not null,
  avatar_url   text,
  is_published boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

drop trigger if exists testimonials_updated_at on public.testimonials;
create trigger testimonials_updated_at before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- enquiries (contact form)
-- ---------------------------------------------------------------------------
create table if not exists public.enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text,
  event_type public.event_type,
  message    text not null,
  is_handled boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- site_settings (single editable row of site-wide copy)
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id             int primary key default 1 check (id = 1),
  company_name   text not null default 'Function Junction',
  tagline        text not null default 'Where every occasion becomes a landmark.',
  hero_title     text not null default 'Every celebration deserves a masterpiece.',
  hero_subtitle  text not null default 'Weddings, birthdays and everything worth remembering — designed, staffed and delivered end to end.',
  phone          text not null default '+91 98765 43210',
  email          text not null default 'hello@functionjunction.in',
  address        text not null default '14 Rosewood Avenue, Bandra West, Mumbai 400050',
  instagram_url  text default 'https://instagram.com',
  facebook_url   text default 'https://facebook.com',
  youtube_url    text default 'https://youtube.com',
  events_count   int not null default 1200,
  cities_count   int not null default 18,
  years_count    int not null default 12,
  updated_at     timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

insert into public.site_settings (id) values (1) on conflict (id) do nothing;
