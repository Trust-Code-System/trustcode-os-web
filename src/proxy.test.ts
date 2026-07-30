import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

describe("protected route proxy", () => {
  it("allows a refresh-only session to reach the app", () => {
    const request = new NextRequest("http://localhost/dashboard", {
      headers: { cookie: "tc_refresh=refresh-token" },
    });

    const response = proxy(request);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects a request with no session cookies to login", () => {
    const response = proxy(new NextRequest("http://localhost/projects?status=active"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login?returnTo=%2Fprojects%3Fstatus%3Dactive");
  });
});
