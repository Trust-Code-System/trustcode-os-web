import type { ClientDetail, ClientStage } from "@/features/clients/types/client";

const names = [
  "Northstar Logistics", "Meridian Health Partners", "Cedar Pay", "BluePeak Energy",
  "Atlas Learning Group", "Harbour Foods", "Civic Labs", "Oriole Studios",
  "Verdant Homes", "Kora Retail Network", "Sable Advisory", "Sunline Mobility",
];
const stages: ClientStage[] = ["LEAD", "CONTACTED", "QUALIFIED", "PROPOSAL", "WON", "LOST"];

export const clients: ClientDetail[] = names.map((name, index) => {
  const id = index === 0 ? "northstar-logistics" : name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const createdAt = `2026-05-${String((index % 9) + 1).padStart(2, "0")}T09:00:00.000Z`;
  const updatedAt = `2026-07-${String((index % 20) + 1).padStart(2, "0")}T14:30:00.000Z`;
  const status = index === 7 ? "ARCHIVED" as const : "ACTIVE" as const;
  const stage = stages[index % stages.length] ?? "LEAD";
  const projectId = `${id}-project`;
  const meetingId = `${id}-meeting`;
  return {
    id, name, description: `${name} client record.`, email: `hello@${id}.example`,
    phone: `+234 800 555 ${String(1100 + index)}`, website: `https://${id}.example`,
    status, stage, archivedAt: status === "ARCHIVED" ? updatedAt : null, createdAt, updatedAt,
    contacts: [{ id: `${id}-contact`, clientId: id, firstName: "Primary", lastName: "Contact", jobTitle: "Operations lead", email: `hello@${id}.example`, phone: `+234 801 200 ${String(2200 + index)}`, isPrimary: true, createdAt, updatedAt }],
    projects: [{ id: projectId, name: `${name} delivery programme`, status: index % 3 === 0 ? "IN_PROGRESS" : "PLANNING", priority: index % 2 === 0 ? "HIGH" : "MEDIUM", dueDate: "2026-11-30T00:00:00.000Z", updatedAt }],
    meetings: [{ id: meetingId, title: `${name} check-in`, startsAt: "2026-08-15T10:00:00.000Z", endsAt: "2026-08-15T11:00:00.000Z", cancelledAt: null, updatedAt }],
    activity: [{ id: `${id}-activity`, actorId: "user_admin", actor: { id: "user_admin", name: "Ghost", email: "admin@trustcode.test" }, action: "client.created", entityType: "CLIENT", entityId: id, clientId: id, projectId: null, metadata: {}, createdAt }],
  };
});
