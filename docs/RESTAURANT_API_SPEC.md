# Restaurant Platform API Specification

Add these endpoints to `openapi.yaml`. Use `openapi-typescript` to generate TS types for frontend.

---

## RESTAURANTS ENDPOINTS

### List Restaurants (Discovery)
```yaml
GET /v1/restaurants:
  parameters:
    - name: cuisine
      in: query
      schema: { type: string, enum: [North Indian, South Indian, Continental, Chinese, etc] }
    - name: location
      in: query
      schema: { type: string }
    - name: min_price
      in: query
      schema: { type: integer }
    - name: max_price
      in: query
      schema: { type: integer }
    - name: capacity_min
      in: query
      schema: { type: integer }
    - name: rating_min
      in: query
      schema: { type: number, format: float }
    - name: page
      in: query
      schema: { type: integer, default: 1 }
    - name: limit
      in: query
      schema: { type: integer, default: 20, maximum: 100 }
  responses:
    '200':
      description: List of restaurants
      content:
        application/json:
          schema:
            type: object
            properties:
              restaurants:
                type: array
                items:
                  $ref: '#/components/schemas/RestaurantCard'
              total:
                type: integer
              has_more:
                type: boolean

components:
  schemas:
    RestaurantCard:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        cuisine:
          type: array
          items:
            type: string
        location:
          type: string
        city:
          type: string
        avg_price_per_plate:
          type: integer
        avg_rating:
          type: number
          format: float
        review_count:
          type: integer
        has_3d_tour:
          type: boolean
        hero_image_url:
          type: string
          format: uri
        video_count:
          type: integer
```

### Get Restaurant Detail
```yaml
GET /v1/restaurants/{id}:
  parameters:
    - name: id
      in: path
      required: true
      schema: { type: string, format: uuid }
  responses:
    '200':
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/RestaurantDetail'

RestaurantDetail:
  type: object
  properties:
    id:
      type: string
    name:
      type: string
    description:
      type: string
    cuisine:
      type: array
      items:
        type: string
    location:
      type: string
      description: "e.g., Bandra, Mumbai"
    address:
      type: string
    coordinates:
      type: object
      properties:
        latitude:
          type: number
        longitude:
          type: number
    phone:
      type: string
    email:
      type: string
    website:
      type: string
    hours:
      type: array
      items:
        type: object
        properties:
          day:
            type: string
            enum: [Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday]
          open:
            type: string
            format: time
          close:
            type: string
            format: time
          closed:
            type: boolean
    avg_price_per_plate:
      type: integer
      description: "in rupees"
    dress_code:
      type: string
      enum: [Casual, Smart Casual, Formal]
    capacity:
      type: integer
    highlights:
      type: array
      items:
        type: string
        enum: [Rooftop, Private Rooms, Bar, Live Music, Outdoor Seating, Wheelchair Accessible]
    avg_rating:
      type: number
      format: float
    review_count:
      type: integer
    images:
      type: array
      items:
        type: object
        properties:
          id:
            type: string
          url:
            type: string
          caption:
            type: string
    videos:
      type: array
      items:
        $ref: '#/components/schemas/VideoItem'
    tour_3d:
      type: object
      properties:
        has_tour:
          type: boolean
        config_url:
          type: string
    reviews:
      type: array
      maxItems: 5
      items:
        $ref: '#/components/schemas/Review'
    owner_id:
      type: string
      description: "restaurant partner ID"

VideoItem:
  type: object
  properties:
    id:
      type: string
    title:
      type: string
    type:
      type: string
      enum: [ambiance, chef_special, menu_showcase, event_highlight, testimonial]
    mux_playback_id:
      type: string
    thumbnail_url:
      type: string
    duration_seconds:
      type: integer
    views:
      type: integer
    created_at:
      type: string
      format: date-time

Review:
  type: object
  properties:
    id:
      type: string
    user_id:
      type: string
    rating:
      type: number
      minimum: 1
      maximum: 5
    title:
      type: string
    comment:
      type: string
    aspect_ratings:
      type: object
      properties:
        food:
          type: number
        ambiance:
          type: number
        service:
          type: number
        value:
          type: number
    photos:
      type: array
      items:
        type: string
    created_at:
      type: string
      format: date-time
```

### Get Restaurant 3D Config
```yaml
GET /v1/restaurants/{id}/3d-config:
  responses:
    '200':
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Restaurant3DConfig'

Restaurant3DConfig:
  type: object
  properties:
    model_url:
      type: string
      format: uri
      description: "CDN URL to .glb file"
    model_scale:
      type: number
      description: "scaling factor for coordinate system"
    camera:
      type: object
      properties:
        position:
          type: array
          items:
            type: number
          minItems: 3
          maxItems: 3
        target:
          type: array
          items:
            type: number
          minItems: 3
          maxItems: 3
    hotspots:
      type: array
      items:
        type: object
        properties:
          id:
            type: string
          position:
            type: array
            items:
              type: number
            minItems: 3
          label:
            type: string
          description:
            type: string
          zone_id:
            type: string
    zones:
      type: array
      items:
        type: object
        properties:
          id:
            type: string
          name:
            type: string
          capacity:
            type: integer
          table_ids:
            type: array
            items:
              type: string
```

---

## BOOKINGS/EVENTS ENDPOINTS

### Create Event Booking
```yaml
POST /v1/events:
  requestBody:
    required: true
    content:
      application/json:
        schema:
          type: object
          properties:
            restaurant_id:
              type: string
              format: uuid
            event_type:
              type: string
              enum: [wedding, corporate, private_dinner, anniversary, birthday, other]
            guest_count:
              type: integer
              minimum: 2
              maximum: 1000
            date:
              type: string
              format: date
            start_time:
              type: string
              format: time
            duration_minutes:
              type: integer
              minimum: 60
              maximum: 480
            cuisine_preference:
              type: array
              items:
                type: string
            dietary_restrictions:
              type: array
              items:
                type: string
                enum: [vegetarian, vegan, gluten_free, dairy_free, nut_free, halal]
            table_preference:
              type: string
              description: "e.g., quiet_corner, bar_view, window_seat"
            budget_per_plate:
              type: integer
            special_requests:
              type: string
            contact_name:
              type: string
            contact_phone:
              type: string
            contact_email:
              type: string
  responses:
    '201':
      description: Event created
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Event'
    '400':
      description: Invalid input or restaurant not available
    '402':
      description: Booking requires deposit payment

Event:
  type: object
  properties:
    id:
      type: string
      format: uuid
    user_id:
      type: string
    restaurant_id:
      type: string
    event_type:
      type: string
    guest_count:
      type: integer
    date:
      type: string
      format: date
    start_time:
      type: string
      format: time
    duration_minutes:
      type: integer
    cuisine_preference:
      type: array
      items:
        type: string
    dietary_restrictions:
      type: array
      items:
        type: string
    status:
      type: string
      enum: [pending, confirmed, in_progress, completed, cancelled]
    deposit_amount:
      type: integer
      description: "in rupees"
    deposit_paid:
      type: boolean
    total_estimated_cost:
      type: integer
    created_at:
      type: string
      format: date-time
    updated_at:
      type: string
      format: date-time
```

### Get Available Tables
```yaml
GET /v1/restaurants/{id}/tables:
  parameters:
    - name: date
      in: query
      required: true
      schema: { type: string, format: date }
    - name: start_time
      in: query
      required: true
      schema: { type: string, format: time }
    - name: duration_minutes
      in: query
      required: true
      schema: { type: integer }
    - name: min_seats
      in: query
      schema: { type: integer, default: 2 }
  responses:
    '200':
      content:
        application/json:
          schema:
            type: object
            properties:
              tables:
                type: array
                items:
                  $ref: '#/components/schemas/TableAvailability'
              summary:
                type: object
                properties:
                  available_count:
                    type: integer
                  total_capacity:
                    type: integer

TableAvailability:
  type: object
  properties:
    id:
      type: string
    zone_name:
      type: string
    seats:
      type: integer
    position_3d:
      type: array
      items:
        type: number
    available:
      type: boolean
    price_per_plate:
      type: integer
    booked_until:
      type: string
      format: date-time
      nullable: true
    features:
      type: array
      items:
        type: string
        enum: [window_view, bar_view, private, semi_private]
```

### Customize Event
```yaml
PATCH /v1/events/{id}/customize:
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            menu_items:
              type: array
              items:
                type: object
                properties:
                  item_id:
                    type: string
                  quantity:
                    type: integer
                  customizations:
                    type: string
            decorations:
              type: object
              properties:
                theme:
                  type: string
                  enum: [minimal, floral, traditional, modern, romantic]
                budget:
                  type: integer
            activities:
              type: array
              items:
                type: string
                enum: [live_music, dj, games, photo_booth, caricature]
            photography:
              type: object
              properties:
                include:
                  type: boolean
                photographer_id:
                  type: string
                duration_hours:
                  type: integer
            special_arrangements:
              type: string
              description: "e.g., cake cutting, special entry, etc"
  responses:
    '200':
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Event'
```

### Get Event Details
```yaml
GET /v1/events/{id}:
  responses:
    '200':
      content:
        application/json:
          schema:
            type: object
            allOf:
              - $ref: '#/components/schemas/Event'
              - type: object
                properties:
                  restaurant:
                    $ref: '#/components/schemas/RestaurantCard'
                  customizations:
                    type: object
                    properties:
                      menu:
                        type: array
                        items:
                          type: object
                      decorations:
                        type: object
                      activities:
                        type: array
                        items:
                          type: string
                  invoice:
                    type: object
                    properties:
                      subtotal:
                        type: integer
                      taxes:
                        type: integer
                      total:
                        type: integer
                      due_date:
                        type: string
                        format: date
```

### Get User's Events
```yaml
GET /v1/user/events:
  parameters:
    - name: status
      in: query
      schema:
        type: string
        enum: [pending, confirmed, completed, cancelled]
    - name: sort
      in: query
      schema:
        type: string
        enum: [upcoming, recent]
  responses:
    '200':
      content:
        application/json:
          schema:
            type: object
            properties:
              events:
                type: array
                items:
                  $ref: '#/components/schemas/Event'
```

### Payment Endpoints

```yaml
POST /v1/payments/deposit:
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            event_id:
              type: string
            amount:
              type: integer
              description: "deposit amount in rupees"
  responses:
    '201':
      content:
        application/json:
          schema:
            type: object
            properties:
              razorpay_order_id:
                type: string
              amount:
                type: integer
              currency:
                type: string

POST /v1/payments/webhook/razorpay:
  description: "Razorpay payment webhook (Razorpay -> API)"
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            event:
              type: string
              enum: [payment.authorized, payment.failed, payment.captured]
            payload:
              type: object
```

---

## ADMIN/RESTAURANT PARTNER ENDPOINTS

### Create Restaurant (Admin/Partner)
```yaml
POST /v1/admin/restaurants:
  security:
    - bearerAuth: []
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            name:
              type: string
            cuisine:
              type: array
              items:
                type: string
            location:
              type: string
            address:
              type: string
            phone:
              type: string
            email:
              type: string
            website:
              type: string
            hours:
              type: array
              items:
                type: object
            avg_price_per_plate:
              type: integer
            capacity:
              type: integer
            dress_code:
              type: string
            highlights:
              type: array
              items:
                type: string
  responses:
    '201':
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/RestaurantDetail'
```

### Update Restaurant (Owner)
```yaml
PATCH /v1/admin/restaurants/{id}:
  security:
    - bearerAuth: []
  requestBody:
    content:
      application/json:
        schema:
          type: object
          # same properties as POST, all optional
```

### Manage Bookings (Restaurant Admin)
```yaml
GET /v1/admin/restaurants/{id}/bookings:
  security:
    - bearerAuth: []
  parameters:
    - name: date_from
      in: query
      schema: { type: string, format: date }
    - name: date_to
      in: query
      schema: { type: string, format: date }
    - name: status
      in: query
      schema: { type: string, enum: [pending, confirmed, completed, cancelled] }
  responses:
    '200':
      content:
        application/json:
          schema:
            type: object
            properties:
              bookings:
                type: array
                items:
                  $ref: '#/components/schemas/Event'

PATCH /v1/admin/bookings/{id}:
  security:
    - bearerAuth: []
  requestBody:
    content:
      application/json:
        schema:
          type: object
          properties:
            status:
              type: string
              enum: [confirmed, in_progress, completed, cancelled]
            notes:
              type: string
  responses:
    '200':
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Event'
```

---

## DATABASE SCHEMA (SQL Migrations)

```sql
-- /api/migrations/001_restaurants.sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  cuisines TEXT[] NOT NULL,
  location VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  website VARCHAR(255),
  hours JSONB NOT NULL, -- array of {day, open, close, closed}
  avg_price_per_plate INTEGER,
  capacity INTEGER NOT NULL,
  dress_code VARCHAR(50),
  highlights TEXT[],
  hero_image_url VARCHAR(255),
  rating_avg DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_verified BOOLEAN DEFAULT FALSE,
  INDEX (city, cuisines),
  INDEX (rating_avg DESC)
);

-- /api/migrations/002_events.sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE RESTRICT,
  event_type VARCHAR(50) NOT NULL,
  guest_count INTEGER NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  cuisine_preference TEXT[],
  dietary_restrictions TEXT[],
  table_preference VARCHAR(255),
  budget_per_plate INTEGER,
  special_requests TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  deposit_amount INTEGER,
  deposit_paid BOOLEAN DEFAULT FALSE,
  total_estimated_cost INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (restaurant_id, event_date),
  INDEX (user_id, status)
);

-- /api/migrations/003_videos.sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  mux_asset_id VARCHAR(255) NOT NULL UNIQUE,
  mux_playback_id VARCHAR(255) NOT NULL,
  thumbnail_url VARCHAR(255),
  duration_seconds INTEGER,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (restaurant_id)
);

-- /api/migrations/004_tables.sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  zone_name VARCHAR(100) NOT NULL,
  seats INTEGER NOT NULL,
  position_x DECIMAL(10, 6),
  position_y DECIMAL(10, 6),
  position_z DECIMAL(10, 6),
  price_per_plate INTEGER,
  features TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (restaurant_id)
);

-- /api/migrations/005_reviews.sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating DECIMAL(3, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment TEXT,
  food_rating DECIMAL(3, 1),
  ambiance_rating DECIMAL(3, 1),
  service_rating DECIMAL(3, 1),
  value_rating DECIMAL(3, 1),
  photos TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (event_id, rating DESC)
);
```

---

**Status:** ✅ Ready for OpenAPI Generation  
**Next:** Run `pnpm gen:api` in `/web` to generate TypeScript types
