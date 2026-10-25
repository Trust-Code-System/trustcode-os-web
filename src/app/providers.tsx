"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import { MotionConfig } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

import { useMotionPreference } from "@/lib/hooks/use-motion-preference";
import { ToastViewport } from "@/components/ui/toast-viewport";
import { createQueryClient } from "@/lib/query/query-client";
import { useMocks } from "@/lib/config/env";

export function Providers({ children }: { children: ReactNode }) {
  const reduce = useMotionPreference();
  const [queryClient] = useState(createQueryClient);
  const [ready, setReady] = useState(!useMocks);

  useEffect(() => {
    if (!useMocks) return;
    void import("@/mocks/browser").then(({ worker }) => worker.start({ onUnhandledRequest: "bypass", quiet: true })).then(() => setReady(true));
  }, []);

  return <MotionConfig reducedMotion={reduce ? "always" : "never"}><TooltipProvider delayDuration={450} skipDelayDuration={700}><QueryClientProvider client={queryClient}>{ready ? children : <div className="grid min-h-screen place-items-center text-sm text-text-muted" role="status">Preparing development data…</div>}<ToastViewport /></QueryClientProvider></TooltipProvider></MotionConfig>;
}
