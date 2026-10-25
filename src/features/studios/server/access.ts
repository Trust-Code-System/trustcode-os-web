import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import type { SessionUser } from "@/features/auth/types/auth";
import { refreshSessionTokens } from "@/lib/auth/refresh";
import { readSessionUser, sessionCookies, setSessionTokens } from "@/lib/auth/session";

const staffUser = z.object({ id: z.string().min(1), email: z.email(), role: z.enum(["ADMIN", "MEMBER"]), name: z.string().optional() });
export type StudioAccess = { ok: true; user: SessionUser } | { ok: false; status: 401 | 403 | 503; needsRefresh?: boolean };

// The display cookie is not proof of identity. Verify the bearer with the
// existing backend before serving either a studio or a downloadable asset.
export async function verifyStudioAccess(allowRefresh = false): Promise<StudioAccess> {
  const store = await cookies();
  if (process.env.NEXT_PUBLIC_USE_MOCKS === "true") {
    if (process.env.NODE_ENV === "production") return { ok: false, status: 503 };
    const user = store.get(sessionCookies.mock)?.value === "active" ? await readSessionUser() : null;
    return user ? { ok: true, user } : { ok: false, status: 401 };
  }

  const access = store.get(sessionCookies.access)?.value;
  const refresh = store.get(sessionCookies.refresh)?.value;
  const result: StudioAccess = access ? await verifyToken(access) : { ok: false, status: 401 };
  if (result.ok || result.status !== 401 || !refresh) return result;
  if (!allowRefresh) return { ...result, needsRefresh: true };

  const tokens = await refreshSessionTokens(refresh);
  if (!tokens?.accessToken || !tokens.refreshToken) return { ok: false, status: 401 };
  await setSessionTokens(tokens.accessToken, tokens.refreshToken);
  return verifyToken(tokens.accessToken);
}

async function verifyToken(token: string): Promise<StudioAccess> {
  const base = process.env.API_BASE_URL;
  if (!base) return { ok: false, status: 503 };
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/auth/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (response.status === 401) return { ok: false, status: 401 };
    if (response.status === 403) return { ok: false, status: 403 };
    if (!response.ok) return { ok: false, status: 503 };
    const body: unknown = await response.json();
    const parsed = z.object({ ok: z.literal(true), data: staffUser }).safeParse(body);
    if (!parsed.success) return { ok: false, status: 403 };
    const { id, email, role, name } = parsed.data.data;
    return { ok: true, user: { id, email, role, ...(name !== undefined ? { name } : {}) } };
  } catch {
    return { ok: false, status: 503 };
  }
}

export async function studioPageAccess(path: string) {
  const access = await verifyStudioAccess();
  if (!access.ok && access.status === 401) {
    if (access.needsRefresh) redirect(`/api/studios/session?returnTo=${encodeURIComponent(path)}`);
    redirect(`/login?returnTo=${encodeURIComponent(path)}`);
  }
  return access;
}
