import { apiRequest } from "@/lib/api/client";

export const projectStatuses = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED"] as const;
export const projectPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export const projectRoles = ["OWNER", "LEAD", "MEMBER"] as const;
export const milestoneStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;
export const meetingViews = ["all", "upcoming", "past", "cancelled"] as const;

export type ProjectStatus = (typeof projectStatuses)[number];
export type ProjectPriority = (typeof projectPriorities)[number];
export type ProjectRole = (typeof projectRoles)[number];
export type MilestoneStatus = (typeof milestoneStatuses)[number];
export type MeetingView = (typeof meetingViews)[number];

export type Project = {
  id: string; name: string; description: string | null; clientId: string;
  status: ProjectStatus; priority: ProjectPriority; startDate: string | null;
  dueDate: string | null; completedAt: string | null; archivedAt: string | null;
  createdAt: string; updatedAt: string;
};
export type ProjectInput = { name: string; clientId: string; description?: string; status?: ProjectStatus; priority?: ProjectPriority; startDate?: string; dueDate?: string };
export type Milestone = { id: string; projectId: string; title: string; description: string | null; status: MilestoneStatus; dueDate: string | null; completedAt: string | null; position: number; createdAt: string; updatedAt: string };
export type ProjectMember = { id: string; projectId: string; userId: string; role: ProjectRole; joinedAt: string; user: { id: string; name: string; email: string; role: "ADMIN" | "MEMBER" } };
export type Meeting = { id: string; title: string; agenda: string | null; startsAt: string; endsAt: string; meetingUrl: string | null; cancelledAt: string | null; clientId: string | null; projectId: string | null; createdById: string; createdAt: string; updatedAt: string };
export type MeetingInput = { title: string; startsAt: string; agenda?: string; meetingUrl?: string; clientId?: string; projectId?: string };
export type TeamUser = { id: string; email: string; name: string; role: "ADMIN" | "MEMBER"; isActive: boolean; lastLoginAt: string | null; emailVerifiedAt: string | null; createdAt: string };
export const invitationStatuses = ["PENDING", "ACCEPTED", "REVOKED", "EXPIRED"] as const;
export type InvitationStatus = (typeof invitationStatuses)[number];
// Mirrors the backend EmailDeliveryStatus enum, which tracks Resend webhook events.
export const emailDeliveryStatuses = ["PENDING", "SENDING", "SUBMITTED", "DELIVERED", "DELAYED", "FAILED", "BOUNCED", "SUPPRESSED", "COMPLAINED"] as const;
export type EmailDeliveryStatus = (typeof emailDeliveryStatuses)[number];
export type TeamInvitation = {
  id: string; email: string; name: string; role: "ADMIN" | "MEMBER";
  status: InvitationStatus; emailStatus: EmailDeliveryStatus; emailAttemptCount: number;
  expiresAt: string; acceptedAt: string | null; revokedAt: string | null; createdAt: string;
};
export type ClientOption = { id: string; name: string; status: "ACTIVE" | "ARCHIVED" };

export const workspaceKeys = {
  all: ["workspace"] as const,
  dashboard: () => [...workspaceKeys.all, "dashboard"] as const,
  projects: (filters: Record<string, unknown> = {}) => [...workspaceKeys.all, "projects", filters] as const,
  project: (id: string) => [...workspaceKeys.all, "project", id] as const,
  meetings: (view: MeetingView = "all") => [...workspaceKeys.all, "meetings", view] as const,
  users: () => [...workspaceKeys.all, "users"] as const,
  invitations: (status?: InvitationStatus) => [...workspaceKeys.all, "invitations", status ?? "all"] as const,
};

export function listProjects(filters: { clientId?: string; status?: ProjectStatus; priority?: ProjectPriority; archived?: boolean } = {}, signal?: AbortSignal) {
  return apiRequest<Project[]>("/api/backend/projects", { query: filters, ...(signal ? { signal } : {}) }).then((result) => result.data);
}
export function getProject(id: string, signal?: AbortSignal) { return apiRequest<Project>(`/api/backend/projects/${encodeURIComponent(id)}`, signal ? { signal } : {}).then((result) => result.data); }
export function createProject(input: ProjectInput) { return apiRequest<Project>("/api/backend/projects", { method: "POST", body: input }).then((result) => result.data); }
export function updateProject(id: string, input: Partial<Omit<ProjectInput, "clientId" | "status">>) { return apiRequest<Project>(`/api/backend/projects/${encodeURIComponent(id)}`, { method: "PATCH", body: input }).then((result) => result.data); }
export function changeProjectStatus(id: string, status: ProjectStatus) { return apiRequest<Project>(`/api/backend/projects/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } }).then((result) => result.data); }
export function setProjectArchived(id: string, archived: boolean) { return apiRequest<Project>(`/api/backend/projects/${encodeURIComponent(id)}/${archived ? "archive" : "restore"}`, { method: "PATCH" }).then((result) => result.data); }

export function listMilestones(projectId: string, signal?: AbortSignal) { return apiRequest<Milestone[]>(`/api/backend/projects/${encodeURIComponent(projectId)}/milestones`, signal ? { signal } : {}).then((result) => result.data); }
export function createMilestone(projectId: string, input: { title: string; description?: string; dueDate?: string }) { return apiRequest<Milestone>(`/api/backend/projects/${encodeURIComponent(projectId)}/milestones`, { method: "POST", body: input }).then((result) => result.data); }
export function updateMilestone(projectId: string, milestoneId: string, input: Partial<{ title: string; description: string; dueDate: string; status: MilestoneStatus }>) { return apiRequest<Milestone>(`/api/backend/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}`, { method: "PATCH", body: input }).then((result) => result.data); }
export function completeMilestone(projectId: string, milestoneId: string) { return apiRequest<Milestone>(`/api/backend/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}/complete`, { method: "PATCH" }).then((result) => result.data); }
export function deleteMilestone(projectId: string, milestoneId: string) { return apiRequest<{ id: string }>(`/api/backend/projects/${encodeURIComponent(projectId)}/milestones/${encodeURIComponent(milestoneId)}`, { method: "DELETE" }).then((result) => result.data); }

export function listProjectMembers(projectId: string, signal?: AbortSignal) { return apiRequest<ProjectMember[]>(`/api/backend/projects/${encodeURIComponent(projectId)}/members`, signal ? { signal } : {}).then((result) => result.data); }
export function addProjectMember(projectId: string, userId: string, role: ProjectRole) { return apiRequest(`/api/backend/projects/${encodeURIComponent(projectId)}/members`, { method: "POST", body: { userId, role } }).then((result) => result.data); }
export function updateProjectMemberRole(projectId: string, userId: string, role: ProjectRole) { return apiRequest(`/api/backend/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`, { method: "PATCH", body: { role } }).then((result) => result.data); }
export function removeProjectMember(projectId: string, userId: string) { return apiRequest(`/api/backend/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(userId)}`, { method: "DELETE" }).then((result) => result.data); }

export function listMeetings(view: MeetingView = "all", filters: { clientId?: string; projectId?: string } = {}, signal?: AbortSignal) { return apiRequest<Meeting[]>("/api/backend/meetings", { query: { view, ...filters }, ...(signal ? { signal } : {}) }).then((result) => result.data); }
export function createMeeting(input: MeetingInput) { return apiRequest<Meeting>("/api/backend/meetings", { method: "POST", body: input }).then((result) => result.data); }
export function updateMeeting(id: string, input: Partial<MeetingInput>) { return apiRequest<Meeting>(`/api/backend/meetings/${encodeURIComponent(id)}`, { method: "PATCH", body: input }).then((result) => result.data); }
export function cancelMeeting(id: string) { return apiRequest<Meeting>(`/api/backend/meetings/${encodeURIComponent(id)}/cancel`, { method: "PATCH" }).then((result) => result.data); }

export function listUsers(page = 1, pageSize = 100, signal?: AbortSignal) { return apiRequest<TeamUser[]>("/api/backend/users", { query: { page, pageSize }, ...(signal ? { signal } : {}) }); }
// Inviting no longer creates the user directly: it records a pending invitation and
// emails a link, and the account is created when the invitee accepts it.
export function inviteUser(input: { name: string; email: string; role: "ADMIN" | "MEMBER" }) { return apiRequest<TeamInvitation>("/api/backend/users/invitations", { method: "POST", body: input }).then((result) => result.data); }
export function listInvitations(status?: InvitationStatus, page = 1, pageSize = 100, signal?: AbortSignal) { return apiRequest<TeamInvitation[]>("/api/backend/users/invitations", { query: { page, pageSize, ...(status ? { status } : {}) }, ...(signal ? { signal } : {}) }); }
export function resendInvitation(id: string) { return apiRequest<TeamInvitation>(`/api/backend/users/invitations/${encodeURIComponent(id)}/resend`, { method: "POST" }).then((result) => result.data); }
export function revokeInvitation(id: string) { return apiRequest<TeamInvitation>(`/api/backend/users/invitations/${encodeURIComponent(id)}/revoke`, { method: "PATCH" }).then((result) => result.data); }
export function updateUser(id: string, input: Partial<{ name: string; role: "ADMIN" | "MEMBER" }>) { return apiRequest<TeamUser>(`/api/backend/users/${encodeURIComponent(id)}`, { method: "PATCH", body: input }).then((result) => result.data); }
export function setUserActive(id: string, active: boolean) { return apiRequest<TeamUser>(`/api/backend/users/${encodeURIComponent(id)}/${active ? "activate" : "deactivate"}`, { method: "PATCH" }).then((result) => result.data); }

export function listClientOptions(signal?: AbortSignal) { return apiRequest<ClientOption[]>("/api/backend/clients", { query: { page: 1, pageSize: 100 }, ...(signal ? { signal } : {}) }).then((result) => result.data); }
