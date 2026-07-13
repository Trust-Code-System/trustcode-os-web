import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import type { ApiEnvelope } from "@/lib/api/types";
import type { SessionUser } from "@/features/auth/types/auth";
import { clearSession, readSessionUser, sessionCookies, setSession } from "@/lib/auth/session";

type Context = { params: Promise<{ action: string }> };
type BackendLogin = { user: SessionUser; tokens: { accessToken: string; refreshToken: string } };

const mockUsers: Record<string, SessionUser> = {
  "admin@trustcode.test": { id: "user_admin", email: "admin@trustcode.test", name: "Ghost", role: "ADMIN" },
  "member@trustcode.test": { id: "user_member", email: "member@trustcode.test", name: "David Mensah", role: "MEMBER" },
};

export async function GET(_request: NextRequest, context: Context) {
  const { action } = await context.params;
  if (action !== "me") return failure(405, "METHOD_NOT_ALLOWED", "This operation is not supported.");
  if (mockMode()) {
    const user = await readSessionUser();
    if (!user) return failure(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
    const refreshed = mockUsers[user.email.toLowerCase()];
    const next = refreshed ? { ...user, ...refreshed } : user;
    if (refreshed) await setSession({ user: next, mock: true });
    return success(next);
  }

  const store = await import("next/headers").then(({ cookies }) => cookies());
  const accessToken = store.get(sessionCookies.access)?.value;
  if (!accessToken) return failure(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
  const upstream = await backendFetch<SessionUser>("me", { headers: { Authorization: `Bearer ${accessToken}` } });
  if (upstream.response.ok && upstream.body.ok) {
    const previous = await readSessionUser();
    await setSession({ user: { ...upstream.body.data, ...(previous?.name ? { name: previous.name } : {}) }, accessToken });
  }
  return NextResponse.json(upstream.body, { status: upstream.response.status });
}

export async function POST(request: NextRequest, context: Context) {
  const { action } = await context.params;
  if (mockMode()) return handleMockPost(action, request);
  return handleBackendPost(action, request);
}

async function handleMockPost(action: string, request: NextRequest) {
  if (action === "logout") {
    await clearSession();
    return success({ success: true as const });
  }
  if (["forgot-password", "reset-password", "change-password"].includes(action)) return success({ success: true as const });
  if (action !== "login") return failure(404, "NOT_FOUND", "This session operation does not exist.");
  const input = z.object({ email: z.email(), password: z.string() }).safeParse(await safeJson(request));
  if (!input.success) return failure(422, "VALIDATION_FAILED", "Please check the submitted values.", input.error.flatten().fieldErrors);
  const user = mockUsers[input.data.email.toLowerCase()];
  if (!user || input.data.password !== "TrustCode123!") return failure(401, "UNAUTHORIZED", "Invalid email or password.");
  await setSession({ user, mock: true });
  return success(user);
}

async function handleBackendPost(action: string, request: NextRequest) {
  if (!["login", "logout", "forgot-password", "reset-password", "change-password"].includes(action)) return failure(404, "NOT_FOUND", "This session operation does not exist.");
  const body = await safeJson(request);
  const store = await import("next/headers").then(({ cookies }) => cookies());
  const headers: HeadersInit = {};
  let upstreamBody = body;
  if (action === "logout") upstreamBody = { refreshToken: store.get(sessionCookies.refresh)?.value ?? "" };
  if (action === "change-password") {
    const accessToken = store.get(sessionCookies.access)?.value;
    if (!accessToken) return failure(401, "UNAUTHORIZED", "Your session has expired. Please sign in again.");
    headers.Authorization = `Bearer ${accessToken}`;
  }
  const upstream = await backendFetch<BackendLogin | { success: true }>(action, { method: "POST", headers, body: JSON.stringify(upstreamBody) });
  if (action === "login" && upstream.response.ok && upstream.body.ok) {
    const data = upstream.body.data as BackendLogin;
    await setSession({ user: data.user, accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
    return success(data.user);
  }
  if (action === "logout") await clearSession();
  return NextResponse.json(upstream.body, { status: upstream.response.status });
}

async function backendFetch<T>(path: string, init: RequestInit = {}) {
  const base = process.env.API_BASE_URL ?? "http://localhost:3000/api";
  try {
    const response = await fetch(`${base}/auth/${path}`, { ...init, headers: { Accept: "application/json", "Content-Type": "application/json", ...init.headers }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    const body = (await response.json()) as ApiEnvelope<T>;
    return { response, body };
  } catch {
    return { response: new Response(null, { status: 503 }), body: { ok: false, error: { code: "UPSTREAM_UNAVAILABLE", message: "Authentication is temporarily unavailable. Please try again." } } as ApiEnvelope<T> };
  }
}

async function safeJson(request: NextRequest): Promise<unknown> {
  try { return await request.json(); } catch { return {}; }
}

function mockMode() { return process.env.NEXT_PUBLIC_USE_MOCKS !== "false"; }
function success<T>(data: T) { return NextResponse.json({ ok: true as const, data }); }
function failure(status: number, code: string, message: string, fields?: Record<string, string[] | undefined>) {
  const cleanFields = fields ? Object.fromEntries(Object.entries(fields).filter((entry): entry is [string, string[]] => Array.isArray(entry[1]))) : undefined;
  return NextResponse.json({ ok: false as const, error: { code, message, ...(cleanFields ? { fields: cleanFields } : {}) } }, { status });
}
