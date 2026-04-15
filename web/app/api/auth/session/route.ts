import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/auth";

interface SessionBody {
  access_token: string;
  refresh_token?: string;
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<SessionBody>;
  if (!body.access_token || typeof body.access_token !== "string") {
    return NextResponse.json({ error: "missing access_token" }, { status: 400 });
  }
  const store = await cookies();
  const secure = process.env.NODE_ENV === "production";
  store.set(ACCESS_COOKIE, body.access_token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  if (body.refresh_token) {
    store.set(REFRESH_COOKIE, body.refresh_token, {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
  return NextResponse.json({ ok: true });
}
