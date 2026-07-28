import { z } from "zod";
import { clientStages, clientStatuses } from "../types/client";

export const clientSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  status: z.enum(clientStatuses),
  stage: z.enum(clientStages),
  archivedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const contactSchema = z.object({
  id: z.string(),
  clientId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  jobTitle: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  isPrimary: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const clientActivitySchema = z.object({
  id: z.string(),
  actorId: z.string(),
  actor: z.object({ id: z.string(), name: z.string(), email: z.string() }),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string(),
  clientId: z.string().nullable(),
  projectId: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
});
