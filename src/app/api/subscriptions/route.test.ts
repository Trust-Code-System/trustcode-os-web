import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const auth = vi.hoisted(() => vi.fn());
const read = vi.hoisted(() => vi.fn());
const save = vi.hoisted(() => vi.fn());
vi.mock("@/features/studios/server/access", () => ({ verifyStudioAccess: auth }));
vi.mock("@/features/apps/server/store", () => ({ readWorkspaceSubscriptions: read, saveWorkspaceSubscriptions: save }));
import { GET, PUT } from "./route";

const entry = { id: "legacy-1", provider: "claude", name: "Claude", type: "APP", amount: 20, currency: "USD", billing: "MONTHLY", paid: true, startsOn: "2026-11-01", expiresOn: "2026-12-01" };
const request = (data: unknown, origin = "https://workspace.test") => new NextRequest("https://workspace.test/api/subscriptions", { method: "PUT", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify(data) });

beforeEach(() => {
  vi.clearAllMocks();
  auth.mockResolvedValue({ ok: true, user: { id: "verified-staff", role: "MEMBER" } });
  read.mockResolvedValue({ version: 1, revision: 1, subscriptions: [entry] });
  save.mockResolvedValue({ version: 1, revision: 2, subscriptions: [entry] });
});

describe("shared subscriptions route", () => {
  it("denies an unverified identity before accessing shared storage", async () => {
    auth.mockResolvedValue({ ok: false, status: 401 });
    expect((await GET()).status).toBe(401);
    expect((await PUT(request({ revision: 1, subscriptions: [entry] }))).status).toBe(401);
    expect(read).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
  it("fails closed when the existing company API is unavailable", async () => {
    auth.mockResolvedValue({ ok: false, status: 503 });
    expect((await GET()).status).toBe(503);
    expect(read).not.toHaveBeenCalled();
  });
  it("returns paid details with private cache headers to verified staff", async () => {
    const response = await GET();
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(await response.json()).toMatchObject({ ok: true, data: { subscriptions: [entry] } });
    expect(auth).toHaveBeenCalledWith(true);
  });
  it("rejects cross-origin writes before authentication or storage", async () => {
    expect((await PUT(request({ revision: 1, subscriptions: [entry] }, "https://other.test"))).status).toBe(403);
    expect(auth).not.toHaveBeenCalled();
    expect(save).not.toHaveBeenCalled();
  });
  it("accepts the browser origin when Next runs behind a proxy", async () => {
    const proxied = new NextRequest("http://0.0.0.0:3000/api/subscriptions", { method: "PUT", headers: { Host: "workspace.test", "X-Forwarded-Proto": "https", Origin: "https://workspace.test" }, body: JSON.stringify({ revision: 1, subscriptions: [entry] }) });
    expect((await PUT(proxied)).status).toBe(200);
  });
  it("rejects malformed data, duplicate IDs, invalid dates and active logo content", async () => {
    for (const subscriptions of [[entry, entry], [{ ...entry, startsOn: "2026-02-30" }], [{ ...entry, logo: "data:image/svg+xml;base64,AAAA" }], [{ ...entry, expiresOn: "2026-10-01" }]]) {
      expect((await PUT(request({ revision: 1, subscriptions }))).status).toBe(422);
    }
    expect(save).not.toHaveBeenCalled();
  });
  it("preserves revision checks so stale editors get a conflict", async () => {
    save.mockResolvedValue(null);
    expect((await PUT(request({ revision: 1, subscriptions: [entry] }))).status).toBe(409);
    expect(save).toHaveBeenCalledWith(1, [entry]);
  });
  it("saves a validated record for other staff to read", async () => {
    const response = await PUT(request({ revision: 1, subscriptions: [entry] }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, data: { revision: 2, subscriptions: [entry] } });
  });
});
