import { describe, expect, it } from "vitest";
import { studioAsset, studioReturnPath } from "./catalog";

describe("studio resource boundaries", () => {
  it("only resolves supported studios and exact filenames", () => {
    expect(studioAsset(["invoice"])?.file).toBe("index.html");
    expect(studioAsset(["contract", "TrustCode-NDA.docx"])?.contentType).toContain("wordprocessingml");
    for (const parts of [[], ["other"], ["invoice", "../.env.local"], ["invoice", "..", "contract"], ["invoice", "toString"], ["contract", "secret.json"]]) expect(studioAsset(parts)).toBeNull();
  });
  it("limits session-return redirects to document pages", () => {
    expect(studioReturnPath("/documents/contracts")).toBe("/documents/contracts");
    for (const path of [null, "//evil.test", "https://evil.test", "/api/backend/users", "/documents/../team", "/documents?next=https://evil.test"]) expect(studioReturnPath(path)).toBe("/documents");
  });
});
