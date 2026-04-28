-- +goose Up
-- +goose StatementBegin
-- Seed: 8 restaurants across Jaipur, Mumbai, Delhi, Bangalore. Realistic
-- pricing, hours, highlights. Plus a starter set of images, videos, and
-- verified reviews (so the aggregate trigger populates rating_avg /
-- review_count and the discovery feed has something to render).

INSERT INTO restaurants (
  id, owner_id, name, description, cuisines, location, city, address,
  latitude, longitude, phone, email, website, hours, avg_price_per_plate,
  capacity, dress_code, highlights, hero_image_url, has_3d_tour, is_verified
) VALUES
(
  '11111111-1111-1111-1111-111111111101', NULL,
  'Kibana Jaipur',
  'Cinematic rooftop dining overlooking the Pink City skyline. North Indian classics meet Continental favorites in an art-deco setting.',
  ARRAY['North Indian','Continental','Bar'],
  'C-Scheme', 'Jaipur',
  'Plot 14, Ashok Marg, C-Scheme, Jaipur, Rajasthan 302001',
  26.9124, 75.7873,
  '+91 141 4023456', 'hello@kibanajaipur.in', 'https://kibana.jaipur',
  '[
    {"day":"Monday","open":"12:00","close":"23:30","closed":false},
    {"day":"Tuesday","open":"12:00","close":"23:30","closed":false},
    {"day":"Wednesday","open":"12:00","close":"23:30","closed":false},
    {"day":"Thursday","open":"12:00","close":"23:30","closed":false},
    {"day":"Friday","open":"12:00","close":"01:00","closed":false},
    {"day":"Saturday","open":"12:00","close":"01:00","closed":false},
    {"day":"Sunday","open":"12:00","close":"23:30","closed":false}
  ]'::jsonb,
  1800, 180, 'Smart Casual',
  ARRAY['Rooftop','Bar','Live Music','Outdoor Seating'],
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600',
  TRUE, TRUE
),
(
  '11111111-1111-1111-1111-111111111102', NULL,
  'Saffron Banquets',
  'Premier banquet venue for weddings & corporate events. 500-seater pillar-less hall with Mughal-inspired decor.',
  ARRAY['North Indian','Mughlai'],
  'Vaishali Nagar', 'Jaipur',
  '7 Banquet Road, Vaishali Nagar, Jaipur, Rajasthan 302021',
  26.9047, 75.7396,
  '+91 141 4111222', 'events@saffronbanquets.in', NULL,
  '[
    {"day":"Monday","open":"10:00","close":"23:00","closed":false},
    {"day":"Tuesday","open":"10:00","close":"23:00","closed":false},
    {"day":"Wednesday","open":"10:00","close":"23:00","closed":false},
    {"day":"Thursday","open":"10:00","close":"23:00","closed":false},
    {"day":"Friday","open":"10:00","close":"23:00","closed":false},
    {"day":"Saturday","open":"10:00","close":"23:00","closed":false},
    {"day":"Sunday","open":"10:00","close":"23:00","closed":false}
  ]'::jsonb,
  1500, 500, 'Formal',
  ARRAY['Private Rooms','Wheelchair Accessible','Outdoor Seating'],
  'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600',
  FALSE, TRUE
),
(
  '11111111-1111-1111-1111-111111111103', NULL,
  'The Bombay Canteen',
  'A celebration of regional Indian cuisine — small plates, big flavors. Beloved Bandra institution.',
  ARRAY['Indian','Modern Indian','Bar'],
  'Lower Parel', 'Mumbai',
  'Process House, Kamala Mills, Lower Parel, Mumbai 400013',
  19.0144, 72.8278,
  '+91 22 49666666', 'reservations@thebombaycanteen.com', 'https://thebombaycanteen.com',
  '[
    {"day":"Monday","open":"12:00","close":"01:00","closed":false},
    {"day":"Tuesday","open":"12:00","close":"01:00","closed":false},
    {"day":"Wednesday","open":"12:00","close":"01:00","closed":false},
    {"day":"Thursday","open":"12:00","close":"01:00","closed":false},
    {"day":"Friday","open":"12:00","close":"01:30","closed":false},
    {"day":"Saturday","open":"12:00","close":"01:30","closed":false},
    {"day":"Sunday","open":"12:00","close":"01:00","closed":false}
  ]'::jsonb,
  2200, 120, 'Smart Casual',
  ARRAY['Bar','Live Music'],
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600',
  TRUE, TRUE
),
(
  '11111111-1111-1111-1111-111111111104', NULL,
  'Olive Bar & Kitchen',
  'Mediterranean coastal cuisine in a whitewashed Greek-island setting. Sunday brunch is a Mumbai institution.',
  ARRAY['Mediterranean','Italian','Continental','Bar'],
  'Bandra West', 'Mumbai',
  '14 Union Park, Khar West, Mumbai 400052',
  19.0728, 72.8347,
  '+91 22 26058228', 'bandra@olivebarandkitchen.com', 'https://olivebarandkitchen.com',
  '[
    {"day":"Monday","open":"19:00","close":"01:00","closed":false},
    {"day":"Tuesday","open":"19:00","close":"01:00","closed":false},
    {"day":"Wednesday","open":"19:00","close":"01:00","closed":false},
    {"day":"Thursday","open":"19:00","close":"01:00","closed":false},
    {"day":"Friday","open":"19:00","close":"01:30","closed":false},
    {"day":"Saturday","open":"12:00","close":"01:30","closed":false},
    {"day":"Sunday","open":"12:00","close":"01:00","closed":false}
  ]'::jsonb,
  3200, 200, 'Smart Casual',
  ARRAY['Outdoor Seating','Bar','Live Music'],
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600',
  FALSE, TRUE
),
(
  '11111111-1111-1111-1111-111111111105', NULL,
  'Indian Accent',
  'India''s most-awarded restaurant. Inventive modern Indian tasting menus by Chef Manish Mehrotra.',
  ARRAY['Modern Indian','Fine Dining'],
  'Lodhi Road', 'Delhi',
  'The Lodhi, Lodhi Road, New Delhi 110003',
  28.5901, 77.2266,
  '+91 11 66175151', 'reservations@indianaccent.com', 'https://indianaccent.com',
  '[
    {"day":"Monday","open":"19:00","close":"23:00","closed":false},
    {"day":"Tuesday","open":"19:00","close":"23:00","closed":false},
    {"day":"Wednesday","open":"19:00","close":"23:00","closed":false},
    {"day":"Thursday","open":"19:00","close":"23:00","closed":false},
    {"day":"Friday","open":"19:00","close":"23:30","closed":false},
    {"day":"Saturday","open":"12:30","close":"23:30","closed":false},
    {"day":"Sunday","open":"12:30","close":"23:00","closed":false}
  ]'::jsonb,
  5500, 90, 'Smart Casual',
  ARRAY['Private Rooms','Wheelchair Accessible'],
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600',
  TRUE, TRUE
),
(
  '11111111-1111-1111-1111-111111111106', NULL,
  'Karavalli',
  'Coastal cuisines of southwest India in a heritage-style courtyard. Goan, Mangalorean, Kerala specialties.',
  ARRAY['South Indian','Coastal','Seafood'],
  'Residency Road', 'Bangalore',
  'The Gateway Hotel, 66 Residency Road, Bangalore 560025',
  12.9648, 77.6037,
  '+91 80 66604444', 'karavalli@tajhotels.com', NULL,
  '[
    {"day":"Monday","open":"12:30","close":"15:00","closed":false},
    {"day":"Tuesday","open":"12:30","close":"15:00","closed":false},
    {"day":"Wednesday","open":"12:30","close":"15:00","closed":false},
    {"day":"Thursday","open":"12:30","close":"15:00","closed":false},
    {"day":"Friday","open":"12:30","close":"15:00","closed":false},
    {"day":"Saturday","open":"12:30","close":"15:30","closed":false},
    {"day":"Sunday","open":"12:30","close":"15:30","closed":false}
  ]'::jsonb,
  3800, 110, 'Smart Casual',
  ARRAY['Outdoor Seating','Wheelchair Accessible'],
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600',
  FALSE, TRUE
),
(
  '11111111-1111-1111-1111-111111111107', NULL,
  'Royal Heritage Banquets',
  'Rajasthani palace-themed wedding venue with frescoed halls and a 2-acre lawn. Capacity for 800 guests.',
  ARRAY['North Indian','Rajasthani','Continental'],
  'Amer Road', 'Jaipur',
  'NH-21A, Amer Road, Jaipur 302002',
  26.9855, 75.8513,
  '+91 141 2530100', 'bookings@royalheritagebanquets.com', NULL,
  '[
    {"day":"Monday","open":"09:00","close":"23:30","closed":false},
    {"day":"Tuesday","open":"09:00","close":"23:30","closed":false},
    {"day":"Wednesday","open":"09:00","close":"23:30","closed":false},
    {"day":"Thursday","open":"09:00","close":"23:30","closed":false},
    {"day":"Friday","open":"09:00","close":"23:30","closed":false},
    {"day":"Saturday","open":"09:00","close":"23:30","closed":false},
    {"day":"Sunday","open":"09:00","close":"23:30","closed":false}
  ]'::jsonb,
  1200, 800, 'Formal',
  ARRAY['Private Rooms','Outdoor Seating','Wheelchair Accessible','Live Music'],
  'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600',
  TRUE, TRUE
),
(
  '11111111-1111-1111-1111-111111111108', NULL,
  'Toast & Tonic',
  'Modern bistro with a global menu and an inventive cocktail program. Industrial-chic interior with an open kitchen.',
  ARRAY['Continental','Asian','Bar'],
  'Ashok Nagar', 'Bangalore',
  '14/1 Wood Street, Ashok Nagar, Bangalore 560025',
  12.9719, 77.6074,
  '+91 80 41758888', 'hello@toastandtonic.com', 'https://toastandtonic.com',
  '[
    {"day":"Monday","open":"12:00","close":"23:30","closed":false},
    {"day":"Tuesday","open":"12:00","close":"23:30","closed":false},
    {"day":"Wednesday","open":"12:00","close":"23:30","closed":false},
    {"day":"Thursday","open":"12:00","close":"23:30","closed":false},
    {"day":"Friday","open":"12:00","close":"01:00","closed":false},
    {"day":"Saturday","open":"12:00","close":"01:00","closed":false},
    {"day":"Sunday","open":"12:00","close":"23:30","closed":false}
  ]'::jsonb,
  2400, 95, 'Casual',
  ARRAY['Bar','Outdoor Seating'],
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1600',
  FALSE, TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Image gallery (3 per restaurant; first is hero, rest are gallery)
INSERT INTO restaurant_images (id, restaurant_id, url, type, caption, sort_order) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1600', 'hero', 'Rooftop at golden hour', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600', 'interior', 'Main dining room', 1),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1600', 'dish', 'Signature lamb shank', 2),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111102', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1600', 'hero', 'Mughal-inspired hall', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111102', 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600', 'interior', 'Wedding setup', 1),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111103', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600', 'hero', 'Open kitchen', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111103', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600', 'dish', 'Goan prawn curry', 1),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111104', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600', 'hero', 'Mediterranean courtyard', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111104', 'https://images.unsplash.com/photo-1481833761820-0509d3217039?w=1600', 'exterior', 'Sunday brunch lawn', 1),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111105', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1600', 'hero', 'Tasting menu plating', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111105', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=1600', 'dish', 'Chef''s amuse bouche', 1),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111106', 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1600', 'hero', 'Coastal courtyard', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111107', 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1600', 'hero', 'Palace lawn at dusk', 0),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111107', 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600', 'interior', 'Frescoed banquet hall', 1),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111108', 'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1600', 'hero', 'Industrial-chic bar', 0)
ON CONFLICT DO NOTHING;

-- Videos (mux_playback_id is a placeholder ID; real Mux assets land in Phase 2).
-- Mux's public sample asset 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq' is reused
-- so the video player can render something while we wait for real ingest.
INSERT INTO restaurant_videos (id, restaurant_id, title, type, mux_asset_id, mux_playback_id, thumbnail_url, duration_seconds, views) VALUES
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'Sunset on the Kibana rooftop', 'ambiance',      'seed-asset-101a', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', 'https://image.mux.com/GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq/thumbnail.jpg?width=640', 42, 1240),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111101', 'Chef Arjun on the lamb shank',  'chef_special',  'seed-asset-101b', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', 'https://image.mux.com/GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq/thumbnail.jpg?width=640', 88, 540),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111103', 'Bombay Canteen kitchen reel',   'menu_showcase', 'seed-asset-103a', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', 'https://image.mux.com/GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq/thumbnail.jpg?width=640', 65, 2200),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111104', 'Olive — Sunday brunch',         'event_highlight','seed-asset-104a', 'GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', 'https://image.mux.com/GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq/thumbnail.jpg?width=640', 51, 980),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111105', 'Indian Accent tasting walkthrough','menu_showcase','seed-asset-105a','GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', 'https://image.mux.com/GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq/thumbnail.jpg?width=640',120, 4500),
  (gen_random_uuid(), '11111111-1111-1111-1111-111111111107', 'Royal Heritage wedding film',   'event_highlight','seed-asset-107a','GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq', 'https://image.mux.com/GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq/thumbnail.jpg?width=640',180,12500)
ON CONFLICT DO NOTHING;

-- Verified reviews (email_verified=TRUE so the trigger updates rating_avg/review_count).
-- We bypass POST /reviews because the dev mailer logs links instead of sending them.
INSERT INTO restaurant_reviews (id, restaurant_id, user_name, user_email, rating, title, comment,
                                food_rating, ambiance_rating, service_rating, value_rating, email_verified) VALUES
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111101','Aarav Mehta','aarav.mehta@example.com',4.6,'Best rooftop in Jaipur','Stunning views and the lamb shank lives up to the hype.',  4.7,5.0,4.5,4.0,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111101','Priya Singh','priya.singh@example.com',4.8,'Anniversary night to remember','Service was attentive without being intrusive.',           5.0,4.5,5.0,4.5,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111102','Rohan Sharma','rohan.s@example.com',     4.4,'Hosted our reception here','Pillar-less hall is gorgeous, food kept up with 450 guests.', 4.5,4.5,4.5,4.0,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111103','Neha Iyer','neha.iyer@example.com',     4.7,'Regional Indian done right','Goa pork ribs and the trotter samosas are unmissable.',     5.0,4.5,4.5,4.5,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111104','Karan Joshi','karan.joshi@example.com', 4.5,'Brunch perfection','Sunday brunch with the gospel band is the only place to be.',            4.5,5.0,4.0,4.0,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111105','Maya Verma','maya.v@example.com',       4.9,'Worth every rupee','Easily the most inventive Indian food in Delhi.',                        5.0,4.5,5.0,4.5,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111106','Vikram Rao','vikram.rao@example.com',   4.6,'Coastal flavors transport you','Appam with stew and the prawn curry are exceptional.',     4.7,4.5,4.5,4.7,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111107','Anjali Kapoor','anjali.k@example.com',  4.5,'Magical wedding venue','Frescoed halls and the lawn fit our 600-guest baraat easily.',     4.5,5.0,4.5,4.0,TRUE),
  (gen_random_uuid(),'11111111-1111-1111-1111-111111111108','Sahil Desai','sahil.d@example.com',     4.3,'Great cocktail program','Tasting flight at the bar is well-curated. Open kitchen is a nice touch.',4.0,4.5,4.5,4.0,TRUE)
ON CONFLICT DO NOTHING;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DELETE FROM restaurant_reviews WHERE restaurant_id IN (
  '11111111-1111-1111-1111-111111111101','11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103','11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105','11111111-1111-1111-1111-111111111106',
  '11111111-1111-1111-1111-111111111107','11111111-1111-1111-1111-111111111108'
);
DELETE FROM restaurant_videos WHERE restaurant_id IN (
  '11111111-1111-1111-1111-111111111101','11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103','11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105','11111111-1111-1111-1111-111111111106',
  '11111111-1111-1111-1111-111111111107','11111111-1111-1111-1111-111111111108'
);
DELETE FROM restaurant_images WHERE restaurant_id IN (
  '11111111-1111-1111-1111-111111111101','11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103','11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105','11111111-1111-1111-1111-111111111106',
  '11111111-1111-1111-1111-111111111107','11111111-1111-1111-1111-111111111108'
);
DELETE FROM restaurants WHERE id IN (
  '11111111-1111-1111-1111-111111111101','11111111-1111-1111-1111-111111111102',
  '11111111-1111-1111-1111-111111111103','11111111-1111-1111-1111-111111111104',
  '11111111-1111-1111-1111-111111111105','11111111-1111-1111-1111-111111111106',
  '11111111-1111-1111-1111-111111111107','11111111-1111-1111-1111-111111111108'
);
-- +goose StatementEnd
