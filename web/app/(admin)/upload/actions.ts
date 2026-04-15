"use server";

import { cookies } from "next/headers";
import { api, ApiError } from "@/lib/api";
import { ACCESS_COOKIE } from "@/lib/auth";
import type { AssetType } from "@/lib/channel";

export interface CreateAssetInput {
  student_id: string;
  type: AssetType;
  title: string;
  note?: string;
  rubric?: Record<string, number>;
}

export interface CreateAssetResult {
  asset_id: string;
  mux_upload_url: string;
}

export interface CreateAssetResponse {
  ok: boolean;
  data?: CreateAssetResult;
  error?: string;
}

export async function createAssetAction(
  input: CreateAssetInput
): Promise<CreateAssetResponse> {
  try {
    const store = await cookies();
    const token = store.get(ACCESS_COOKIE)?.value;
    if (!token) return { ok: false, error: "Not authenticated" };
    const data = await api<CreateAssetResult>("/admin/assets", {
      method: "POST",
      token,
      body: input,
    });
    return { ok: true, data };
  } catch (e) {
    const msg =
      e instanceof ApiError ? `API ${e.status}: ${e.message}` : (e as Error).message;
    return { ok: false, error: msg };
  }
}

export async function publishAssetAction(
  assetId: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const store = await cookies();
    const token = store.get(ACCESS_COOKIE)?.value;
    if (!token) return { ok: false, error: "Not authenticated" };
    await api<unknown>(`/admin/assets/${assetId}/publish`, {
      method: "POST",
      token,
    });
    return { ok: true };
  } catch (e) {
    const msg =
      e instanceof ApiError ? `API ${e.status}: ${e.message}` : (e as Error).message;
    return { ok: false, error: msg };
  }
}
