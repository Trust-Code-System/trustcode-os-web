export const clientStatuses = ["ACTIVE", "ARCHIVED"] as const;
export type ClientStatus = (typeof clientStatuses)[number];

export const clientStages = [
  "LEAD",
  "CONTACTED",
  "QUALIFIED",
  "PROPOSAL",
  "WON",
  "LOST",
] as const;
export type ClientStage = (typeof clientStages)[number];

export type Client = {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: ClientStatus;
  stage: ClientStage;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ClientContact = {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ClientActivity = {
  id: string;
  actorId: string;
  actor: { id: string; name: string; email: string };
  action: string;
  entityType: string;
  entityId: string;
  clientId: string | null;
  projectId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type ClientProject = {
  id: string;
  name: string;
  status: string;
  priority: string;
  dueDate: string | null;
  updatedAt: string;
};

export type ClientMeeting = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  cancelledAt: string | null;
  updatedAt: string;
};

export type ClientDetail = Client & {
  contacts: ClientContact[];
  projects: ClientProject[];
  meetings: ClientMeeting[];
  activity: ClientActivity[];
};

export type ClientListFilters = {
  status: "" | ClientStatus;
  stage: "" | ClientStage;
  page: number;
  pageSize: number;
};

export type ClientInput = {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
};

export type ContactInput = {
  firstName: string;
  lastName: string;
  jobTitle?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
};
