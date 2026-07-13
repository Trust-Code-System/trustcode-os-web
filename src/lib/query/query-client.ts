import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: (count, error) => !(error instanceof Error && "status" in error && error.status === 404) && count < 2, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
