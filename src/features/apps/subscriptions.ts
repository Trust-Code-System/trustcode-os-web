import { z } from "zod";
import { appCatalog } from "./catalog";

export const providers = [...appCatalog, { id: "custom", name: "Other app", icon: "", website: "", category: "Other" }] as const;

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Enter a valid date.");

export const subscriptionSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(100),
  provider: z.enum(providers.map((provider) => provider.id)),
  logo: z.string().max(400_000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/).optional(),
  type: z.enum(["APP", "API"]),
  amount: z.number().finite().min(0).max(1_000_000_000),
  currency: z.enum(["USD", "NGN", "GBP", "EUR"]),
  billing: z.enum(["MONTHLY", "YEARLY", "ONE_TIME", "USAGE"]),
  paid: z.boolean(),
  startsOn: date,
  expiresOn: z.union([date, z.literal("")]),
}).refine((entry) => !entry.expiresOn || entry.expiresOn >= entry.startsOn, {
  message: "Expiry must be on or after the start date.", path: ["expiresOn"],
});

export const subscriptionsFileSchema = z.object({
  version: z.literal(1),
  subscriptions: z.array(subscriptionSchema).max(1000).refine(
    (entries) => new Set(entries.map((entry) => entry.id)).size === entries.length,
    "Each subscription must have a unique ID.",
  ),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export function subscriptionStatus(entry: Subscription, today: string) {
  if (entry.startsOn > today) return "Scheduled";
  if (!entry.expiresOn) return "No expiry";
  if (entry.expiresOn < today) return "Expired";
  const daysLeft = (Date.parse(entry.expiresOn) - Date.parse(today)) / 86_400_000;
  return daysLeft <= 30 ? "Expiring soon" : "Active";
}
