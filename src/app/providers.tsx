"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";

import { createQueryClient } from "@/lib/query/query-client";
import { useMocks } from "@/lib/config/env";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [ready, setReady] = useState(!useMocks);

  useEffect(() => {
    if (!useMocks) return;
    void import("@/mocks/browser").then(({ worker }) => worker.start({ onUnhandledRequest: "bypass", quiet: true })).then(() => setReady(true));
  }, []);

  return <QueryClientProvider client={queryClient}>{ready ? children : <div className="grid min-h-screen place-items-center text-sm text-text-muted" role="status">Preparing development data…</div>}</QueryClientProvider>;
}
