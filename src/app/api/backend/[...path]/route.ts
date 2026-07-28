import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import type { ApiEnvelope } from "@/lib/api/types";
import { clearSession, sessionCookies, setSessionTokens } from "@/lib/auth/session";

type Context = { params: Promise<{ path: string[] }> };

async function handler(request: NextRequest, context: Context) {
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    return NextResponse.json({ ok: false, error: { code: "MOCK_NOT_INTERCEPTED", message: "The mock service worker is not ready. Refresh and try again." } }, { status: 503 });
  }
  const { path } = await context.params;
  const store = await cookies();
  const accessToken = store.get(sessionCookies.access)?.value;
  if (!accessToken) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", message: "Your session has expired. Please sign in again." } }, { status: 401 });
  const base = process.env.API_BASE_URL ?? "http://localhost:3000/api";
  const target = `${base}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
  const headers = new Headers();
  headers.set("Accept", request.headers.get("Accept") ?? "application/json");
  headers.set("Authorization", `Bearer ${accessToken}`);
  const contentType = request.headers.get("Content-Type");
  if (contentType) headers.set("Content-Type", contentType);
  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await request.arrayBuffer() : undefined;
  try {
    let response = await fetchUpstream(target, request.method, headers, body);
    if (response.status === 401) {
      const refreshed = await refreshTokens(store.get(sessionCookies.refresh)?.value);
      if (refreshed) {
        await setSessionTokens(refreshed.accessToken, refreshed.refreshToken);
        headers.set("Authorization", `Bearer ${refreshed.accessToken}`);
        response = await fetchUpstream(target, request.method, headers, body);
      } else {
        await clearSession();
      }
    }
    const responseHeaders = new Headers();
    for (const name of ["content-type", "content-disposition", "content-length", "x-request-id"]) {
      const value = response.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    return new NextResponse(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "UPSTREAM_UNAVAILABLE", message: "The service is temporarily unavailable. Please try again." } }, { status: 503 });
  }
}

function fetchUpstream(target: string, method: string, headers: Headers, body?: ArrayBuffer) {
  return fetch(target, { method, headers, ...(body ? { body } : {}), cache: "no-store", signal: AbortSignal.timeout(20_000) });
}

async function refreshTokens(refreshToken?: string) {
  if (!refreshToken) return null;
  const base = process.env.API_BASE_URL ?? "http://localhost:3000/api";
  try {
    const response = await fetch(`${base}/auth/refresh`, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken }), cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const envelope = await response.json() as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
    return response.ok && envelope.ok ? envelope.data : null;
  } catch {
    return null;
  }
}

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
