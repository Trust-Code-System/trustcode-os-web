import "server-only";

import { cookies } from "next/headers";
import type { SessionUser } from "@/features/auth/types/auth";

export const sessionCookies = {
  access: "tc_access",
  refresh: "tc_refresh",
  user: "tc_session_user",
  mock: "tc_mock_session",
} as const;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setSession(input: { user: SessionUser; accessToken?: string; refreshToken?: string; mock?: boolean }) {
  const store = await cookies();
  if (input.accessToken) store.set(sessionCookies.access, input.accessToken, { ...cookieOptions, maxAge: 15 * 60 });
  if (input.refreshToken) store.set(sessionCookies.refresh, input.refreshToken, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
  if (input.mock) store.set(sessionCookies.mock, "active", { ...cookieOptions, maxAge: 8 * 60 * 60 });
  store.set(sessionCookies.user, Buffer.from(JSON.stringify(input.user)).toString("base64url"), { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
}

export async function readSessionUser(): Promise<SessionUser | null> {
  const value = (await cookies()).get(sessionCookies.user)?.value;
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as Partial<SessionUser>;
    if (!parsed.id || !parsed.email || (parsed.role !== "ADMIN" && parsed.role !== "MEMBER")) return null;
    return parsed as SessionUser;
  } catch {
    return null;
  }
}

export async function clearSession() {
  const store = await cookies();
  for (const name of Object.values(sessionCookies)) store.delete(name);
}
