import { z } from "zod";
import { apiRequest } from "@/lib/api/client";
import { AppError } from "@/lib/errors/app-error";
import { subscriptionsFileSchema, type Subscription } from "./subscriptions";

export const sharedSubscriptionsSchema = subscriptionsFileSchema.extend({ revision: z.number().int().nonnegative() });
export const subscriptionsQueryKey = ["app-subscriptions"] as const;

export async function readSharedSubscriptions(signal?: AbortSignal) {
  const result = await apiRequest<unknown>("/api/subscriptions", { ...(signal ? { signal } : {}), cache: "no-store" });
  return sharedSubscriptionsSchema.parse(result.data);
}

export async function saveSharedSubscriptions(revision: number, subscriptions: Subscription[]) {
  const file = subscriptionsFileSchema.parse({ version: 1, subscriptions });
  if (new TextEncoder().encode(JSON.stringify(file)).byteLength > 4_000_000) throw new AppError({ message: "Workspace subscriptions exceed 4 MB. Use smaller logos or remove unused entries." });
  const result = await apiRequest<unknown>("/api/subscriptions", { method: "PUT", body: { revision, subscriptions: file.subscriptions } });
  return sharedSubscriptionsSchema.parse(result.data);
}
