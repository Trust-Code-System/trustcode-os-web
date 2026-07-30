import { NextResponse, type NextRequest } from "next/server";

// A valid refresh cookie is enough to enter a protected route. The first API
// request will renew an expired/missing short-lived access cookie.
const sessionCookieNames = ["tc_access", "tc_refresh", "tc_mock_session"];

export function proxy(request: NextRequest) {
  const authenticated = sessionCookieNames.some((name) => request.cookies.has(name));
  if (authenticated) return NextResponse.next();
  const login = new URL("/login", request.url);
  const returnTo = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (returnTo.startsWith("/") && !returnTo.startsWith("//")) login.searchParams.set("returnTo", returnTo);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/dashboard/:path*", "/clients/:path*", "/projects/:path*", "/meetings/:path*", "/documents/:path*", "/activity/:path*", "/team/:path*", "/settings/:path*", "/dev/:path*"],
};
