import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { clearAppCache, refreshAppData } from "./cache";

describe("app query cache", () => {
  it("marks cached module data stale after a mutation", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["clients"], [{ id: "client-1" }]);
    queryClient.setQueryData(["workspace", "projects"], [{ id: "project-1" }]);

    await refreshAppData(queryClient);

    expect(queryClient.getQueryState(["clients"])?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(["workspace", "projects"])?.isInvalidated).toBe(true);
  });

  it("cancels requests before removing data during logout", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(["session", "current"], { id: "admin" });
    const cancel = vi.spyOn(queryClient, "cancelQueries");

    await clearAppCache(queryClient);

    expect(cancel).toHaveBeenCalledOnce();
    expect(queryClient.getQueryCache().getAll()).toHaveLength(0);
    expect(queryClient.getMutationCache().getAll()).toHaveLength(0);
  });
});
