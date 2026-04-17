import { cookies } from "next/headers";
import { api } from "./api";
import { ACCESS_COOKIE } from "./auth";

export type AssetType = "monologue" | "scene" | "showcase" | "catalog";
export type AssetPrivacy = "private" | "pending_consent" | "public";

export interface Asset {
  id: string;
  title: string;
  type: AssetType;
  mux_playback_id?: string;
  mux_playback_token?: string; // optional signed token if API returns one
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

async function readToken(): Promise<string | undefined> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function getChannel(id: string): Promise<Channel | null> {
  const token = await readToken();
  try {
    return await api<Channel>(`/students/${id}/channel`, { token });
  } catch {
    return null;
  }
}

export async function getAsset(
  channelId: string,
  assetId: string
): Promise<{ channel: Channel; asset: Asset } | null> {
  const channel = await getChannel(channelId);
  if (!channel) return null;
  const asset = (channel.assets ?? []).find((a) => a.id === assetId);
  if (!asset) return null;
  return { channel, asset };
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
