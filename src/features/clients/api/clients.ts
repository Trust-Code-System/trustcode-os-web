import { apiRequest } from "@/lib/api/client";
import { AppError } from "@/lib/errors/app-error";
import { clientActivitySchema, clientSchema, contactSchema } from "../schemas/client";
import type {
  Client,
  ClientDetail,
  ClientInput,
  ClientListFilters,
  ClientMeeting,
  ClientProject,
  ClientStage,
  ContactInput,
} from "../types/client";

function invalidContract(message: string): never {
  throw new AppError({ code: "INVALID_BACKEND_CONTRACT", message });
}

export async function listClients(filters: ClientListFilters, signal?: AbortSignal) {
  const result = await apiRequest<unknown[]>("/api/backend/clients", {
    query: {
      status: filters.status,
      stage: filters.stage,
      page: filters.page,
      pageSize: filters.pageSize,
    },
    ...(signal ? { signal } : {}),
  });
  const parsed = clientSchema.array().safeParse(result.data);
  if (!parsed.success || !result.meta) invalidContract("Client data did not match the current backend contract.");
  return { items: parsed.data, meta: result.meta };
}

export async function getClient(clientId: string, signal?: AbortSignal): Promise<ClientDetail> {
  const id = encodeURIComponent(clientId);
  const options = signal ? { signal } : {};
  const [clientResult, contactsResult, projectsResult, meetingsResult, activityResult] = await Promise.all([
    apiRequest<unknown>(`/api/backend/clients/${id}`, options),
    apiRequest<unknown[]>(`/api/backend/clients/${id}/contacts`, options),
    apiRequest<ClientProject[]>("/api/backend/projects", { ...options, query: { clientId } }),
    apiRequest<ClientMeeting[]>("/api/backend/meetings", { ...options, query: { clientId } }),
    apiRequest<unknown[]>(`/api/backend/clients/${id}/activity`, { ...options, query: { page: 1, pageSize: 100 } }),
  ]);

  const client = clientSchema.safeParse(clientResult.data);
  const contacts = contactSchema.array().safeParse(contactsResult.data);
  const activity = clientActivitySchema.array().safeParse(activityResult.data);
  if (!client.success || !contacts.success || !activity.success) {
    invalidContract("Client details did not match the current backend contract.");
  }

  return {
    ...client.data,
    contacts: contacts.data,
    projects: projectsResult.data,
    meetings: meetingsResult.data,
    activity: activity.data,
  };
}

export function createClient(input: ClientInput) {
  return apiRequest<Client>("/api/backend/clients", { method: "POST", body: input }).then((result) => result.data);
}

export function updateClient(clientId: string, input: ClientInput) {
  return apiRequest<Client>(`/api/backend/clients/${encodeURIComponent(clientId)}`, { method: "PATCH", body: input }).then((result) => result.data);
}

export function changeClientStage(clientId: string, stage: ClientStage) {
  return apiRequest<Client>(`/api/backend/clients/${encodeURIComponent(clientId)}/stage`, { method: "PATCH", body: { stage } }).then((result) => result.data);
}

export function setClientArchived(clientId: string, archived: boolean) {
  return apiRequest<Client>(`/api/backend/clients/${encodeURIComponent(clientId)}/${archived ? "archive" : "restore"}`, { method: "PATCH" }).then((result) => result.data);
}

export function createContact(clientId: string, input: ContactInput) {
  return apiRequest(`/api/backend/clients/${encodeURIComponent(clientId)}/contacts`, { method: "POST", body: input }).then((result) => result.data);
}

export function updateContact(clientId: string, contactId: string, input: Partial<ContactInput>) {
  return apiRequest(`/api/backend/clients/${encodeURIComponent(clientId)}/contacts/${encodeURIComponent(contactId)}`, { method: "PATCH", body: input }).then((result) => result.data);
}

export function deleteContact(clientId: string, contactId: string) {
  return apiRequest(`/api/backend/clients/${encodeURIComponent(clientId)}/contacts/${encodeURIComponent(contactId)}`, { method: "DELETE" }).then((result) => result.data);
}
