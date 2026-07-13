export const clientStatuses = ["PROSPECT", "ACTIVE", "PAUSED", "ARCHIVED"] as const;
export type ClientStatus = (typeof clientStatuses)[number];
export const pipelineStages = ["LEAD", "DISCOVERY", "PROPOSAL", "ONBOARDING", "ENGAGED"] as const;
export type PipelineStage = (typeof pipelineStages)[number];
export type ClientSort = "updated-desc" | "created-desc" | "name-asc";

export type ClientOwner = { id: string; name: string; email: string };
export type ClientSummary = {
  id: string;
  name: string;
  industry: string;
  primaryEmail: string;
  phone: string;
  status: ClientStatus;
  pipelineStage: PipelineStage;
  owner: ClientOwner;
  createdAt: string;
  updatedAt: string;
};

export type ClientContact = { id: string; name: string; email: string; phone: string; jobTitle: string; isPrimary: boolean };
export type ClientNote = { id: string; body: string; author: ClientOwner; createdAt: string };
export type RelatedRecord = { id: string; title: string; status: string; updatedAt: string };
export type ActivityRecord = { id: string; action: string; description: string; actor: string; createdAt: string };

export type ClientDetail = ClientSummary & {
  website: string;
  address: string;
  summary: string;
  contacts: ClientContact[];
  notes: ClientNote[];
  projects: RelatedRecord[];
  meetings: RelatedRecord[];
  documents: RelatedRecord[];
  activity: ActivityRecord[];
};

export type ClientListFilters = { q: string; status: "" | ClientStatus; pipeline: "" | PipelineStage; sort: ClientSort; page: number; pageSize: number };
