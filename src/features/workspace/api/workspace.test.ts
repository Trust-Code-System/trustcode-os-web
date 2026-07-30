import { describe, expect, it } from "vitest";

import { listActivity } from "./workspace";

describe("Workspace service", () => {
  it("loads the paginated company activity feed with backend filters", async () => {
    const result = await listActivity({ entityType: "CLIENT", page: 1, pageSize: 5 });

    expect(result.data).toHaveLength(5);
    expect(result.data.every((item) => item.entityType === "CLIENT")).toBe(true);
    expect(result.meta).toMatchObject({ page: 1, pageSize: 5, total: 12 });
  });
});
