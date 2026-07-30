import type { QueryClient } from "@tanstack/react-query";

// The same records appear in dashboards, lists, detail aggregates, and the
// activity feed. Refetch every visible query after a successful mutation so
// those views cannot disagree with one another.
export function refreshAppData(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ refetchType: "active" });
}

// Cancel first so an old request cannot repopulate the cache after logout.
export async function clearAppCache(queryClient: QueryClient) {
  await queryClient.cancelQueries();
  queryClient.clear();
}
