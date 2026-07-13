"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getClient, listClients } from "../api/clients";
import type { ClientListFilters } from "../types/client";

export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters: ClientListFilters) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (clientId: string) => [...clientKeys.details(), clientId] as const,
};

export function useClients(filters: ClientListFilters) { return useQuery({ queryKey: clientKeys.list(filters), queryFn: ({ signal }) => listClients(filters, signal), placeholderData: keepPreviousData }); }
export function useClient(clientId: string) { return useQuery({ queryKey: clientKeys.detail(clientId), queryFn: ({ signal }) => getClient(clientId, signal) }); }
