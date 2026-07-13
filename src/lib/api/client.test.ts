import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { apiRequest } from "./client";

describe("apiRequest", () => {
  it("adapts success data and pagination in one place", async () => {
    server.use(http.get("http://localhost/example", () => HttpResponse.json({ ok: true, data: [{ id: "one" }], meta: { page: 2, pageSize: 10, total: 21 } })));
    const result = await apiRequest<{ id: string }[]>("http://localhost/example");
    expect(result).toEqual({ data: [{ id: "one" }], meta: { page: 2, pageSize: 10, total: 21 } });
  });

  it("normalises backend field errors", async () => {
    server.use(http.post("http://localhost/example", () => HttpResponse.json({ ok: false, error: { code: "VALIDATION_FAILED", message: "Check the form.", fields: { email: ["email must be an email"] } } }, { status: 422 })));
    await expect(apiRequest("http://localhost/example", { method: "POST", body: { email: "bad" } })).rejects.toMatchObject({ name: "AppError", status: 422, code: "VALIDATION_FAILED", message: "Check the form.", fieldErrors: { email: ["email must be an email"] } });
  });

  it("does not expose unexpected non-JSON responses", async () => {
    server.use(http.get("http://localhost/example", () => new HttpResponse("upstream stack trace", { status: 500, headers: { "Content-Type": "text/html" } })));
    await expect(apiRequest("http://localhost/example")).rejects.toMatchObject({ code: "INVALID_RESPONSE", message: "The service returned an unexpected response." });
  });
});
