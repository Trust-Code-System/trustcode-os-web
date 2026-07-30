import { MutationCache, QueryClient } from "@tanstack/react-query";

import { toAppError } from "@/lib/errors/app-error";
import { showToast } from "@/lib/feedback/toasts";

export function createQueryClient() {
  return new QueryClient({
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        if (mutation.meta?.suppressToast === true) return;
        const configured = mutation.meta?.successMessage;
        showToast({ tone: "success", title: typeof configured === "string" ? configured : "Action completed successfully" });
      },
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.suppressToast === true) return;
        const appError = toAppError(error);
        showToast({ tone: "error", title: "Action failed", message: appError.message });
      },
    }),
    defaultOptions: {
      queries: { staleTime: 30_000, retry: (count, error) => !(error instanceof Error && "status" in error && error.status === 404) && count < 2, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}
