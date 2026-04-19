// Client-safe types and utilities for channel data.
// Server helpers (cookies, API fetch) live in `lib/channel-server.ts` so this
// module can be imported from client components without dragging next/headers
// into the browser bundle.

export type AssetType = "monologue" | "scene" | "showcase" | "catalog";
export type AssetPrivacy = "private" | "pending_consent" | "public";

export interface Asset {
  id: string;
  title: string;
  type: AssetType;
  mux_playback_id?: string;
  mux_playback_token?: string;
  duration_s?: number;
  privacy: AssetPrivacy;
  created_at?: string;
  note?: string;
  rubric?: Record<string, number>;
}

export interface ChannelStudent {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "student" | "parent" | "instructor" | "admin";
  batch?: string;
  avatar_url?: string;
  bio?: string;
}

export interface Channel {
  student: ChannelStudent;
  assets: Asset[];
}

export const ASSET_TABS: readonly { key: AssetType | "about"; label: string }[] = [
  { key: "monologue", label: "Monologues" },
  { key: "scene", label: "Scenes" },
  { key: "showcase", label: "Showcases" },
  { key: "catalog", label: "Catalog" },
  { key: "about", label: "About" },
] as const;

export function formatDuration(s?: number): string {
  if (!s || s < 0) return "--:--";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
