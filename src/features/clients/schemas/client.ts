import { z } from "zod";
import { clientStatuses, pipelineStages } from "../types/client";

const ownerSchema = z.object({ id: z.string(), name: z.string(), email: z.email() });
export const clientSummarySchema = z.object({
  id: z.string(), name: z.string(), industry: z.string(), primaryEmail: z.email(), phone: z.string(),
  status: z.enum(clientStatuses), pipelineStage: z.enum(pipelineStages), owner: ownerSchema,
  createdAt: z.string(), updatedAt: z.string(),
});
export const clientDetailSchema = clientSummarySchema.extend({
  website: z.string(), address: z.string(), summary: z.string(),
  contacts: z.array(z.object({ id: z.string(), name: z.string(), email: z.email(), phone: z.string(), jobTitle: z.string(), isPrimary: z.boolean() })),
  notes: z.array(z.object({ id: z.string(), body: z.string(), author: ownerSchema, createdAt: z.string() })),
  projects: z.array(z.object({ id: z.string(), title: z.string(), status: z.string(), updatedAt: z.string() })),
  meetings: z.array(z.object({ id: z.string(), title: z.string(), status: z.string(), updatedAt: z.string() })),
  documents: z.array(z.object({ id: z.string(), title: z.string(), status: z.string(), updatedAt: z.string() })),
  activity: z.array(z.object({ id: z.string(), action: z.string(), description: z.string(), actor: z.string(), createdAt: z.string() })),
});
