import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Enter a valid date.");

export const subscriptionSchema = z.object({
  id: z.string().min(1).max(100),
  name: z.string().trim().min(1).max(100),
  provider: z.enum(["custom", "codex", "claude", "anthropic", "github", "vercel", "figma", "notion", "slack", "supabase"]),
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

export const providers = [
  { id: "codex", name: "Codex", icon: "codex", website: "https://chatgpt.com/codex" },
  { id: "claude", name: "Claude", icon: "claude", website: "https://claude.ai" },
  { id: "anthropic", name: "Anthropic", icon: "anthropic", website: "https://console.anthropic.com" },
  { id: "github", name: "GitHub", icon: "github", website: "https://github.com" },
  { id: "vercel", name: "Vercel", icon: "vercel", website: "https://vercel.com" },
  { id: "figma", name: "Figma", icon: "figma", website: "https://figma.com" },
  { id: "notion", name: "Notion", icon: "notion", website: "https://notion.so" },
  { id: "slack", name: "Slack", icon: "", website: "https://slack.com" },
  { id: "supabase", name: "Supabase", icon: "supabase", website: "https://supabase.com" },
  { id: "custom", name: "Other app", icon: "", website: "" },
] as const;

export function subscriptionStatus(entry: Subscription, today: string) {
  if (entry.startsOn > today) return "Scheduled";
  if (!entry.expiresOn) return "No expiry";
  if (entry.expiresOn < today) return "Expired";
  const daysLeft = (Date.parse(entry.expiresOn) - Date.parse(today)) / 86_400_000;
  return daysLeft <= 30 ? "Expiring soon" : "Active";
}
