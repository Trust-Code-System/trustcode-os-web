"use client";

import { useQuery } from "@tanstack/react-query";

import { authApi } from "../api/auth";
import type { SessionUser } from "../types/auth";

export const sessionKeys = { all: ["session"] as const, current: () => [...sessionKeys.all, "current"] as const };

export function useSession(initialData: SessionUser) {
  return useQuery({ queryKey: sessionKeys.current(), queryFn: authApi.me, initialData, staleTime: 60_000, retry: false });
}
