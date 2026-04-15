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
