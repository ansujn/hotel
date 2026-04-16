import { NextResponse } from "next/server";

// TODO: proxy to `POST /v1/notifications/mark-read` once the API lands.
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = (await req.json()) as { ids?: unknown };
    const ids = Array.isArray(body.ids) ? body.ids.filter((v): v is string => typeof v === "string") : [];
    return NextResponse.json({ ok: true, marked: ids.length });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
