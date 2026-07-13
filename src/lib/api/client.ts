import { AppError } from "@/lib/errors/app-error";
import type { ApiEnvelope, ApiResult } from "./types";

const DEFAULT_TIMEOUT_MS = 15_000;

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  query?: Record<string, string | number | boolean | null | undefined>;
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiResult<T>> {
  const { body, query: queryInput, timeoutMs, ...requestInit } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort("timeout"), timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(queryInput ?? {})) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const url = `${path}${query.size ? `?${query}` : ""}`;
  const headers = new Headers(requestInit.headers);
  headers.set("Accept", "application/json");
  if (body !== undefined && !(body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (process.env.NEXT_PUBLIC_MOCK_SCENARIO) headers.set("x-mock-scenario", process.env.NEXT_PUBLIC_MOCK_SCENARIO);

  const linkedAbort = () => controller.abort();
  requestInit.signal?.addEventListener("abort", linkedAbort, { once: true });
  try {
    const response = await fetch(url, {
      ...requestInit,
      ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
      credentials: "same-origin",
      headers,
      signal: controller.signal,
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      throw new AppError({ status: response.status, code: "INVALID_RESPONSE", message: "The service returned an unexpected response." });
    }
    const envelope = (await response.json()) as ApiEnvelope<T>;
    if (!response.ok || !envelope.ok) {
      const failure = envelope.ok ? undefined : envelope.error;
      throw new AppError({
        status: response.status,
        code: failure?.code ?? `HTTP_${response.status}`,
        message: failure?.message ?? messageForStatus(response.status),
        ...(failure?.fields ? { fieldErrors: failure.fields } : {}),
        ...(!envelope.ok && envelope.requestId ? { requestId: envelope.requestId } : {}),
      });
    }
    return envelope.meta ? { data: envelope.data, meta: envelope.meta } : { data: envelope.data };
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (controller.signal.aborted) {
      if (requestInit.signal?.aborted) throw new AppError({ code: "REQUEST_ABORTED", message: "The request was cancelled." });
      throw new AppError({ code: "REQUEST_TIMEOUT", message: "The service took too long to respond. Please try again." });
    }
    throw new AppError({ code: "NETWORK_ERROR", message: "We could not reach the service. Check your connection and try again." });
  } finally {
    clearTimeout(timeout);
    requestInit.signal?.removeEventListener("abort", linkedAbort);
  }
}

function messageForStatus(status: number) {
  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do that.";
  if (status === 404) return "The requested record could not be found.";
  if (status === 409) return "That change conflicts with the latest saved data.";
  if (status === 422) return "Please check the submitted values.";
  if (status >= 500) return "The service is temporarily unavailable. Please try again.";
  return "The request could not be completed.";
}
