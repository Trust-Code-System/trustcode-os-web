import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { refreshSessionTokens } from "./refresh";

describe("session refresh", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("shares one refresh-token rotation across concurrent requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, data: { accessToken: "new-access", refreshToken: "new-refresh" } }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);

    const [first, second] = await Promise.all([
      refreshSessionTokens("same-refresh-token"),
      refreshSessionTokens("same-refresh-token"),
    ]);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual({ accessToken: "new-access", refreshToken: "new-refresh" });
    expect(second).toEqual(first);
  });
});
