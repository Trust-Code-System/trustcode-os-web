import { apiRequest } from "@/lib/api/client";
import { AppError } from "@/lib/errors/app-error";
import { clientDetailSchema, clientSummarySchema } from "../schemas/client";
import type { ClientDetail, ClientListFilters, ClientSummary } from "../types/client";

export async function listClients(filters: ClientListFilters, signal?: AbortSignal) {
  const result = await apiRequest<unknown[]>("/api/backend/clients", { query: filters, ...(signal ? { signal } : {}) });
  const parsed = clientSummarySchema.array().safeParse(result.data);
  if (!parsed.success || !result.meta) throw new AppError({ code: "INVALID_CLIENT_CONTRACT", message: "Client data did not match the expected contract." });
  return { items: parsed.data as ClientSummary[], meta: result.meta };
}

export async function getClient(clientId: string, signal?: AbortSignal): Promise<ClientDetail> {
  const result = await apiRequest<unknown>(`/api/backend/clients/${encodeURIComponent(clientId)}`, { ...(signal ? { signal } : {}) });
  const parsed = clientDetailSchema.safeParse(result.data);
  if (!parsed.success) throw new AppError({ code: "INVALID_CLIENT_CONTRACT", message: "Client details did not match the expected contract." });
  return parsed.data;
}
