-- +goose Up
-- +goose StatementBegin
-- Kibana-specific seed: 4 banquet halls, 6 menu categories with 30+ items,
-- 5 placeholder videos, expanded image gallery pointing at /images/kibana-jaipur/.
--
-- Image paths are relative — they'll be served by the Vercel frontend's
-- /public/images/kibana-jaipur/ directory once content team uploads them.

-- Make sure the Kibana row exists (idempotent insert; the previous seed file
-- already inserts it but this keeps the migration self-contained).
INSERT INTO restaurants (
  id, owner_id, name, description, cuisines, location, city, address,
  latitude, longitude, phone, email, website, hours, avg_price_per_plate,
  capacity, dress_code, highlights, hero_image_url, has_3d_tour, is_verified
) VALUES (
  '11111111-1111-1111-1111-111111111101', NULL,
  'Kibana Jaipur',
  'Cinematic rooftop dining overlooking the Pink City skyline. North Indian classics meet Continental favorites in an art-deco setting. Premier venue for weddings, corporate events, and intimate celebrations.',
  ARRAY['North Indian','Continental','Bar'],
  'C-Scheme', 'Jaipur',
  'Plot 14, Ashok Marg, C-Scheme, Jaipur, Rajasthan 302001',
  26.9124, 75.7873,
  '+91 141 4023456', 'hello@kibanajaipur.in', 'https://kibana.saudagars.org',
  '[
    {"day":"Monday","open":"12:00","close":"23:30","closed":false},
    {"day":"Tuesday","open":"12:00","close":"23:30","closed":false},
    {"day":"Wednesday","open":"12:00","close":"23:30","closed":false},
    {"day":"Thursday","open":"12:00","close":"23:30","closed":false},
    {"day":"Friday","open":"12:00","close":"01:00","closed":false},
    {"day":"Saturday","open":"12:00","close":"01:00","closed":false},
    {"day":"Sunday","open":"12:00","close":"23:30","closed":false}
  ]'::jsonb,
  1800, 350, 'Smart Casual',
  ARRAY['Rooftop','Bar','Live Music','Outdoor Seating','Private Rooms','Wheelchair Accessible'],
  '/images/kibana-jaipur/hero/rooftop-night.jpg',
  TRUE, TRUE
)
ON CONFLICT (id) DO UPDATE SET
  description    = EXCLUDED.description,
  capacity       = EXCLUDED.capacity,
  highlights     = EXCLUDED.highlights,
  hero_image_url = EXCLUDED.hero_image_url,
  website        = EXCLUDED.website,
  updated_at     = NOW();

-- ----- Banquet halls (4) ---------------------------------------------------
INSERT INTO banquet_halls (
  id, restaurant_id, name, description,
  capacity_min, capacity_max, price_per_plate, hire_charge,
  features, hero_image_url, images, sort_order
) VALUES
(
  '22222222-2222-2222-2222-222222222201',
  '11111111-1111-1111-1111-111111111101',
  'The Crown Ballroom',
  'Our flagship pillar-less ballroom with 25-foot ceilings, crystal chandeliers, and a 360° projection wall. The premier venue for weddings and gala dinners.',
  150, 500, 2400, 75000,
  ARRAY['Pillar-less','25ft Ceilings','LED Wall','Dance Floor','Bridal Suite','Dedicated Entrance','Valet Parking'],
  '/images/kibana-jaipur/banquets/crown/hero.jpg',
  ARRAY[
    '/images/kibana-jaipur/banquets/crown/01.jpg',
    '/images/kibana-jaipur/banquets/crown/02.jpg',
    '/images/kibana-jaipur/banquets/crown/03.jpg',
    '/images/kibana-jaipur/banquets/crown/04.jpg'
  ],
  1
),
(
  '22222222-2222-2222-2222-222222222202',
  '11111111-1111-1111-1111-111111111101',
  'Sky Terrace',
  'Open-air rooftop venue with panoramic Pink City views. Twinkle-lit ceiling, fire pits, and sunset cocktail bar — ideal for receptions and engagement parties.',
  60, 200, 2800, 50000,
  ARRAY['Rooftop','Open Air','Sunset Views','Fire Pits','Cocktail Bar','Heated in Winter'],
  '/images/kibana-jaipur/banquets/sky-terrace/hero.jpg',
  ARRAY[
    '/images/kibana-jaipur/banquets/sky-terrace/01.jpg',
    '/images/kibana-jaipur/banquets/sky-terrace/02.jpg',
    '/images/kibana-jaipur/banquets/sky-terrace/03.jpg'
  ],
  2
),
(
  '22222222-2222-2222-2222-222222222203',
  '11111111-1111-1111-1111-111111111101',
  'The Mehfil',
  'Traditional Rajasthani-themed hall with hand-painted frescoes, low seating option, and a stage for live performances. Perfect for sangeets and cultural events.',
  80, 250, 2200, 40000,
  ARRAY['Stage','Sound System','Low Seating Available','Frescoed Walls','Dance Floor','Adjacent Powder Rooms'],
  '/images/kibana-jaipur/banquets/mehfil/hero.jpg',
  ARRAY[
    '/images/kibana-jaipur/banquets/mehfil/01.jpg',
    '/images/kibana-jaipur/banquets/mehfil/02.jpg',
    '/images/kibana-jaipur/banquets/mehfil/03.jpg'
  ],
  3
),
(
  '22222222-2222-2222-2222-222222222204',
  '11111111-1111-1111-1111-111111111101',
  'The Boardroom',
  'Intimate private dining room with conference setup option. AV-equipped for corporate events, private dinners, and small celebrations up to 40 guests.',
  10, 40, 3200, 15000,
  ARRAY['Private','AV Equipment','Conference Setup','Whisper-quiet','Dedicated Server','Wine Cellar Adjacent'],
  '/images/kibana-jaipur/banquets/boardroom/hero.jpg',
  ARRAY[
    '/images/kibana-jaipur/banquets/boardroom/01.jpg',
    '/images/kibana-jaipur/banquets/boardroom/02.jpg'
  ],
  4
)
ON CONFLICT (id) DO NOTHING;

-- ----- Menu categories (6) -------------------------------------------------
INSERT INTO menu_categories (id, restaurant_id, name, description, sort_order) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111101', 'Appetizers',         'Small plates to start the evening — perfect with cocktails.', 1),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111101', 'Soups & Salads',     'Light, seasonal openers from our kitchen garden.',             2),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111101', 'Main Course — Indian','House classics and chef''s signature creations.',             3),
('33333333-3333-3333-3333-333333333304', '11111111-1111-1111-1111-111111111101', 'Main Course — Continental','Globally-inspired plates with seasonal local produce.',     4),
('33333333-3333-3333-3333-333333333305', '11111111-1111-1111-1111-111111111101', 'Desserts',           'House-made indulgences and traditional Indian sweets.',         5),
('33333333-3333-3333-3333-333333333306', '11111111-1111-1111-1111-111111111101', 'Beverages & Bar',    'Craft cocktails, sommelier-curated wines, and zero-proof options.',6)
ON CONFLICT (id) DO NOTHING;

-- ----- Menu items (32) -----------------------------------------------------
INSERT INTO menu_items (id, category_id, name, description, price, is_veg, is_signature, spice_level, image_url, sort_order) VALUES
-- Appetizers
(gen_random_uuid(), '33333333-3333-3333-3333-333333333301', 'Tandoori Mushroom Bharwan', 'Cremini mushrooms stuffed with paneer & spinach, charred in the tandoor.', 480, TRUE,  TRUE,  1, '/images/kibana-jaipur/menu/tandoori-mushroom.jpg', 1),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333301', 'Galouti Kebab',             'Lucknowi minced lamb kebab, served on saffron ulte tawa paratha.',          620, FALSE, TRUE,  2, '/images/kibana-jaipur/menu/galouti.jpg',           2),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333301', 'Burrata Caprese',           'House-pulled burrata, heirloom tomatoes, basil oil, balsamic pearls.',      560, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/burrata.jpg',           3),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333301', 'Crispy Calamari',           'Cornmeal-dusted calamari, smoked paprika aioli, lemon.',                    540, FALSE, FALSE, 1, '/images/kibana-jaipur/menu/calamari.jpg',          4),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333301', 'Dahi Ke Kebab',             'Hung curd, cashew, golden saffron — pan-seared.',                           420, TRUE,  FALSE, 1, '/images/kibana-jaipur/menu/dahi-kebab.jpg',        5),
-- Soups & Salads
(gen_random_uuid(), '33333333-3333-3333-3333-333333333302', 'Tomato Dhaniya Shorba',     'Slow-roasted tomato broth, fresh coriander, cracked pepper.',               320, TRUE,  FALSE, 1, '/images/kibana-jaipur/menu/tomato-shorba.jpg',     1),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333302', 'Murgh Yakhni',              'Kashmiri chicken broth with whole spices and almond cream.',                380, FALSE, FALSE, 1, '/images/kibana-jaipur/menu/yakhni.jpg',            2),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333302', 'Garden Quinoa Bowl',        'Quinoa, roasted beets, feta, citrus vinaigrette, candied walnuts.',         460, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/quinoa-bowl.jpg',       3),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333302', 'Caesar Salad',              'Cos lettuce, classic dressing, parmesan crisps. Add chicken +120.',         380, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/caesar.jpg',            4),
-- Main Course Indian
(gen_random_uuid(), '33333333-3333-3333-3333-333333333303', 'Laal Maas',                 'Rajasthani heirloom — tender lamb, mathania chillies, smoked finish.',      820, FALSE, TRUE,  3, '/images/kibana-jaipur/menu/laal-maas.jpg',         1),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333303', 'Murgh Makhani',             'Tandoori chicken, slow-simmered tomato-fenugreek gravy, fresh cream.',      720, FALSE, TRUE,  1, '/images/kibana-jaipur/menu/butter-chicken.jpg',    2),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333303', 'Dal Kibana',                'Black urad slow-cooked overnight on dum, finished with butter & cream.',    540, TRUE,  TRUE,  1, '/images/kibana-jaipur/menu/dal-kibana.jpg',        3),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333303', 'Paneer Lababdar',           'Cottage cheese, royal cumin, cashew-tomato gravy, fresh fenugreek.',        620, TRUE,  FALSE, 1, '/images/kibana-jaipur/menu/paneer-lababdar.jpg',   4),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333303', 'Awadhi Biryani',            'Long-grain rice, lamb on the bone, sealed dum, mint-onion raita.',          780, FALSE, TRUE,  2, '/images/kibana-jaipur/menu/biryani.jpg',           5),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333303', 'Subz Miloni',               'Five-vegetable medley, ginger-tomato gravy, cashew finish.',                560, TRUE,  FALSE, 1, '/images/kibana-jaipur/menu/subz-miloni.jpg',       6),
-- Main Course Continental
(gen_random_uuid(), '33333333-3333-3333-3333-333333333304', 'Lamb Shank Bourguignon',    'Slow-braised lamb shank, red wine jus, root vegetables, mash.',            1280, FALSE, TRUE,  0, '/images/kibana-jaipur/menu/lamb-shank.jpg',        1),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333304', 'Pan-Seared Sea Bass',       'Atlantic sea bass, lemon-caper butter, asparagus, saffron risotto.',        980, FALSE, FALSE, 0, '/images/kibana-jaipur/menu/sea-bass.jpg',          2),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333304', 'Wild Mushroom Risotto',     'Arborio rice, porcini, truffle oil, aged parmesan.',                        720, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/risotto.jpg',           3),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333304', 'Margherita Pizza',          'San Marzano tomato, fior di latte, basil, wood-fired stone oven.',          580, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/margherita.jpg',        4),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333304', 'Penne Arrabiata',           'Roma tomato, garlic, dried chilli, parmesan.',                              520, TRUE,  FALSE, 2, '/images/kibana-jaipur/menu/arrabiata.jpg',         5),
-- Desserts
(gen_random_uuid(), '33333333-3333-3333-3333-333333333305', 'Saffron Rasmalai',          'Soft milk dumplings, saffron-cardamom-pistachio cream.',                    360, TRUE,  TRUE,  0, '/images/kibana-jaipur/menu/rasmalai.jpg',          1),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333305', 'Dark Chocolate Fondant',    '70% Valrhona, molten centre, vanilla bean ice-cream.',                      420, TRUE,  TRUE,  0, '/images/kibana-jaipur/menu/fondant.jpg',           2),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333305', 'Tiramisu',                  'Mascarpone, espresso-soaked ladyfingers, cocoa dust.',                      380, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/tiramisu.jpg',          3),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333305', 'Gulab Jamun Cheesecake',    'Khoya cheesecake, gulab jamun core, rose-pistachio crumble.',               360, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/gulab-cheesecake.jpg',  4),
-- Beverages
(gen_random_uuid(), '33333333-3333-3333-3333-333333333306', 'Pink City Spritz',          'Aperol, prosecco, hibiscus, soda, dehydrated rose.',                        520, TRUE,  TRUE,  0, '/images/kibana-jaipur/menu/pink-city-spritz.jpg',  1),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333306', 'Smoked Old Fashioned',      'Bourbon, demerara, orange-peel oils, applewood smoke at the table.',        680, TRUE,  TRUE,  0, '/images/kibana-jaipur/menu/old-fashioned.jpg',     2),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333306', 'Saffron Lassi',             'Hung curd, saffron, cardamom, jaggery, slivered pistachio.',                280, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/saffron-lassi.jpg',     3),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333306', 'Masala Chai',               'Estate Assam, hand-pounded spices, full-cream milk.',                       180, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/chai.jpg',              4),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333306', 'House Red — Sula Dindori',  'Indian Shiraz blend, glass.',                                               520, TRUE,  FALSE, 0, NULL,                                                   5),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333306', 'Fresh Coconut Cooler',      'Tender coconut, lime, mint, sea salt, no sugar.',                           240, TRUE,  FALSE, 0, '/images/kibana-jaipur/menu/coconut-cooler.jpg',    6)
ON CONFLICT DO NOTHING;

-- ----- Extra videos (5 placeholders pointing at Mux's public sample) -------
INSERT INTO restaurant_videos (id, restaurant_id, title, type, mux_asset_id, mux_playback_id, thumbnail_url, duration_seconds, views) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'Welcome to Kibana — full tour',  'ambiance',        'kibana-vid-001', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', '/images/kibana-jaipur/video-thumbs/tour.jpg',         95,  4200),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'The Crown Ballroom in motion',   'event_highlight', 'kibana-vid-002', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', '/images/kibana-jaipur/video-thumbs/crown.jpg',        72,  2800),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'Chef''s table: Laal Maas reveal','chef_special',    'kibana-vid-003', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', '/images/kibana-jaipur/video-thumbs/laal-maas.jpg',    58,  1900),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'A Kibana sangeet, captured',     'event_highlight', 'kibana-vid-004', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', '/images/kibana-jaipur/video-thumbs/sangeet.jpg',     140,  6700),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'Sky Terrace at golden hour',     'ambiance',        'kibana-vid-005', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', '/images/kibana-jaipur/video-thumbs/sky-terrace.jpg',  48,  3300)
ON CONFLICT DO NOTHING;

-- ----- Expanded image gallery (15 more, pointing at /public/images/kibana-jaipur) ----
INSERT INTO restaurant_images (id, restaurant_id, url, type, caption, sort_order) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/hero/rooftop-night.jpg',         'hero',     'Rooftop after dark', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/hero/dining-room.jpg',           'interior', 'Main dining room', 10),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/hero/bar.jpg',                   'interior', 'The bar at Kibana', 11),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/hero/entrance.jpg',              'exterior', 'Arched entrance on Ashok Marg', 12),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/gallery/sunset-1.jpg',           'gallery',  'Sunset over the Pink City', 20),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/gallery/wedding-reception.jpg',  'gallery',  'A wedding reception in The Crown', 21),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/gallery/sangeet-stage.jpg',      'gallery',  'Sangeet stage in The Mehfil', 22),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/gallery/cocktail-bar.jpg',       'gallery',  'Cocktail program at the bar', 23),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/gallery/private-dining.jpg',     'gallery',  'The Boardroom private dining', 24),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/dishes/laal-maas.jpg',           'dish',     'Laal Maas — heritage Rajasthani', 30),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/dishes/galouti.jpg',             'dish',     'Galouti kebab on saffron paratha', 31),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/dishes/lamb-shank.jpg',          'dish',     'Lamb shank bourguignon', 32),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/dishes/burrata.jpg',             'dish',     'House-pulled burrata', 33),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/menu/full-menu.jpg',             'menu',     'Full à la carte menu', 40),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', '/images/kibana-jaipur/menu/banquet-menu.jpg',          'menu',     'Sample banquet menu',   41)
ON CONFLICT DO NOTHING;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM menu_items WHERE category_id IN (
  '33333333-3333-3333-3333-333333333301','33333333-3333-3333-3333-333333333302',
  '33333333-3333-3333-3333-333333333303','33333333-3333-3333-3333-333333333304',
  '33333333-3333-3333-3333-333333333305','33333333-3333-3333-3333-333333333306'
);
DELETE FROM menu_categories WHERE restaurant_id = '11111111-1111-1111-1111-111111111101';
DELETE FROM banquet_halls   WHERE restaurant_id = '11111111-1111-1111-1111-111111111101';
-- +goose StatementEnd
