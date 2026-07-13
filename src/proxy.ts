import { NextResponse, type NextRequest } from "next/server";

const sessionCookieNames = ["tc_access", "tc_mock_session"];

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
