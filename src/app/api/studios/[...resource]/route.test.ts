import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ access: vi.fn(), read: vi.fn() }));
vi.mock("@/features/studios/server/access", () => ({ verifyStudioAccess: mocks.access }));
vi.mock("node:fs/promises", async (original) => {
  const actual = await original<typeof import("node:fs/promises")>();
  return { ...actual, readFile: mocks.read, default: { ...actual, readFile: mocks.read } };
});
import { GET } from "./route";

const request = (resource: string[], query = "") => GET(new NextRequest("https://workspace.example.test/api/studios/" + resource.join("/") + query), { params: Promise.resolve({ resource }) });

describe("protected studio delivery", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.access.mockResolvedValue({ ok: true, user: { id: "staff", role: "ADMIN" } }); mocks.read.mockResolvedValue(Buffer.from("trusted studio content")); });
  it("guards HTML and every template before reading any file", async () => {
    mocks.access.mockResolvedValue({ ok: false, status: 401 });
    for (const resource of [["invoice"], ["contract", "index.html"], ["contract", "TrustCode-NDA.pdf"], ["invoice", "TrustCode-Invoice-Template.xlsx"]]) {
      const response = await request(resource); expect(response.status).toBe(401); expect(response.headers.get("cache-control")).toContain("no-store");
    }
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("serves authenticated downloads privately with safe attachment names", async () => {
    const response = await request(["invoice", "TrustCode-Invoice-Template.docx"]);
    expect(response.status).toBe(200); expect(response.headers.get("content-disposition")).toBe('attachment; filename="TrustCode-Invoice-Template.docx"');
    expect(response.headers.get("cache-control")).toContain("private"); expect(response.headers.get("x-frame-options")).toBe("SAMEORIGIN"); expect(response.headers.get("cross-origin-resource-policy")).toBe("same-origin");
  });
  it("rejects unlisted file paths without consulting auth or the filesystem", async () => {
    expect((await request(["contract", "..", ".env.local"])).status).toBe(404); expect(mocks.read).not.toHaveBeenCalled(); expect(mocks.access).not.toHaveBeenCalled();
  });
  it("returns to the requested document tool after refreshing, without an open redirect", async () => {
    let response = await request(["session"], "?returnTo=%2Fdocuments%2Fcontracts"); expect(response.headers.get("location")).toBe("https://workspace.example.test/documents/contracts");
    response = await request(["session"], "?returnTo=https%3A%2F%2Fevil.test"); expect(response.headers.get("location")).toBe("https://workspace.example.test/documents");
  });
});
