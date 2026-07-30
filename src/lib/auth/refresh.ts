import "server-only";

import type { ApiEnvelope } from "@/lib/api/types";

export type RefreshedTokens = { accessToken: string; refreshToken: string };

// A dashboard can issue several requests after the access token expires. Share
// one rotation result so those requests do not race the single-use refresh token.
const refreshes = new Map<string, Promise<RefreshedTokens | null>>();

export function refreshSessionTokens(refreshToken: string): Promise<RefreshedTokens | null> {
  const existing = refreshes.get(refreshToken);
  if (existing) return existing;

  const refresh = requestRefresh(refreshToken);
  refreshes.set(refreshToken, refresh);
  void refresh.finally(() => {
    const cleanup = setTimeout(() => refreshes.delete(refreshToken), 5_000);
    if (typeof cleanup !== "number") cleanup.unref();
  });
  return refresh;
}

async function requestRefresh(refreshToken: string): Promise<RefreshedTokens | null> {
  const base = process.env.API_BASE_URL ?? "http://localhost:3000/api";
  try {
    const response = await fetch(`${base}/auth/refresh`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const envelope = await response.json() as ApiEnvelope<RefreshedTokens>;
    return response.ok && envelope.ok ? envelope.data : null;
  } catch {
    return null;
  }
}
