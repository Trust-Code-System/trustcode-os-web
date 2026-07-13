import type { ClientDetail, ClientOwner, ClientStatus, PipelineStage } from "@/features/clients/types/client";

const amina: ClientOwner = { id: "user_admin", name: "Ghost", email: "admin@trustcode.test" };
const david: ClientOwner = { id: "user_member", name: "David Mensah", email: "member@trustcode.test" };

const seeds: Array<[string, string, string, ClientStatus, PipelineStage, ClientOwner, string]> = [
  ["northstar-logistics", "Northstar Logistics", "Logistics", "ACTIVE", "ENGAGED", amina, "operations@northstar.example"],
  ["meridian-health", "Meridian Health Partners", "Healthcare", "PROSPECT", "DISCOVERY", david, "hello@meridianhealth.example"],
  ["cedar-pay", "Cedar Pay", "Financial services", "ACTIVE", "ONBOARDING", amina, "team@cedarpay.example"],
  ["bluepeak-energy", "BluePeak Energy", "Energy", "PAUSED", "PROPOSAL", david, "contact@bluepeak.example"],
  ["atlas-learning", "Atlas Learning Group", "Education", "ACTIVE", "ENGAGED", amina, "office@atlaslearning.example"],
  ["harbour-foods", "Harbour Foods", "Consumer goods", "PROSPECT", "LEAD", david, "growth@harbourfoods.example"],
  ["civic-labs", "Civic Labs", "Public sector technology", "ACTIVE", "ENGAGED", amina, "programs@civiclabs.example"],
  ["oriole-studios", "Oriole Studios", "Media", "ARCHIVED", "ENGAGED", david, "studio@oriole.example"],
  ["verdant-homes", "Verdant Homes", "Real estate", "PROSPECT", "PROPOSAL", amina, "hello@verdanthomes.example"],
  ["kora-retail", "Kora Retail Network", "Retail", "ACTIVE", "ONBOARDING", david, "partners@koraretail.example"],
  ["sable-advisory", "Sable Advisory", "Professional services", "PAUSED", "DISCOVERY", amina, "contact@sableadvisory.example"],
  ["sunline-mobility", "Sunline Mobility", "Transportation", "PROSPECT", "LEAD", david, "hello@sunline.example"],
];

export const clients: ClientDetail[] = seeds.map(([id, name, industry, status, pipelineStage, owner, primaryEmail], index) => {
  const day = String((index % 8) + 1).padStart(2, "0");
  return {
    id, name, industry, status, pipelineStage, owner, primaryEmail,
    phone: `+234 800 555 ${String(1100 + index)}`,
    website: `https://${id}.example`,
    address: `${12 + index} Example Avenue, Lagos, Nigeria`,
    summary: `${name} is a fictional ${industry.toLowerCase()} organisation used to exercise the provisional Client CRM contract without exposing real client data.`,
    createdAt: `2026-05-${day}T09:00:00.000Z`,
    updatedAt: `2026-07-${String((index % 10) + 1).padStart(2, "0")}T14:30:00.000Z`,
    contacts: [
      { id: `${id}-contact-1`, name: `Primary contact ${index + 1}`, email: primaryEmail, phone: `+234 801 200 ${String(2200 + index)}`, jobTitle: "Operations lead", isPrimary: true },
      { id: `${id}-contact-2`, name: `Finance contact ${index + 1}`, email: `finance@${id}.example`, phone: `+234 802 300 ${String(3300 + index)}`, jobTitle: "Finance manager", isPrimary: false },
    ],
    notes: index % 3 === 0 ? [] : [{ id: `${id}-note-1`, body: "Follow up on the agreed discovery questions before the next working session.", author: owner, createdAt: "2026-07-08T11:15:00.000Z" }],
    projects: status === "ACTIVE" ? [{ id: `${id}-project-1`, title: "Digital operations programme", status: "IN_PROGRESS", updatedAt: "2026-07-09T09:30:00.000Z" }] : [],
    meetings: [{ id: `${id}-meeting-1`, title: "Monthly client check-in", status: "SCHEDULED", updatedAt: "2026-07-10T12:00:00.000Z" }],
    documents: index % 2 === 0 ? [{ id: `${id}-document-1`, title: "Discovery brief.pdf", status: "CURRENT", updatedAt: "2026-07-06T08:00:00.000Z" }] : [],
    activity: [{ id: `${id}-activity-1`, action: "Client updated", description: "Pipeline and ownership details were reviewed.", actor: owner.name, createdAt: "2026-07-10T15:45:00.000Z" }, { id: `${id}-activity-2`, action: "Client created", description: "The client record was added to the workspace.", actor: owner.name, createdAt: `2026-05-${day}T09:00:00.000Z` }],
  };
});
