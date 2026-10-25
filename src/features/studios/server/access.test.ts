import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ values: {} as Record<string, string>, readUser: vi.fn(), setTokens: vi.fn(), refresh: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (key: string) => mocks.values[key] ? { value: mocks.values[key] } : undefined }) }));
vi.mock("@/lib/auth/session", () => ({ sessionCookies: { access: "tc_access", refresh: "tc_refresh", mock: "tc_mock_session" }, readSessionUser: mocks.readUser, setSessionTokens: mocks.setTokens }));
vi.mock("@/lib/auth/refresh", () => ({ refreshSessionTokens: mocks.refresh }));

import { verifyStudioAccess } from "./access";

const user = { id: "staff_1", email: "staff@example.test", role: "ADMIN" };
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

describe("verified studio access", () => {
  beforeEach(() => { mocks.values = {}; vi.clearAllMocks(); vi.stubEnv("NEXT_PUBLIC_USE_MOCKS", "false"); vi.stubEnv("API_BASE_URL", "https://api.example.test/api"); });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("rejects a forged display cookie without contacting the backend", async () => {
    mocks.values.tc_session_user = Buffer.from(JSON.stringify(user)).toString("base64url");
    const fetch = vi.fn(); vi.stubGlobal("fetch", fetch);
    expect(await verifyStudioAccess()).toEqual({ ok: false, status: 401 });
    expect(fetch).not.toHaveBeenCalled(); expect(mocks.readUser).not.toHaveBeenCalled();
  });
  it("checks a real bearer with the backend rather than trusting display metadata", async () => {
    mocks.values.tc_access = "test-access";
    const fetch = vi.fn().mockResolvedValue(response({ ok: true, data: user })); vi.stubGlobal("fetch", fetch);
    expect(await verifyStudioAccess()).toEqual({ ok: true, user });
    expect(fetch).toHaveBeenCalledWith("https://api.example.test/api/auth/me", expect.objectContaining({ cache: "no-store", headers: expect.objectContaining({ Authorization: "Bearer test-access" }) }));
  });
  it("does not grant access for a rejected bearer or an unknown role", async () => {
    mocks.values.tc_access = "invalid";
    const fetch = vi.fn().mockResolvedValueOnce(response({}, 401)).mockResolvedValueOnce(response({ ok: true, data: { ...user, role: "CLIENT" } })); vi.stubGlobal("fetch", fetch);
    expect(await verifyStudioAccess()).toEqual({ ok: false, status: 401 });
    expect(await verifyStudioAccess()).toEqual({ ok: false, status: 403 });
  });
  it("handles expired access through the existing refresh rotation", async () => {
    mocks.values.tc_refresh = "test-refresh";
    expect(await verifyStudioAccess()).toEqual({ ok: false, status: 401, needsRefresh: true });
    expect(mocks.refresh).not.toHaveBeenCalled();
    mocks.refresh.mockResolvedValue({ accessToken: "rotated-access", refreshToken: "rotated-refresh" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response({ ok: true, data: user })));
    expect(await verifyStudioAccess(true)).toEqual({ ok: true, user });
    expect(mocks.setTokens).toHaveBeenCalledWith("rotated-access", "rotated-refresh");
  });
  it("fails closed when the auth service is unavailable", async () => {
    mocks.values.tc_access = "test-access"; vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await verifyStudioAccess()).toEqual({ ok: false, status: 503 });
  });
  it("never accepts mock sign-in in a production process", async () => {
    vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXT_PUBLIC_USE_MOCKS", "true"); mocks.values.tc_mock_session = "active"; mocks.readUser.mockResolvedValue(user);
    expect(await verifyStudioAccess()).toEqual({ ok: false, status: 503 }); expect(mocks.readUser).not.toHaveBeenCalled();
  });
});
