// Restaurant Platform API client + domain types (Phase 1).
// Mirrors docs/RESTAURANT_API_SPEC.md. Uses the shared `api()` helper for
// consistent base URL + auth handling. Falls back to mock data while the
// Go API is being built (NEXT_PUBLIC_USE_MOCK_RESTAURANTS=1).

import { api } from "./api";

// ---------- Domain types ----------

export interface RestaurantCard {
  id: string;
  name: string;
  cuisine: string[];
  location: string;
  city: string;
  avg_price_per_plate: number;
  avg_rating: number;
  review_count: number;
  has_3d_tour: boolean;
  hero_image_url: string;
  video_count: number;
}

export interface RestaurantHours {
  [day: string]: { open: string; close: string } | null;
}

export interface RestaurantVideo {
  id: string;
  title: string;
  type: "ambiance" | "chef" | "menu" | "event";
  mux_playback_id: string;
  thumbnail_url?: string;
  duration_s?: number;
  views?: number;
}

export interface RestaurantImage {
  id: string;
  url: string;
  type: "ambiance" | "food" | "event";
  caption?: string;
}

export interface Review {
  id: string;
  restaurant_id: string;
  rating: number; // 1-5
  comment: string;
  user_name: string;
  user_email?: string; // hidden from public
  created_at: string;
  owner_response?: string;
}

export interface RestaurantDetail extends RestaurantCard {
  description: string;
  address: string;
  phone: string;
  website?: string;
  hours: RestaurantHours;
  capacity: number;
  highlights: string[];
  videos: RestaurantVideo[];
  images: RestaurantImage[];
  reviews: Review[];
}

export interface RestaurantListResponse {
  restaurants: RestaurantCard[];
  total: number;
  has_more: boolean;
}

export interface RestaurantFilters {
  cuisine?: string;
  location?: string;
  min_price?: number;
  max_price?: number;
  rating_min?: number;
  q?: string;
  page?: number;
  limit?: number;
}

export interface ReviewListResponse {
  reviews: Review[];
  total: number;
  has_more: boolean;
}

// ---------- Mock data (Phase 1 — until Go API is up) ----------

const USE_MOCK =
  typeof process !== "undefined" &&
  (process.env.NEXT_PUBLIC_USE_MOCK_RESTAURANTS === "1" ||
    !process.env.NEXT_PUBLIC_API_BASE_URL);

const MOCK_RESTAURANTS: RestaurantDetail[] = [
  {
    id: "r-001",
    name: "Saffron & Smoke",
    cuisine: ["North Indian", "Mughlai"],
    location: "Bandra West",
    city: "Mumbai",
    avg_price_per_plate: 1200,
    avg_rating: 4.6,
    review_count: 218,
    has_3d_tour: false,
    hero_image_url:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80",
    video_count: 4,
    description:
      "A modern take on slow-cooked Mughlai classics, served in a candlelit courtyard with live ghazals every weekend.",
    address: "21, Linking Road, Bandra West, Mumbai 400050",
    phone: "+91 22 4000 1212",
    website: "https://saffronandsmoke.example.com",
    hours: {
      Mon: { open: "12:00", close: "23:00" },
      Tue: { open: "12:00", close: "23:00" },
      Wed: { open: "12:00", close: "23:00" },
      Thu: { open: "12:00", close: "23:00" },
      Fri: { open: "12:00", close: "00:00" },
      Sat: { open: "12:00", close: "00:00" },
      Sun: { open: "12:00", close: "23:00" },
    },
    capacity: 80,
    highlights: ["Rooftop", "Live music", "Bar", "Outdoor seating"],
    videos: [
      {
        id: "v1",
        title: "Inside the courtyard",
        type: "ambiance",
        mux_playback_id: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
      },
      {
        id: "v2",
        title: "Chef's tandoor session",
        type: "chef",
        mux_playback_id: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
      },
    ],
    images: [
      {
        id: "i1",
        url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
        type: "food",
      },
      {
        id: "i2",
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
        type: "ambiance",
      },
      {
        id: "i3",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
        type: "food",
      },
    ],
    reviews: [
      {
        id: "rv1",
        restaurant_id: "r-001",
        rating: 5,
        comment: "The galouti melts on your tongue. Service was unhurried and warm.",
        user_name: "Ananya R.",
        created_at: "2026-04-12T18:30:00Z",
      },
      {
        id: "rv2",
        restaurant_id: "r-001",
        rating: 4,
        comment: "Great vibe. Slightly slow on a Saturday but worth the wait.",
        user_name: "Rohan M.",
        created_at: "2026-04-05T20:15:00Z",
      },
    ],
  },
  {
    id: "r-002",
    name: "The Cinnamon Coast",
    cuisine: ["South Indian", "Coastal"],
    location: "Indiranagar",
    city: "Bengaluru",
    avg_price_per_plate: 850,
    avg_rating: 4.4,
    review_count: 154,
    has_3d_tour: false,
    hero_image_url:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1600&q=80",
    video_count: 3,
    description:
      "Kerala-style seafood, banana-leaf thalis, and a breezy verandah that catches the evening light.",
    address: "100ft Road, Indiranagar, Bengaluru 560038",
    phone: "+91 80 4000 5555",
    hours: {
      Mon: null,
      Tue: { open: "12:00", close: "22:30" },
      Wed: { open: "12:00", close: "22:30" },
      Thu: { open: "12:00", close: "22:30" },
      Fri: { open: "12:00", close: "23:30" },
      Sat: { open: "12:00", close: "23:30" },
      Sun: { open: "12:00", close: "22:30" },
    },
    capacity: 60,
    highlights: ["Outdoor seating", "Family-friendly", "Vegetarian options"],
    videos: [
      {
        id: "v1",
        title: "Karimeen on the grill",
        type: "chef",
        mux_playback_id: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
      },
    ],
    images: [
      {
        id: "i1",
        url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=1200&q=80",
        type: "food",
      },
      {
        id: "i2",
        url: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
        type: "ambiance",
      },
    ],
    reviews: [
      {
        id: "rv1",
        restaurant_id: "r-002",
        rating: 5,
        comment: "Best meen moilee in the city. Period.",
        user_name: "Priya S.",
        created_at: "2026-04-20T19:00:00Z",
      },
    ],
  },
  {
    id: "r-003",
    name: "Noir & Citrus",
    cuisine: ["Continental", "European"],
    location: "Khan Market",
    city: "New Delhi",
    avg_price_per_plate: 2200,
    avg_rating: 4.7,
    review_count: 312,
    has_3d_tour: true,
    hero_image_url:
      "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1600&q=80",
    video_count: 6,
    description:
      "Seasonal European tasting menus, an obsessive wine list, and a dimly-lit dining room built for slow conversation.",
    address: "Middle Lane, Khan Market, New Delhi 110003",
    phone: "+91 11 4000 9999",
    website: "https://noirandcitrus.example.com",
    hours: {
      Mon: { open: "18:00", close: "23:30" },
      Tue: { open: "18:00", close: "23:30" },
      Wed: { open: "18:00", close: "23:30" },
      Thu: { open: "18:00", close: "23:30" },
      Fri: { open: "18:00", close: "00:30" },
      Sat: { open: "12:00", close: "00:30" },
      Sun: { open: "12:00", close: "23:00" },
    },
    capacity: 45,
    highlights: ["Bar", "Romantic", "Tasting menu", "Wine pairing"],
    videos: [
      {
        id: "v1",
        title: "Tasting menu walkthrough",
        type: "menu",
        mux_playback_id: "DS00Spx1CV902MCtPj5WknGlR102V5HFkDe",
      },
    ],
    images: [
      {
        id: "i1",
        url: "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=1200&q=80",
        type: "food",
      },
      {
        id: "i2",
        url: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=1200&q=80",
        type: "ambiance",
      },
    ],
    reviews: [],
  },
  {
    id: "r-004",
    name: "Hutong Lantern",
    cuisine: ["Chinese", "Pan-Asian"],
    location: "Lower Parel",
    city: "Mumbai",
    avg_price_per_plate: 1500,
    avg_rating: 4.3,
    review_count: 98,
    has_3d_tour: false,
    hero_image_url:
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1600&q=80",
    video_count: 2,
    description: "Cantonese dim sum, hand-pulled noodles, and a wall of red lanterns.",
    address: "Kamala Mills, Lower Parel, Mumbai 400013",
    phone: "+91 22 4000 7777",
    hours: {
      Mon: { open: "12:00", close: "23:00" },
      Tue: { open: "12:00", close: "23:00" },
      Wed: { open: "12:00", close: "23:00" },
      Thu: { open: "12:00", close: "23:00" },
      Fri: { open: "12:00", close: "00:00" },
      Sat: { open: "12:00", close: "00:00" },
      Sun: { open: "12:00", close: "23:00" },
    },
    capacity: 120,
    highlights: ["Bar", "Group-friendly", "Late-night"],
    videos: [],
    images: [
      {
        id: "i1",
        url: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1200&q=80",
        type: "food",
      },
    ],
    reviews: [],
  },
  {
    id: "r-005",
    name: "Olive & Ochre",
    cuisine: ["Continental", "Mediterranean"],
    location: "HSR Layout",
    city: "Bengaluru",
    avg_price_per_plate: 1100,
    avg_rating: 4.5,
    review_count: 76,
    has_3d_tour: false,
    hero_image_url:
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1600&q=80",
    video_count: 3,
    description:
      "Sun-bleached Greek tavernas meet a leafy garden patio. Mezze, charred meats, and unfiltered orange wine.",
    address: "27th Main, HSR Layout, Bengaluru 560102",
    phone: "+91 80 4000 1313",
    hours: {
      Mon: { open: "12:00", close: "23:00" },
      Tue: { open: "12:00", close: "23:00" },
      Wed: { open: "12:00", close: "23:00" },
      Thu: { open: "12:00", close: "23:00" },
      Fri: { open: "12:00", close: "23:30" },
      Sat: { open: "12:00", close: "23:30" },
      Sun: { open: "12:00", close: "23:00" },
    },
    capacity: 70,
    highlights: ["Outdoor seating", "Vegetarian options", "Brunch"],
    videos: [],
    images: [
      {
        id: "i1",
        url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
        type: "ambiance",
      },
    ],
    reviews: [],
  },
  {
    id: "r-006",
    name: "Chai Bungalow",
    cuisine: ["North Indian", "Street Food"],
    location: "Connaught Place",
    city: "New Delhi",
    avg_price_per_plate: 450,
    avg_rating: 4.2,
    review_count: 480,
    hero_image_url:
      "https://images.unsplash.com/photo-1565895405127-481853366cf8?auto=format&fit=crop&w=1600&q=80",
    video_count: 5,
    description:
      "All-day comfort food: kulhad chai, kathi rolls, and chole-bhature served at marble café tables.",
    address: "M-Block, Connaught Place, New Delhi 110001",
    phone: "+91 11 4000 2222",
    hours: {
      Mon: { open: "08:00", close: "23:00" },
      Tue: { open: "08:00", close: "23:00" },
      Wed: { open: "08:00", close: "23:00" },
      Thu: { open: "08:00", close: "23:00" },
      Fri: { open: "08:00", close: "23:30" },
      Sat: { open: "08:00", close: "23:30" },
      Sun: { open: "08:00", close: "23:00" },
    },
    capacity: 50,
    highlights: ["Casual", "Family-friendly", "Vegetarian options"],
    videos: [],
    images: [],
    reviews: [],
    has_3d_tour: false,
  },
];

// ---------- Public API ----------

const toCard = (r: RestaurantDetail): RestaurantCard => ({
  id: r.id,
  name: r.name,
  cuisine: r.cuisine,
  location: r.location,
  city: r.city,
  avg_price_per_plate: r.avg_price_per_plate,
  avg_rating: r.avg_rating,
  review_count: r.review_count,
  has_3d_tour: r.has_3d_tour,
  hero_image_url: r.hero_image_url,
  video_count: r.video_count,
});

function applyFilters(
  list: RestaurantDetail[],
  f: RestaurantFilters,
): RestaurantDetail[] {
  return list.filter((r) => {
    if (f.cuisine && !r.cuisine.includes(f.cuisine)) return false;
    if (f.location) {
      const needle = f.location.toLowerCase();
      if (
        !r.location.toLowerCase().includes(needle) &&
        !r.city.toLowerCase().includes(needle)
      )
        return false;
    }
    if (typeof f.min_price === "number" && r.avg_price_per_plate < f.min_price)
      return false;
    if (typeof f.max_price === "number" && r.avg_price_per_plate > f.max_price)
      return false;
    if (typeof f.rating_min === "number" && r.avg_rating < f.rating_min)
      return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      const haystack = `${r.name} ${r.cuisine.join(" ")} ${r.location} ${r.city}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export async function listRestaurants(
  filters: RestaurantFilters = {},
): Promise<RestaurantListResponse> {
  if (USE_MOCK) {
    const filtered = applyFilters(MOCK_RESTAURANTS, filters);
    return {
      restaurants: filtered.map(toCard),
      total: filtered.length,
      has_more: false,
    };
  }
  const qs = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  const path = `/restaurants${qs.toString() ? `?${qs}` : ""}`;
  return api<RestaurantListResponse>(path);
}

export async function getFeaturedRestaurants(
  limit = 4,
): Promise<RestaurantCard[]> {
  if (USE_MOCK) {
    return MOCK_RESTAURANTS.slice()
      .sort((a, b) => b.avg_rating - a.avg_rating)
      .slice(0, limit)
      .map(toCard);
  }
  const r = await api<RestaurantListResponse>(
    `/restaurants?sort=rating&limit=${limit}`,
  );
  return r.restaurants;
}

export async function getRestaurant(id: string): Promise<RestaurantDetail> {
  if (USE_MOCK) {
    const found = MOCK_RESTAURANTS.find((r) => r.id === id);
    if (!found) throw new Error("Restaurant not found");
    return found;
  }
  return api<RestaurantDetail>(`/restaurants/${id}`);
}

export async function listReviews(
  restaurantId: string,
  page = 1,
  limit = 10,
): Promise<ReviewListResponse> {
  if (USE_MOCK) {
    const r = MOCK_RESTAURANTS.find((x) => x.id === restaurantId);
    const all = r?.reviews ?? [];
    const start = (page - 1) * limit;
    return {
      reviews: all.slice(start, start + limit),
      total: all.length,
      has_more: start + limit < all.length,
    };
  }
  return api<ReviewListResponse>(
    `/reviews/${restaurantId}?page=${page}&limit=${limit}`,
  );
}

export interface SubmitReviewInput {
  restaurant_id: string;
  rating: number;
  comment: string;
  user_name: string;
  user_email: string;
}

export async function submitReview(input: SubmitReviewInput): Promise<Review> {
  if (USE_MOCK) {
    return {
      id: `rv-${Date.now()}`,
      restaurant_id: input.restaurant_id,
      rating: input.rating,
      comment: input.comment,
      user_name: input.user_name,
      created_at: new Date().toISOString(),
    };
  }
  return api<Review>("/reviews", { method: "POST", body: input });
}

// Admin (password-gated) — sends password in Authorization: Bearer
export async function adminUpdateRestaurant(
  id: string,
  password: string,
  patch: Partial<RestaurantDetail>,
): Promise<RestaurantDetail> {
  if (USE_MOCK) {
    const idx = MOCK_RESTAURANTS.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error("Restaurant not found");
    MOCK_RESTAURANTS[idx] = { ...MOCK_RESTAURANTS[idx], ...patch };
    return MOCK_RESTAURANTS[idx];
  }
  return api<RestaurantDetail>(`/admin/restaurants/${id}`, {
    method: "POST",
    body: patch,
    token: password,
  });
}

export const CUISINE_OPTIONS = [
  "North Indian",
  "South Indian",
  "Mughlai",
  "Coastal",
  "Continental",
  "European",
  "Mediterranean",
  "Chinese",
  "Pan-Asian",
  "Street Food",
];

export const PRICE_BUCKETS: { label: string; min?: number; max?: number }[] = [
  { label: "Any price" },
  { label: "Under ₹500", max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000 – ₹2000", min: 1000, max: 2000 },
  { label: "₹2000+", min: 2000 },
];

export const HIGHLIGHT_OPTIONS = [
  "Rooftop",
  "Bar",
  "Live music",
  "Outdoor seating",
  "Romantic",
  "Family-friendly",
  "Vegetarian options",
  "Brunch",
  "Late-night",
];
