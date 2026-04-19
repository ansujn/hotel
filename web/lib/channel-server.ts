import { cookies } from "next/headers";
import { api } from "./api";
import { ACCESS_COOKIE } from "./auth";
import type { Asset, Channel } from "./channel";

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
  assetId: string,
): Promise<{ channel: Channel; asset: Asset } | null> {
  const channel = await getChannel(channelId);
  if (!channel) return null;
  const asset = (channel.assets ?? []).find((a) => a.id === assetId);
  if (!asset) return null;
  return { channel, asset };
}
