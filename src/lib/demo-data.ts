/**
 * A read-only mirror of `supabase/seed.sql`, used only when
 * NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are absent — a fresh clone then still
 * renders the full site instead of a page of empty states. Once Supabase is
 * configured every one of these reads comes from the database instead, and the
 * admin panel edits the real rows.
 *
 * Keep in step with supabase/seed.sql.
 */
import type {
  Category,
  Package,
  Service,
  SiteSettings,
  Testimonial,
} from "@/lib/database.types";

const now = "2026-01-01T00:00:00.000Z";
const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const PHOTO = {
  dj: "1470229722913-7ea0a0e4b5f5",
  band: "1514525253161-7a46d19cd819",
  anchor: "1511578314322-379afb476865",
  buffet: "1555244162-803834f70033",
  plated: "1414235077428-338989a2e8c0",
  bar: "1492684223066-81342ee5ff30",
  mandap: "1519225421980-715cb0215aed",
  theme: "1530103862676-de8c9debad1d",
  lighting: "1558618666-fcd25c85cd64",
  photo: "1487412720507-e7ab37603c6f",
  film: "1478146896981-b80fe463b330",
  makeup: "1583939003579-730e3918a45a",
  cake: "1478760329108-5c3ed9d495a0",
  venue: "1464366400600-7168b8af9bc3",
  hospitality: "1519741497674-611481863552",
} as const;

const baseRow = { created_at: now, updated_at: now, is_active: true };

function category(
  i: number,
  slug: string,
  name: string,
  description: string,
  icon: string,
): Category {
  return { ...baseRow, id: `cat-${slug}`, slug, name, description, icon, sort_order: i };
}

export const demoCategories: Category[] = [
  category(1, "decor", "Decor & Styling", "Florals, drapes, stages and light design that set the whole mood.", "flower-2"),
  category(2, "catering", "Catering", "Multi-cuisine live counters, plated dinners and bespoke menus.", "utensils-crossed"),
  category(3, "entertainment", "Entertainment", "DJs, live bands, anchors and performers who hold the floor.", "disc-3"),
  category(4, "photography", "Photography & Film", "Candid photography, cinematic films, drone and instant prints.", "camera"),
  category(5, "beauty", "Beauty & Styling", "Bridal makeup, hair, draping and grooming for the whole party.", "sparkles"),
  category(6, "logistics", "Venue & Logistics", "Venue sourcing, guest transport, valet and on-ground crew.", "map-pinned"),
  category(7, "desserts", "Cakes & Desserts", "Designer cakes, dessert walls and live dessert counters.", "cake"),
  category(8, "hospitality", "Hospitality", "Ushers, bartenders, concierge desks and guest management.", "concierge-bell"),
];

type ServiceSeed = [
  cat: string,
  slug: string,
  name: string,
  tagline: string,
  description: string,
  photo: string,
  price: number,
  unit: string,
  features: string[],
  featured: boolean,
];

const serviceSeeds: ServiceSeed[] = [
  ["entertainment", "signature-dj", "Signature DJ Console", "Beat-matched sets that never let the floor empty",
    "A resident DJ with a curated multi-genre library, professional line-array sound, wireless mics for the hosts and a mood-mapped light rig. Includes a pre-event music consultation so the playlist sounds like you.",
    PHOTO.dj, 35000, "event",
    ["6-hour performance set", "Line-array sound for up to 400 guests", "Wireless mics + monitor for hosts", "Intelligent moving-head lighting", "Pre-event playlist consultation"], true],
  ["entertainment", "live-band", "Live Band & Vocalists", "Sufi, Bollywood and lounge, performed live",
    "A five-piece band with lead vocals, tabla, keys, guitar and percussion. Set lists are built around your evening — mellow through dinner, full tempo after.",
    PHOTO.band, 65000, "event",
    ["5-piece band with lead vocals", "2 x 45-minute sets", "Own backline and monitors", "Custom set list", "Sound-check on site"], false],
  ["entertainment", "anchor-host", "Event Anchor & Host", "Someone to hold the evening together",
    "A bilingual professional anchor who runs the flow, introduces the ceremonies, keeps the games moving and manages the run-of-show with your coordinator.",
    PHOTO.anchor, 22000, "event",
    ["Bilingual anchoring", "Run-of-show scripting", "Interactive games segment", "Coordination with DJ and crew"], false],
  ["catering", "gourmet-buffet", "Gourmet Multi-Cuisine Buffet", "Nine live counters, one very happy room",
    "A chef-curated buffet spanning North Indian, Continental, Pan-Asian and regional street food, with live counters, dedicated Jain and vegan sections and uniformed service staff.",
    PHOTO.buffet, 1250, "plate",
    ["9 live counters", "Veg, Jain and vegan menus", "Uniformed service staff 1:12", "Crockery, cutlery and linen", "Complimentary menu tasting above 150 guests"], true],
  ["catering", "plated-fine-dining", "Plated Fine Dining", "A five-course sit-down, timed to the minute",
    "A five-course plated service for seated dinners — amuse-bouche through dessert — choreographed with the programme so no course lands mid-speech.",
    PHOTO.plated, 2400, "plate",
    ["5-course plated menu", "Synchronised service", "Sommelier-style beverage pairing", "Bespoke menu cards", "Dedicated captain per 40 guests"], false],
  ["catering", "live-bar", "Mixology Bar", "Craft cocktails and zero-proof signatures",
    "A full bar setup with trained mixologists, a signature cocktail designed for the occasion and an equally serious zero-proof menu. Beverage licensing support included.",
    PHOTO.bar, 85000, "event",
    ["2 mixologists + 4 bartenders", "Signature cocktail creation", "Full zero-proof menu", "Glassware, ice and garnish", "Licensing paperwork support"], false],
  ["decor", "floral-mandap", "Floral Mandap & Stage", "Fresh-flower architecture for the main moment",
    "A fresh-flower mandap or stage built to your palette — imported and seasonal blooms, drapes, structural framing and a matched aisle treatment.",
    PHOTO.mandap, 185000, "event",
    ["Fresh imported and seasonal florals", "Structural framing and drapes", "Matched aisle and entrance", "Setup and teardown crew", "3D design preview before approval"], true],
  ["decor", "theme-decor", "Themed Decor Build", "Balloons, backdrops and a set worth photographing",
    "Complete theme execution — from a two-year-old's jungle safari to a black-and-gold thirtieth. Backdrops, balloon installations, props, signage and a dedicated photo corner.",
    PHOTO.theme, 45000, "event",
    ["Custom theme design", "Organic balloon installation", "Printed backdrop and signage", "Props and photo corner", "Table and ceiling styling"], true],
  ["decor", "ambient-lighting", "Ambient & Architectural Lighting", "Light that makes the venue look expensive",
    "Uplighters, fairy canopies, pin-spots on centrepieces, gobo monograms and façade washes — programmed to change with the evening.",
    PHOTO.lighting, 60000, "event",
    ["Wireless uplighters", "Fairy-light canopy", "Pin-spotting on centrepieces", "Custom gobo monogram", "Programmed scene changes"], false],
  ["photography", "candid-photography", "Candid Photography", "Two shooters, unscripted, all day",
    "Two candid photographers covering the full event, with a same-day highlights reel and a colour-graded gallery delivered inside ten days.",
    PHOTO.photo, 75000, "day",
    ["2 candid photographers", "Full-day coverage", "300+ retouched images", "Same-day highlight reel", "Online gallery for 12 months"], true],
  ["photography", "cinematic-film", "Cinematic Film & Drone", "A film, not a video",
    "A cinematographer-led crew with gimbals and a licensed drone operator, producing a 4-minute teaser and a 20-minute feature film.",
    PHOTO.film, 125000, "day",
    ["2-camera cinematic crew", "Licensed drone coverage", "4-minute teaser", "20-minute feature film", "Licensed soundtrack"], false],
  ["photography", "instant-print-booth", "Instant Print Photo Booth", "Guests leave holding something",
    "A styled 360-degree booth with unlimited instant prints, a curated prop bar and an attendant, plus a digital gallery guests can download.",
    PHOTO.bar, 28000, "event",
    ["360-degree booth", "Unlimited instant prints", "Curated prop bar", "On-site attendant", "Digital gallery link"], false],
  ["beauty", "bridal-makeup", "Bridal Makeup & Hair", "HD makeup that survives a fourteen-hour day",
    "A lead artist for the bride across functions, with draping, hair styling and a trial session, plus optional artists for the family.",
    PHOTO.makeup, 45000, "day",
    ["Lead artist for the bride", "Trial session included", "Saree and lehenga draping", "Hair styling and extensions", "Touch-up kit for the day"], true],
  ["desserts", "designer-cake", "Designer Cake", "The centrepiece you eat",
    "A multi-tier designer cake, hand-finished in your theme, with a tasting box sent ahead so you sign off on the flavour, not just the render.",
    PHOTO.cake, 18000, "event",
    ["Up to 4 tiers", "Hand-finished theme detailing", "Eggless and vegan options", "Flavour tasting box", "Cake table styling"], true],
  ["logistics", "venue-sourcing", "Venue Sourcing & Liaison", "We already know which hall actually fits 300",
    "Shortlisting, site visits, rate negotiation and full liaison with the venue — including permissions, load-in windows and vendor NOCs.",
    PHOTO.venue, 40000, "event",
    ["Curated shortlist of 5 venues", "Accompanied site visits", "Rate negotiation", "Permissions and NOC handling", "Load-in scheduling"], false],
  ["hospitality", "guest-hospitality", "Guest Hospitality Desk", "Ushers, welcome desk and zero confusion",
    "Uniformed ushers, a welcome and gifting desk, seating management and a guest-transport coordinator so nobody spends the evening looking for their table.",
    PHOTO.hospitality, 32000, "event",
    ["8 uniformed ushers", "Welcome and gifting desk", "Seating and RSVP management", "Guest transport coordination", "Valet supervision"], false],
];

export const demoServices: Service[] = serviceSeeds.map(
  ([cat, slug, name, tagline, description, photo, price, unit, features, featured], i) => ({
    ...baseRow,
    id: `svc-${slug}`,
    category_id: `cat-${cat}`,
    slug,
    name,
    tagline,
    description,
    image_url: img(photo),
    base_price: price,
    price_unit: unit,
    features,
    is_featured: featured,
    sort_order: i + 1,
  }),
);

type PackageSeed = [
  slug: string,
  name: string,
  eventType: Package["event_type"],
  tagline: string,
  description: string,
  photos: string[],
  base: number,
  sale: number | null,
  guests: number,
  hours: number,
  inclusions: string[],
  featured: boolean,
  services: string[],
];

const packageSeeds: PackageSeed[] = [
  ["first-birthday-wonderland", "First Birthday Wonderland", "birthday",
    "The one they will only see in photographs",
    "A soft-pastel first-birthday build with a themed backdrop, organic balloon installation, a two-tier eggless cake, a kids' menu with a live dessert counter, and an anchor who runs games for the older cousins. Setup begins four hours before the guests do.",
    [PHOTO.theme, PHOTO.cake, PHOTO.bar], 95000, 79000, 60, 4,
    ["Themed backdrop and balloon installation", "2-tier eggless designer cake", "Kids' menu + live dessert counter", "Anchor with games and activities", "Photographer for 4 hours", "Return gifts for 30 children"],
    true, ["theme-decor", "designer-cake", "anchor-host", "candid-photography"]],
  ["teen-neon-night", "Teen Neon Night", "birthday",
    "Blacklight, bass and a very late curfew",
    "A neon-themed teen party with UV decor, a resident DJ, a glow photo booth and a street-food counter built around things teenagers actually eat. Includes on-ground supervision so the parents can leave.",
    [PHOTO.dj, PHOTO.band, PHOTO.bar], 145000, 129000, 100, 5,
    ["UV and neon decor build", "Signature DJ with light rig", "Glow photo booth with instant prints", "Street-food live counters", "Mocktail bar", "2 supervisors on ground"],
    true, ["signature-dj", "theme-decor", "instant-print-booth", "gourmet-buffet"]],
  ["milestone-gold-soiree", "Milestone Gold Soirée", "birthday",
    "For the thirtieth, fiftieth or sixtieth that deserves a room",
    "A black-and-gold seated celebration — plated dinner, ambient architectural lighting, a live acoustic set through dinner and a DJ after, with a curated photo wall of the years so far.",
    [PHOTO.anchor, PHOTO.lighting, PHOTO.plated], 285000, null, 150, 5,
    ["Black-and-gold decor and table styling", "Plated 4-course dinner", "Architectural and ambient lighting", "Live acoustic set + DJ", "Curated memory photo wall", "Candid photography"],
    false, ["ambient-lighting", "plated-fine-dining", "live-band", "candid-photography"]],
  ["classic-wedding-signature", "The Signature Wedding", "wedding",
    "Two days, one coordinator, nothing left to you",
    "Our most-booked wedding build: mehendi, sangeet and the wedding day itself. Fresh-flower mandap, multi-cuisine catering for 300, full candid and cinematic coverage, bridal beauty across functions, and a coordinator who lives on site from load-in to teardown.",
    [PHOTO.mandap, PHOTO.venue, PHOTO.hospitality], 1450000, 1295000, 300, 48,
    ["Mehendi, sangeet and wedding day", "Fresh-flower mandap and stage", "Multi-cuisine catering for 300", "Candid photography + cinematic film", "Bridal makeup across all functions", "DJ, live band and anchor", "Dedicated on-site coordinator", "Guest hospitality and valet"],
    true, ["floral-mandap", "gourmet-buffet", "candid-photography", "cinematic-film", "bridal-makeup", "signature-dj", "guest-hospitality"]],
  ["intimate-vows", "Intimate Vows", "wedding",
    "Sixty people who actually matter",
    "A small-format wedding designed for a terrace, a courtyard or a boutique hotel lawn — minimal florals, a plated dinner, an acoustic duo and photography that stays out of the way.",
    [PHOTO.hospitality, PHOTO.venue, PHOTO.plated], 550000, 495000, 60, 8,
    ["Minimal floral ceremony setup", "Plated 5-course dinner for 60", "Acoustic duo through the evening", "Candid photography", "Bridal makeup and draping", "Venue sourcing and liaison"],
    true, ["plated-fine-dining", "candid-photography", "bridal-makeup", "venue-sourcing"]],
  ["grand-shaadi-royale", "Grand Shaadi Royale", "wedding",
    "Five functions. Eight hundred guests. One command centre.",
    "The full destination-scale wedding — haldi, mehendi, sangeet, wedding and reception — with imported florals, a production-grade sangeet stage, guest transport and room-block management, and a crew of thirty on ground.",
    [PHOTO.venue, PHOTO.mandap, PHOTO.lighting], 4200000, null, 800, 120,
    ["5 functions across 3 days", "Imported floral and structural decor", "Production-grade sangeet stage", "Catering for 800 with 12 live counters", "Full photo, film and drone crew", "Guest transport and room-block management", "30-member on-ground crew", "Fireworks and entry production"],
    false, ["floral-mandap", "gourmet-buffet", "cinematic-film", "candid-photography", "bridal-makeup", "live-band", "ambient-lighting", "guest-hospitality"]],
  ["silver-anniversary", "Silver Anniversary Evening", "anniversary",
    "Twenty-five years, one very good party",
    "A warm, candlelit anniversary evening with a family photo installation, plated dinner, a live ghazal-and-lounge set and a renewal-of-vows moment if you want one.",
    [PHOTO.lighting, PHOTO.plated], 395000, 349000, 120, 5,
    ["Candlelit decor and table styling", "Family photo installation", "Plated dinner for 120", "Live ghazal and lounge set", "Renewal-of-vows setup", "Candid photography"],
    false, ["ambient-lighting", "plated-fine-dining", "live-band"]],
  ["corporate-gala", "Corporate Annual Gala", "corporate",
    "An awards night your people will not skip next year",
    "A full corporate evening — branded stage and AV production, awards run-of-show, plated or buffet dining, a professional anchor and an after-party DJ, with registration and guest-badging handled.",
    [PHOTO.anchor, PHOTO.dj], 750000, null, 400, 6,
    ["Branded stage and AV production", "Awards run-of-show and scripting", "Catering for 400", "Professional anchor + after-party DJ", "Registration and badging desk", "Event photography and recap film"],
    false, ["ambient-lighting", "gourmet-buffet", "anchor-host", "signature-dj"]],
];

export const demoPackages: Package[] = packageSeeds.map(
  ([slug, name, event_type, tagline, description, photos, base, sale, guests, hours, inclusions, featured], i) => ({
    ...baseRow,
    id: `pkg-${slug}`,
    slug,
    name,
    event_type,
    tagline,
    description,
    hero_image_url: img(photos[0], 1600),
    gallery: photos.map((p) => img(p)),
    base_price: base,
    sale_price: sale,
    guest_capacity: guests,
    duration_hours: hours,
    inclusions,
    is_featured: featured,
    sort_order: i + 1,
  }),
);

/** package slug -> bundled service slugs */
export const demoPackageServiceMap: Record<string, string[]> = Object.fromEntries(
  packageSeeds.map((p) => [p[0], p[12]]),
);

export const demoTestimonials: Testimonial[] = [
  ["Ananya & Rohit Mehra", "Signature Wedding, Udaipur", "wedding", 5,
    "Three hundred guests, two days, and not one phone call to us. The mandap was better than the render, which never happens. Our coordinator knew where my grandmother was at all times.",
    "1494790108377-be9c29b29330"],
  ["Kavita Iyer", "First Birthday Wonderland, Mumbai", "birthday", 5,
    "They set up while my daughter was napping and she woke up inside a pastel wonderland. The anchor kept eleven toddlers occupied for two hours. I did not carry a single thing.",
    "1438761681033-6461ffad8d80"],
  ["Siddharth Nair", "Corporate Annual Gala, Bengaluru", "corporate", 5,
    "Four hundred employees, a full awards run-of-show and an after-party that ran past midnight. The AV team rehearsed the entire script the night before. Attendance is up this year.",
    "1500648767791-00dcc994a43e"],
  ["Meera & Aditya Rao", "Intimate Vows, Goa", "wedding", 5,
    "We wanted sixty people and no spectacle. They understood immediately and built something quiet and beautiful. The photographs look like we were barely being photographed.",
    "1517841905240-472988babdf9"],
  ["Farhan Qureshi", "Teen Neon Night, Pune", "birthday", 4,
    "My son wanted neon and bass. He got both, plus supervisors who meant I could actually leave. Forty teenagers, zero incidents, one very good playlist.",
    "1507003211169-0a1dd7228f2d"],
  ["Sunita & Prakash Desai", "Silver Anniversary Evening, Nashik", "anniversary", 5,
    "The family photo installation had pictures we had forgotten existed. My husband cried during the ghazal set. Twenty-five years, and they still found a way to surprise us.",
    "1472099645785-5658abf4ff4e"],
].map(([author_name, author_role, event_type, rating, quote, photo], i) => ({
  id: `tst-${i}`,
  author_name: author_name as string,
  author_role: author_role as string,
  event_type: event_type as Testimonial["event_type"],
  rating: rating as number,
  quote: quote as string,
  avatar_url: img(photo as string, 300),
  is_published: true,
  sort_order: i + 1,
  created_at: now,
  updated_at: now,
}));

export const demoSettings: SiteSettings = {
  id: 1,
  company_name: "Function Junction",
  tagline: "Where every occasion becomes a landmark.",
  hero_title: "Every celebration deserves a masterpiece.",
  hero_subtitle:
    "Weddings, birthdays and everything worth remembering — designed, staffed and delivered end to end.",
  phone: "+91 98765 43210",
  email: "hello@functionjunction.in",
  address: "14 Rosewood Avenue, Bandra West, Mumbai 400050",
  instagram_url: "https://instagram.com",
  facebook_url: "https://facebook.com",
  youtube_url: "https://youtube.com",
  events_count: 1200,
  cities_count: 18,
  years_count: 12,
  updated_at: now,
};
