import { describe, expect, it } from "vitest";
import { clientKeys } from "./use-clients";

describe("clientKeys", () => {
  it("separates list filters and detail records", () => {
    const filters = { q: "atlas", status: "ACTIVE" as const, pipeline: "" as const, sort: "name-asc" as const, page: 1, pageSize: 8 };
    expect(clientKeys.list(filters)).toEqual(["clients", "list", filters]);
    expect(clientKeys.detail("client-1")).toEqual(["clients", "detail", "client-1"]);
  });
});
