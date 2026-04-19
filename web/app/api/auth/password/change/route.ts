import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

// Thin server-side proxy so the browser never handles the bearer token.
// Forwards to the Go API using the httpOnly cookie for auth.
export async function POST(req: Request) {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await req.text();
  const res = await fetch(`${API_BASE}/v1/auth/password/change`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return NextResponse.json(
      { error: text || res.statusText },
      { status: res.status },
    );
  }
  return new NextResponse(null, { status: 204 });
}
