import { NextResponse, type NextRequest } from "next/server";

// `/channel/**` is intentionally public — the API filters private assets per viewer.
// `/admin/[id]` is the restaurant-platform owner dashboard — it has its own
// password gate (see app/(restaurants)/admin/[id]/page.tsx) so no JWT cookie required.
const PROTECTED = ["/home", "/progress", "/upload", "/students", "/batches", "/social", "/parent", "/notifications"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home/:path*",
    "/progress/:path*",
    "/upload/:path*",
    "/students/:path*",
    "/batches/:path*",
    "/social/:path*",
    "/parent/:path*",
    "/notifications/:path*",
  ],
};
