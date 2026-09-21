/**
 * Hand-maintained mirror of `supabase/migrations`. Regenerate with
 * `npx supabase gen types typescript --project-id <ref> > src/lib/database.types.ts`
 * once the project is linked.
 */

export type UserRole = "customer" | "admin";
export type EventType = "birthday" | "wedding" | "anniversary" | "corporate" | "baby_shower";
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded" | "failed";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  category_id: string | null;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  image_url: string | null;
  base_price: number;
  price_unit: string;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceWithCategory = Service & { category: Category | null };

export type Package = {
  id: string;
  slug: string;
  name: string;
  event_type: EventType;
  tagline: string | null;
  description: string | null;
  hero_image_url: string | null;
  gallery: string[];
  base_price: number;
  sale_price: number | null;
  guest_capacity: number;
  duration_hours: number;
  inclusions: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type PackageWithServices = Package & { services: Service[] };

export type Booking = {
  id: string;
  booking_ref: string;
  user_id: string;
  package_id: string | null;
  event_type: EventType;
  event_date: string;
  event_time: string;
  guest_count: number;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
  contact_name: string;
  contact_phone: string;
  contact_email: string;
  notes: string | null;
  package_price: number;
  addons_total: number;
  tax: number;
  total: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
};

export type BookingService = {
  id: string;
  booking_id: string;
  service_id: string | null;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type Payment = {
  id: string;
  booking_id: string;
  user_id: string | null;
  provider: string;
  provider_order_id: string | null;
  provider_payment_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string | null;
  created_at: string;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  event_type: EventType | null;
  rating: number;
  quote: string;
  avatar_url: string | null;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  event_type: EventType | null;
  message: string;
  is_handled: boolean;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  company_name: string;
  tagline: string;
  hero_title: string;
  hero_subtitle: string;
  phone: string;
  email: string;
  address: string;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  events_count: number;
  cities_count: number;
  years_count: number;
  updated_at: string;
};

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      categories: Table<Category>;
      services: Table<Service>;
      packages: Table<Package>;
      package_services: Table<{ package_id: string; service_id: string }>;
      bookings: Table<Booking>;
      booking_services: Table<BookingService>;
      payments: Table<Payment>;
      testimonials: Table<Testimonial>;
      enquiries: Table<Enquiry>;
      site_settings: Table<SiteSettings>;
    };
    Views: Record<never, never>;
    Functions: {
      is_admin: { Args: Record<never, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      event_type: EventType;
      booking_status: BookingStatus;
      payment_status: PaymentStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
