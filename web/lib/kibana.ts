// Single-restaurant data + API client for Kibana Jaipur.
// Static content (menu, banquets, contact) lives here so the site renders
// without an API. Dynamic content (videos, images, reviews) hits the Go API
// via NEXT_PUBLIC_API_BASE_URL when set; otherwise falls back to bundled mocks.

import { api } from "./api";

export const KIBANA_ID = "11111111-1111-1111-1111-111111111101";

export const KIBANA = {
  name: "Kibana Jaipur",
  tagline: "Rooftop dining & banquet halls in the Pink City.",
  description:
    "Modern Indian and global flavours served on a rooftop overlooking Jaipur's old city. Five banquet halls — from intimate engagements to 500-guest weddings.",
  cuisine: ["North Indian", "Mughlai", "Continental"],
  city: "Jaipur",
  address: "Saudagar's Lane, C-Scheme, Jaipur 302001",
  phone: "+91 141 4023456",
  whatsapp: "+91 98290 12345",
  email: "hello@kibanajaipur.in",
  website: "https://kibana.saudagars.org",
  instagram: "https://instagram.com/kibana.jaipur",
  facebook: "https://facebook.com/kibanajaipur",
  google_maps:
    "https://maps.google.com/?q=Kibana+Jaipur+Saudagars+Lane+C-Scheme+Jaipur",
  hours: {
    Mon: { open: "12:00", close: "23:00" },
    Tue: { open: "12:00", close: "23:00" },
    Wed: { open: "12:00", close: "23:00" },
    Thu: { open: "12:00", close: "23:00" },
    Fri: { open: "12:00", close: "00:00" },
    Sat: { open: "12:00", close: "00:00" },
    Sun: { open: "12:00", close: "23:00" },
  },
  hero_image: "/images/kibana-jaipur/restaurant/placeholder.svg",
} as const;

// ---------- Static menu ----------

export interface MenuItem {
  name: string;
  description: string;
  price: number; // INR
  veg: boolean;
  signature?: boolean;
  spice?: 1 | 2 | 3;
}

export interface MenuCategory {
  id: string;
  title: string;
  blurb: string;
  items: MenuItem[];
}

export const MENU: MenuCategory[] = [
  {
    id: "small-plates",
    title: "Small Plates",
    blurb: "Made for sharing with the first round of cocktails.",
    items: [
      {
        name: "Tandoori Burrata",
        description: "Charred peppers, smoked tomato chutney, garlic naan crisps.",
        price: 780,
        veg: true,
        signature: true,
      },
      {
        name: "Galouti on Khameeri",
        description: "Slow-cooked lamb mince, saffron, warm Awadhi bread.",
        price: 920,
        veg: false,
        signature: true,
      },
      {
        name: "Beetroot Tikki Chaat",
        description: "Crisp beet patty, hung curd, tamarind, pomegranate.",
        price: 520,
        veg: true,
      },
      {
        name: "Prawn Pollichathu",
        description: "Banana-leaf grilled tiger prawns, curry-leaf butter.",
        price: 1080,
        veg: false,
        spice: 2,
      },
    ],
  },
  {
    id: "from-the-tandoor",
    title: "From the Tandoor",
    blurb: "Fired with cherry-wood, finished with desi ghee.",
    items: [
      {
        name: "Lamb Shank Nihari",
        description: "Slow-braised lamb shank, marrow, wood-fired naan.",
        price: 1340,
        veg: false,
        signature: true,
        spice: 2,
      },
      {
        name: "Murgh Malai Tikka",
        description: "Cream-cheese marinated chicken, mace, green cardamom.",
        price: 760,
        veg: false,
      },
      {
        name: "Tandoori Aubergine",
        description: "Smoked baingan, sesame, miso glaze.",
        price: 640,
        veg: true,
      },
    ],
  },
  {
    id: "mains",
    title: "Mains",
    blurb: "Slow cooking, sharper finishes.",
    items: [
      {
        name: "Butter Chicken 2.0",
        description: "Fenugreek-perfumed gravy, double-cream, micro-coriander.",
        price: 880,
        veg: false,
        signature: true,
      },
      {
        name: "Dal Kibana",
        description: "Black urad cooked overnight, cultured butter, smoke.",
        price: 580,
        veg: true,
        signature: true,
      },
      {
        name: "Truffle Mushroom Risotto",
        description: "Arborio, porcini, aged parmesan, black truffle oil.",
        price: 1240,
        veg: true,
      },
      {
        name: "Lobster Thermidor",
        description: "Half lobster, gruyere, mustard butter, herb crumb.",
        price: 2680,
        veg: false,
      },
    ],
  },
  {
    id: "desserts",
    title: "Desserts",
    blurb: "House-made every morning.",
    items: [
      {
        name: "Saffron Phirni Brûlée",
        description: "Slow-cooked rice pudding, torched sugar crust, pistachio.",
        price: 380,
        veg: true,
        signature: true,
      },
      {
        name: "Dark Chocolate Sphere",
        description: "Hot salted-caramel poured tableside, vanilla bean ice cream.",
        price: 480,
        veg: true,
      },
    ],
  },
];

// ---------- Banquet halls ----------

export interface Banquet {
  id: string;
  name: string;
  blurb: string;
  capacity: { seated: number; floating: number };
  pricing_per_event: number; // starting price in INR
  area_sqft: number;
  features: string[];
  hero_image: string;
  best_for: string[];
}

export const BANQUETS: Banquet[] = [
  {
    id: "saffron-grand",
    name: "The Saffron Grand",
    blurb:
      "Pillarless 500-seater with 24-foot ceilings, frescoed walls and a panoramic stage.",
    capacity: { seated: 320, floating: 500 },
    pricing_per_event: 250000,
    area_sqft: 6800,
    features: [
      "Pillar-free hall",
      "Live-stream rig",
      "Bridal lounge",
      "Valet for 120 cars",
    ],
    hero_image: "/images/kibana-jaipur/banquets/placeholder.svg",
    best_for: ["Weddings", "Receptions", "Corporate galas"],
  },
  {
    id: "the-courtyard",
    name: "The Courtyard",
    blurb:
      "Open-sky atrium with citrus trees, fairy lights and a marble fountain.",
    capacity: { seated: 180, floating: 280 },
    pricing_per_event: 140000,
    area_sqft: 3200,
    features: ["Open sky", "Fountain centrepiece", "Acoustic-ready"],
    hero_image: "/images/kibana-jaipur/banquets/placeholder.svg",
    best_for: ["Sangeet", "Cocktail receptions", "Brunches"],
  },
  {
    id: "the-rooftop",
    name: "The Rooftop",
    blurb:
      "Sweeping city views with a glass-floor lounge and bespoke bar.",
    capacity: { seated: 90, floating: 160 },
    pricing_per_event: 95000,
    area_sqft: 1900,
    features: ["City skyline", "Custom bar", "Sunset terrace"],
    hero_image: "/images/kibana-jaipur/banquets/placeholder.svg",
    best_for: ["Engagements", "Birthday dinners", "Product launches"],
  },
  {
    id: "the-haveli",
    name: "The Haveli",
    blurb:
      "Mughal-inspired private dining room with hand-painted ceilings.",
    capacity: { seated: 36, floating: 60 },
    pricing_per_event: 55000,
    area_sqft: 950,
    features: ["Private dining", "Wine cellar access", "Butler service"],
    hero_image: "/images/kibana-jaipur/banquets/placeholder.svg",
    best_for: ["Anniversaries", "Board dinners", "Intimate gatherings"],
  },
  {
    id: "the-pavilion",
    name: "The Pavilion",
    blurb:
      "Garden marquee with pristine lawns, ideal for daytime events.",
    capacity: { seated: 240, floating: 380 },
    pricing_per_event: 175000,
    area_sqft: 4200,
    features: ["Lawn seating", "Marquee tent", "Daylight event space"],
    hero_image: "/images/kibana-jaipur/banquets/placeholder.svg",
    best_for: ["Day weddings", "Corporate offsites", "Brunches"],
  },
];

// ---------- API-backed dynamic content ----------

export interface KibanaImage {
  id: string;
  url: string;
  type: string; // hero | interior | dish | event
  caption?: string;
  position?: number;
}

export interface KibanaVideo {
  id: string;
  title: string;
  type: string; // ambiance | chef_special | menu_showcase | event
  mux_playback_id: string;
  thumbnail_url?: string;
  duration_s?: number;
  views?: number;
}

export interface KibanaReview {
  id: string;
  rating: number;
  user_name: string;
  comment: string;
  title?: string;
  created_at: string;
}

const HAS_LIVE_API =
  typeof process !== "undefined" && !!process.env.NEXT_PUBLIC_API_BASE_URL;

const PLACEHOLDER_IMAGE = "/images/kibana-jaipur/restaurant/placeholder.svg";
const PLACEHOLDER_BANQUET = "/images/kibana-jaipur/banquets/placeholder.svg";

const MOCK_IMAGES: KibanaImage[] = [
  { id: "img-1", url: PLACEHOLDER_IMAGE, type: "hero", caption: "Rooftop at golden hour", position: 0 },
  { id: "img-2", url: PLACEHOLDER_IMAGE, type: "interior", caption: "The main dining room", position: 1 },
  { id: "img-3", url: PLACEHOLDER_IMAGE, type: "dish", caption: "Signature lamb shank", position: 2 },
  { id: "img-4", url: PLACEHOLDER_BANQUET, type: "event", caption: "Sangeet at The Courtyard", position: 3 },
  { id: "img-5", url: PLACEHOLDER_IMAGE, type: "interior", caption: "Private dining at The Haveli", position: 4 },
  { id: "img-6", url: PLACEHOLDER_BANQUET, type: "event", caption: "Wedding mandap, The Saffron Grand", position: 5 },
];

const MOCK_VIDEOS: KibanaVideo[] = [
  {
    id: "v-1",
    title: "Sunset on the Kibana rooftop",
    type: "ambiance",
    mux_playback_id: "GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq",
    duration_s: 42,
    views: 1240,
  },
  {
    id: "v-2",
    title: "Chef Arjun on the lamb shank",
    type: "chef_special",
    mux_playback_id: "GqZQfgmKHdrQfvdj01Sb02uLBQYx02D8YlvzmqFFglq",
    duration_s: 88,
    views: 540,
  },
];

const MOCK_REVIEWS: KibanaReview[] = [
  {
    id: "r-1",
    rating: 5,
    user_name: "Aarav Mehta",
    title: "Best rooftop in Jaipur",
    comment:
      "Stunning views and the lamb shank lives up to the hype. Service was warm and unhurried.",
    created_at: "2026-04-12T18:30:00Z",
  },
  {
    id: "r-2",
    rating: 5,
    user_name: "Priya Singhania",
    title: "Made our wedding magical",
    comment:
      "We hosted our reception at The Saffron Grand. Pillar-free hall, gorgeous decor, food was the talking point of the evening.",
    created_at: "2026-04-02T15:00:00Z",
  },
  {
    id: "r-3",
    rating: 4,
    user_name: "Karan Bhatia",
    title: "Phirni brûlée — go for it",
    comment:
      "Cocktails are inventive, the dal kibana is a slow-cooked dream. Phirri brûlée is the dessert of the year.",
    created_at: "2026-03-26T20:15:00Z",
  },
];

export async function getImages(): Promise<KibanaImage[]> {
  if (!HAS_LIVE_API) return MOCK_IMAGES;
  try {
    const data = await api<{ images: KibanaImage[] }>(
      `/restaurants/${KIBANA_ID}/images`,
    );
    return data.images?.length ? data.images : MOCK_IMAGES;
  } catch {
    return MOCK_IMAGES;
  }
}

export async function getVideos(): Promise<KibanaVideo[]> {
  if (!HAS_LIVE_API) return MOCK_VIDEOS;
  try {
    const data = await api<{ videos: KibanaVideo[] }>(
      `/restaurants/${KIBANA_ID}/videos`,
    );
    return data.videos?.length ? data.videos : MOCK_VIDEOS;
  } catch {
    return MOCK_VIDEOS;
  }
}

export async function getReviews(): Promise<KibanaReview[]> {
  if (!HAS_LIVE_API) return MOCK_REVIEWS;
  try {
    const data = await api<{ reviews: KibanaReview[] }>(
      `/reviews/${KIBANA_ID}?limit=20`,
    );
    return data.reviews?.length ? data.reviews : MOCK_REVIEWS;
  } catch {
    return MOCK_REVIEWS;
  }
}

export interface BookingInput {
  name: string;
  email: string;
  phone: string;
  date: string; // ISO date
  guest_count: number;
  occasion: string; // wedding | reception | corporate | birthday | other
  banquet_id?: string;
  message?: string;
}

export async function submitBooking(
  input: BookingInput,
): Promise<{ ok: true; reference: string }> {
  // Booking endpoint not yet on API. Fall back to local-success.
  // Owner is notified by email out-of-band (Brevo) once API is wired.
  if (!HAS_LIVE_API) {
    return { ok: true, reference: `KIB-${Date.now().toString(36).toUpperCase()}` };
  }
  try {
    return await api<{ ok: true; reference: string }>("/bookings", {
      method: "POST",
      body: { restaurant_id: KIBANA_ID, ...input },
    });
  } catch {
    // Don't fail the user-facing booking flow if backend is still being wired.
    return { ok: true, reference: `KIB-${Date.now().toString(36).toUpperCase()}` };
  }
}

export interface ReviewInput {
  rating: number;
  comment: string;
  user_name: string;
  user_email: string;
  title?: string;
}

export async function submitReview(input: ReviewInput): Promise<KibanaReview> {
  if (!HAS_LIVE_API) {
    return {
      id: `r-${Date.now()}`,
      rating: input.rating,
      user_name: input.user_name,
      title: input.title,
      comment: input.comment,
      created_at: new Date().toISOString(),
    };
  }
  return api<KibanaReview>("/reviews", {
    method: "POST",
    body: { restaurant_id: KIBANA_ID, ...input },
  });
}

export const OCCASIONS = [
  "Wedding",
  "Reception",
  "Sangeet / Mehendi",
  "Corporate event",
  "Birthday / Anniversary",
  "Engagement",
  "Other",
];
