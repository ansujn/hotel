export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { body, token, headers, ...rest } = opts;
  const res = await fetch(`${API_BASE}/v1${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new ApiError(res.status, text || `${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

// Domain types mirrored from openapi.yaml
export type UserRole = "student" | "parent" | "instructor" | "admin";

export interface User {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  role: UserRole;
  locale?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

export type AssetType = "monologue" | "scene" | "showcase" | "catalog";
export type AssetPrivacy = "private" | "pending_consent" | "public";

export interface Asset {
  id: string;
  title: string;
  type: AssetType;
  mux_playback_id?: string;
  duration_s?: number;
  privacy: AssetPrivacy;
  created_at: string;
}

export interface StudentSummary {
  id: string;
  name?: string;
  role: string;
  locale: string;
}

export interface Channel {
  student: StudentSummary;
  assets: Asset[];
}

export interface RubricScore {
  dimension: string;
  score: number;
}

export type ConsentStatus = "pending" | "signed" | "revoked";

export interface ConsentItem {
  id: string;
  asset_id: string;
  scope_channel?: boolean;
  scope_social?: boolean;
  scope_print?: boolean;
  scope_valid_months?: 6 | 12 | 24;
  status: ConsentStatus;
  signed_at?: string;
  pdf_url?: string;
}

export interface StudentListItem {
  id: string;
  name?: string;
  phone?: string;
  batch_name?: string;
  asset_count?: number;
  consent_status?: "none" | "pending" | "signed";
}

// --- Phase 4: progress, notes, social, payments ---

export interface ProgressDimension {
  dimension: string;
  score: number;
}

export interface ProgressTimelineEntry {
  date: string;
  asset_id: string;
  asset_title: string;
  scores: ProgressDimension[];
  note?: string;
}

export interface Progress {
  averages: ProgressDimension[];
  timeline: ProgressTimelineEntry[];
}

export interface Note {
  id: string;
  asset_id: string;
  author_id: string;
  body: string;
  private: boolean;
  created_at: string;
}

export type SocialPlatform = "ig_reel" | "yt_short" | "fb" | "linkedin";

export interface SocialLibraryItem {
  id: string;
  title: string;
  student_name?: string;
  mux_playback_id?: string;
  duration_s?: number;
  thumbnail?: string;
}

export type SocialPostStatus = "queued" | "scheduled" | "posted" | "failed";

export interface SocialPost {
  id: string;
  asset_id?: string;
  platforms: SocialPlatform[];
  caption: string;
  scheduled_at?: string;
  buffer_id?: string;
  status: SocialPostStatus;
  created_at: string;
  asset_title?: string;
  student_name?: string;
  thumbnail?: string;
}

export interface ClipSuggestion {
  start_s: number;
  end_s: number;
  title: string;
  reason: string;
}

export type PaymentStatus = "created" | "paid" | "failed";

export interface Payment {
  id: string;
  user_id: string;
  razorpay_order_id?: string;
  amount_paise: number;
  status: PaymentStatus;
  period?: string;
  created_at: string;
}

export interface PaymentOrder {
  order_id: string;
  razorpay_key_id: string;
  amount_paise: number;
}

export interface Dues {
  period: string;
  amount_paise: number;
}

// --- Phase 5.1: notifications ---

export type NotificationKind =
  | "consent_pending"
  | "asset_ready"
  | "feedback"
  | "class_reminder"
  | "fee_due";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body?: string;
  read_at?: string | null;
  created_at: string;
}
