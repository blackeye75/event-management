-- ============================================================================
-- Function Junction — seed data
-- Safe to re-run: every insert is keyed on the natural slug.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.categories (slug, name, description, icon, sort_order) values
  ('decor',         'Decor & Styling',    'Florals, drapes, stages and light design that set the whole mood.', 'flower-2', 1),
  ('catering',      'Catering',           'Multi-cuisine live counters, plated dinners and bespoke menus.',    'utensils-crossed', 2),
  ('entertainment', 'Entertainment',      'DJs, live bands, anchors and performers who hold the floor.',       'disc-3', 3),
  ('photography',   'Photography & Film', 'Candid photography, cinematic films, drone and instant prints.',    'camera', 4),
  ('beauty',        'Beauty & Styling',   'Bridal makeup, hair, draping and grooming for the whole party.',    'sparkles', 5),
  ('logistics',     'Venue & Logistics',  'Venue sourcing, guest transport, valet and on-ground crew.',        'map-pinned', 6),
  ('desserts',      'Cakes & Desserts',   'Designer cakes, dessert walls and live dessert counters.',          'cake', 7),
  ('hospitality',   'Hospitality',        'Ushers, bartenders, concierge desks and guest management.',         'concierge-bell', 8)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
insert into public.services (category_id, slug, name, tagline, description, image_url, base_price, price_unit, features, is_featured, sort_order)
select c.id, v.slug, v.name, v.tagline, v.description, v.image_url, v.base_price, v.price_unit, v.features, v.is_featured, v.sort_order
from (values
  ('entertainment', 'signature-dj',        'Signature DJ Console',     'Beat-matched sets that never let the floor empty',
   'A resident DJ with a curated multi-genre library, professional line-array sound, wireless mics for the hosts and a mood-mapped light rig. Includes a pre-event music consultation so the playlist sounds like you.',
   'https://images.unsplash.com/photo-1470229722913-7ea0a0e4b5f5?auto=format&fit=crop&w=1200&q=80', 35000, 'event',
   array['6-hour performance set','Line-array sound for up to 400 guests','Wireless mics + monitor for hosts','Intelligent moving-head lighting','Pre-event playlist consultation'], true, 1),

  ('entertainment', 'live-band',           'Live Band & Vocalists',    'Sufi, Bollywood and lounge, performed live',
   'A five-piece band with lead vocals, tabla, keys, guitar and percussion. Set lists are built around your evening — mellow through dinner, full tempo after.',
   'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80', 65000, 'event',
   array['5-piece band with lead vocals','2 x 45-minute sets','Own backline and monitors','Custom set list','Sound-check on site'], false, 2),

  ('entertainment', 'anchor-host',         'Event Anchor & Host',      'Someone to hold the evening together',
   'A bilingual professional anchor who runs the flow, introduces the ceremonies, keeps the games moving and manages the run-of-show with your coordinator.',
   'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', 22000, 'event',
   array['Bilingual anchoring','Run-of-show scripting','Interactive games segment','Coordination with DJ and crew'], false, 3),

  ('catering',      'gourmet-buffet',      'Gourmet Multi-Cuisine Buffet', 'Nine live counters, one very happy room',
   'A chef-curated buffet spanning North Indian, Continental, Pan-Asian and regional street food, with live counters, dedicated Jain and vegan sections and uniformed service staff.',
   'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80', 1250, 'plate',
   array['9 live counters','Veg, Jain and vegan menus','Uniformed service staff 1:12','Crockery, cutlery and linen','Complimentary menu tasting above 150 guests'], true, 4),

  ('catering',      'plated-fine-dining',  'Plated Fine Dining',       'A five-course sit-down, timed to the minute',
   'A five-course plated service for seated dinners — amuse-bouche through dessert — choreographed with the programme so no course lands mid-speech.',
   'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80', 2400, 'plate',
   array['5-course plated menu','Synchronised service','Sommelier-style beverage pairing','Bespoke menu cards','Dedicated captain per 40 guests'], false, 5),

  ('catering',      'live-bar',            'Mixology Bar',             'Craft cocktails and zero-proof signatures',
   'A full bar setup with trained mixologists, a signature cocktail designed for the occasion and an equally serious zero-proof menu. Beverage licensing support included.',
   'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', 85000, 'event',
   array['2 mixologists + 4 bartenders','Signature cocktail creation','Full zero-proof menu','Glassware, ice and garnish','Licensing paperwork support'], false, 6),

  ('decor',         'floral-mandap',       'Floral Mandap & Stage',    'Fresh-flower architecture for the main moment',
   'A fresh-flower mandap or stage built to your palette — imported and seasonal blooms, drapes, structural framing and a matched aisle treatment.',
   'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80', 185000, 'event',
   array['Fresh imported and seasonal florals','Structural framing and drapes','Matched aisle and entrance','Setup and teardown crew','3D design preview before approval'], true, 7),

  ('decor',         'theme-decor',         'Themed Decor Build',       'Balloons, backdrops and a set worth photographing',
   'Complete theme execution — from a two-year-old''s jungle safari to a black-and-gold thirtieth. Backdrops, balloon installations, props, signage and a dedicated photo corner.',
   'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', 45000, 'event',
   array['Custom theme design','Organic balloon installation','Printed backdrop and signage','Props and photo corner','Table and ceiling styling'], true, 8),

  ('decor',         'ambient-lighting',    'Ambient & Architectural Lighting', 'Light that makes the venue look expensive',
   'Uplighters, fairy canopies, pin-spots on centrepieces, gobo monograms and façade washes — programmed to change with the evening.',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80', 60000, 'event',
   array['Wireless uplighters','Fairy-light canopy','Pin-spotting on centrepieces','Custom gobo monogram','Programmed scene changes'], false, 9),

  ('photography',   'candid-photography',  'Candid Photography',       'Two shooters, unscripted, all day',
   'Two candid photographers covering the full event, with a same-day highlights reel and a colour-graded gallery delivered inside ten days.',
   'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80', 75000, 'day',
   array['2 candid photographers','Full-day coverage','300+ retouched images','Same-day highlight reel','Online gallery for 12 months'], true, 10),

  ('photography',   'cinematic-film',      'Cinematic Film & Drone',   'A film, not a video',
   'A cinematographer-led crew with gimbals and a licensed drone operator, producing a 4-minute teaser and a 20-minute feature film.',
   'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1200&q=80', 125000, 'day',
   array['2-camera cinematic crew','Licensed drone coverage','4-minute teaser','20-minute feature film','Licensed soundtrack'], false, 11),

  ('photography',   'instant-print-booth', 'Instant Print Photo Booth','Guests leave holding something',
   'A styled 360-degree booth with unlimited instant prints, a curated prop bar and an attendant, plus a digital gallery guests can download.',
   'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80', 28000, 'event',
   array['360-degree booth','Unlimited instant prints','Curated prop bar','On-site attendant','Digital gallery link'], false, 12),

  ('beauty',        'bridal-makeup',       'Bridal Makeup & Hair',     'HD makeup that survives a fourteen-hour day',
   'A lead artist for the bride across functions, with draping, hair styling and a trial session, plus optional artists for the family.',
   'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80', 45000, 'day',
   array['Lead artist for the bride','Trial session included','Saree and lehenga draping','Hair styling and extensions','Touch-up kit for the day'], true, 13),

  ('desserts',      'designer-cake',       'Designer Cake',            'The centrepiece you eat',
   'A multi-tier designer cake, hand-finished in your theme, with a tasting box sent ahead so you sign off on the flavour, not just the render.',
   'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80', 18000, 'event',
   array['Up to 4 tiers','Hand-finished theme detailing','Eggless and vegan options','Flavour tasting box','Cake table styling'], true, 14),

  ('logistics',     'venue-sourcing',      'Venue Sourcing & Liaison', 'We already know which hall actually fits 300',
   'Shortlisting, site visits, rate negotiation and full liaison with the venue — including permissions, load-in windows and vendor NOCs.',
   'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80', 40000, 'event',
   array['Curated shortlist of 5 venues','Accompanied site visits','Rate negotiation','Permissions and NOC handling','Load-in scheduling'], false, 15),

  ('hospitality',   'guest-hospitality',   'Guest Hospitality Desk',   'Ushers, welcome desk and zero confusion',
   'Uniformed ushers, a welcome and gifting desk, seating management and a guest-transport coordinator so nobody spends the evening looking for their table.',
   'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80', 32000, 'event',
   array['8 uniformed ushers','Welcome and gifting desk','Seating and RSVP management','Guest transport coordination','Valet supervision'], false, 16)
) as v(cat_slug, slug, name, tagline, description, image_url, base_price, price_unit, features, is_featured, sort_order)
join public.categories c on c.slug = v.cat_slug
on conflict (slug) do update set
  category_id = excluded.category_id,
  name        = excluded.name,
  tagline     = excluded.tagline,
  description = excluded.description,
  image_url   = excluded.image_url,
  base_price  = excluded.base_price,
  price_unit  = excluded.price_unit,
  features    = excluded.features,
  is_featured = excluded.is_featured,
  sort_order  = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Packages
-- ---------------------------------------------------------------------------
insert into public.packages (slug, name, event_type, tagline, description, hero_image_url, gallery, base_price, sale_price, guest_capacity, duration_hours, inclusions, is_featured, sort_order) values
  ('first-birthday-wonderland', 'First Birthday Wonderland', 'birthday',
   'The one they will only see in photographs',
   'A soft-pastel first-birthday build with a themed backdrop, organic balloon installation, a two-tier eggless cake, a kids'' menu with a live dessert counter, and an anchor who runs games for the older cousins. Setup begins four hours before the guests do.',
   'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'],
   95000, 79000, 60, 4,
   array['Themed backdrop and balloon installation','2-tier eggless designer cake','Kids'' menu + live dessert counter','Anchor with games and activities','Photographer for 4 hours','Return gifts for 30 children'], true, 1),

  ('teen-neon-night', 'Teen Neon Night', 'birthday',
   'Blacklight, bass and a very late curfew',
   'A neon-themed teen party with UV decor, a resident DJ, a glow photo booth and a street-food counter built around things teenagers actually eat. Includes on-ground supervision so the parents can leave.',
   'https://images.unsplash.com/photo-1470229722913-7ea0a0e4b5f5?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1470229722913-7ea0a0e4b5f5?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'],
   145000, 129000, 100, 5,
   array['UV and neon decor build','Signature DJ with light rig','Glow photo booth with instant prints','Street-food live counters','Mocktail bar','2 supervisors on ground'], true, 2),

  ('milestone-gold-soiree', 'Milestone Gold Soirée', 'birthday',
   'For the thirtieth, fiftieth or sixtieth that deserves a room',
   'A black-and-gold seated celebration — plated dinner, ambient architectural lighting, a live acoustic set through dinner and a DJ after, with a curated photo wall of the years so far.',
   'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'],
   285000, null, 150, 5,
   array['Black-and-gold decor and table styling','Plated 4-course dinner','Architectural and ambient lighting','Live acoustic set + DJ','Curated memory photo wall','Candid photography'], false, 3),

  ('classic-wedding-signature', 'The Signature Wedding', 'wedding',
   'Two days, one coordinator, nothing left to you',
   'Our most-booked wedding build: mehendi, sangeet and the wedding day itself. Fresh-flower mandap, multi-cuisine catering for 300, full candid and cinematic coverage, bridal beauty across functions, and a coordinator who lives on site from load-in to teardown.',
   'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'],
   1450000, 1295000, 300, 48,
   array['Mehendi, sangeet and wedding day','Fresh-flower mandap and stage','Multi-cuisine catering for 300','Candid photography + cinematic film','Bridal makeup across all functions','DJ, live band and anchor','Dedicated on-site coordinator','Guest hospitality and valet'], true, 4),

  ('intimate-vows', 'Intimate Vows', 'wedding',
   'Sixty people who actually matter',
   'A small-format wedding designed for a terrace, a courtyard or a boutique hotel lawn — minimal florals, a plated dinner, an acoustic duo and photography that stays out of the way.',
   'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'],
   550000, 495000, 60, 8,
   array['Minimal floral ceremony setup','Plated 5-course dinner for 60','Acoustic duo through the evening','Candid photography','Bridal makeup and draping','Venue sourcing and liaison'], true, 5),

  ('grand-shaadi-royale', 'Grand Shaadi Royale', 'wedding',
   'Five functions. Eight hundred guests. One command centre.',
   'The full destination-scale wedding — haldi, mehendi, sangeet, wedding and reception — with imported florals, a production-grade sangeet stage, guest transport and room-block management, and a crew of thirty on ground.',
   'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80'],
   4200000, null, 800, 120, 
   array['5 functions across 3 days','Imported floral and structural decor','Production-grade sangeet stage','Catering for 800 with 12 live counters','Full photo, film and drone crew','Guest transport and room-block management','30-member on-ground crew','Fireworks and entry production'], false, 6),

  ('silver-anniversary', 'Silver Anniversary Evening', 'anniversary',
   'Twenty-five years, one very good party',
   'A warm, candlelit anniversary evening with a family photo installation, plated dinner, a live ghazal-and-lounge set and a renewal-of-vows moment if you want one.',
   'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'],
   395000, 349000, 120, 5,
   array['Candlelit decor and table styling','Family photo installation','Plated dinner for 120','Live ghazal and lounge set','Renewal-of-vows setup','Candid photography'], false, 7),

  ('corporate-gala', 'Corporate Annual Gala', 'corporate',
   'An awards night your people will not skip next year',
   'A full corporate evening — branded stage and AV production, awards run-of-show, plated or buffet dining, a professional anchor and an after-party DJ, with registration and guest-badging handled.',
   'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80',
   array['https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80','https://images.unsplash.com/photo-1470229722913-7ea0a0e4b5f5?auto=format&fit=crop&w=1200&q=80'],
   750000, null, 400, 6,
   array['Branded stage and AV production','Awards run-of-show and scripting','Catering for 400','Professional anchor + after-party DJ','Registration and badging desk','Event photography and recap film'], false, 8)
on conflict (slug) do update set
  name           = excluded.name,
  event_type     = excluded.event_type,
  tagline        = excluded.tagline,
  description    = excluded.description,
  hero_image_url = excluded.hero_image_url,
  gallery        = excluded.gallery,
  base_price     = excluded.base_price,
  sale_price     = excluded.sale_price,
  guest_capacity = excluded.guest_capacity,
  duration_hours = excluded.duration_hours,
  inclusions     = excluded.inclusions,
  is_featured    = excluded.is_featured,
  sort_order     = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Which services each package already bundles
-- ---------------------------------------------------------------------------
insert into public.package_services (package_id, service_id)
select p.id, s.id
from (values
  ('first-birthday-wonderland', 'theme-decor'),
  ('first-birthday-wonderland', 'designer-cake'),
  ('first-birthday-wonderland', 'anchor-host'),
  ('first-birthday-wonderland', 'candid-photography'),
  ('teen-neon-night',           'signature-dj'),
  ('teen-neon-night',           'theme-decor'),
  ('teen-neon-night',           'instant-print-booth'),
  ('teen-neon-night',           'gourmet-buffet'),
  ('milestone-gold-soiree',     'ambient-lighting'),
  ('milestone-gold-soiree',     'plated-fine-dining'),
  ('milestone-gold-soiree',     'live-band'),
  ('milestone-gold-soiree',     'candid-photography'),
  ('classic-wedding-signature', 'floral-mandap'),
  ('classic-wedding-signature', 'gourmet-buffet'),
  ('classic-wedding-signature', 'candid-photography'),
  ('classic-wedding-signature', 'cinematic-film'),
  ('classic-wedding-signature', 'bridal-makeup'),
  ('classic-wedding-signature', 'signature-dj'),
  ('classic-wedding-signature', 'guest-hospitality'),
  ('intimate-vows',             'plated-fine-dining'),
  ('intimate-vows',             'candid-photography'),
  ('intimate-vows',             'bridal-makeup'),
  ('intimate-vows',             'venue-sourcing'),
  ('grand-shaadi-royale',       'floral-mandap'),
  ('grand-shaadi-royale',       'gourmet-buffet'),
  ('grand-shaadi-royale',       'cinematic-film'),
  ('grand-shaadi-royale',       'candid-photography'),
  ('grand-shaadi-royale',       'bridal-makeup'),
  ('grand-shaadi-royale',       'live-band'),
  ('grand-shaadi-royale',       'ambient-lighting'),
  ('grand-shaadi-royale',       'guest-hospitality'),
  ('silver-anniversary',        'ambient-lighting'),
  ('silver-anniversary',        'plated-fine-dining'),
  ('silver-anniversary',        'live-band'),
  ('corporate-gala',            'ambient-lighting'),
  ('corporate-gala',            'gourmet-buffet'),
  ('corporate-gala',            'anchor-host'),
  ('corporate-gala',            'signature-dj')
) as v(package_slug, service_slug)
join public.packages p on p.slug = v.package_slug
join public.services s on s.slug = v.service_slug
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- Testimonials
-- ---------------------------------------------------------------------------
delete from public.testimonials;
insert into public.testimonials (author_name, author_role, event_type, rating, quote, avatar_url, sort_order) values
  ('Ananya & Rohit Mehra', 'Signature Wedding, Udaipur', 'wedding', 5,
   'Three hundred guests, two days, and not one phone call to us. The mandap was better than the render, which never happens. Our coordinator knew where my grandmother was at all times.',
   'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80', 1),
  ('Kavita Iyer', 'First Birthday Wonderland, Mumbai', 'birthday', 5,
   'They set up while my daughter was napping and she woke up inside a pastel wonderland. The anchor kept eleven toddlers occupied for two hours. I did not carry a single thing.',
   'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80', 2),
  ('Siddharth Nair', 'Corporate Annual Gala, Bengaluru', 'corporate', 5,
   'Four hundred employees, a full awards run-of-show and an after-party that ran past midnight. The AV team rehearsed the entire script the night before. Attendance is up this year.',
   'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 3),
  ('Meera & Aditya Rao', 'Intimate Vows, Goa', 'wedding', 5,
   'We wanted sixty people and no spectacle. They understood immediately and built something quiet and beautiful. The photographs look like we were barely being photographed.',
   'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80', 4),
  ('Farhan Qureshi', 'Teen Neon Night, Pune', 'birthday', 4,
   'My son wanted neon and bass. He got both, plus supervisors who meant I could actually leave. Forty teenagers, zero incidents, one very good playlist.',
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80', 5),
  ('Sunita & Prakash Desai', 'Silver Anniversary Evening, Nashik', 'anniversary', 5,
   'The family photo installation had pictures we had forgotten existed. My husband cried during the ghazal set. Twenty-five years, and they still found a way to surprise us.',
   'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80', 6);
