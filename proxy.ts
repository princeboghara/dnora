import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth/session";

interface AdminCookiePayload {
  email: string;
  role: string;
  expiresAt: number;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const adminSessionCookie = request.cookies.get(ADMIN_COOKIE_NAME);

    let isValidAdmin = false;
    if (adminSessionCookie?.value) {
      const payload = verifySessionToken<AdminCookiePayload>(adminSessionCookie.value);
      if (payload && payload.role === "admin") {
        isValidAdmin = true;
      }
    }

    if (!isValidAdmin) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
