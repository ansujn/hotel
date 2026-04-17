import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/api";
import { ACCESS_COOKIE } from "@/lib/auth";

export async function POST(req: Request): Promise<NextResponse> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const all = url.searchParams.get("all") === "true";
  const id = url.searchParams.get("id");

  const target = all
    ? `${API_BASE}/v1/notifications/mark-all-read`
    : id
      ? `${API_BASE}/v1/notifications/${encodeURIComponent(id)}/read`
      : null;

  if (!target) {
    return NextResponse.json({ ok: false, error: "missing id or all flag" }, { status: 400 });
  }

  const res = await fetch(target, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
