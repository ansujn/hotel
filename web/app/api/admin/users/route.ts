import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

// Server-side proxy so the bearer token stays in the httpOnly cookie.
export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.text();
  const res = await fetch(`${API_BASE}/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "Content-Type": res.headers.get("Content-Type") ?? "application/json" },
  });
}
