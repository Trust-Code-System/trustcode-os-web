import { http, HttpResponse } from "msw";
import { avatarMaxBytes } from "@/lib/config/env";
import { clients } from "./data/clients";

let profileAvatarUrl: string | null = null;
const acceptedAvatarTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const delayed = async () => new Promise((resolve) => setTimeout(resolve, process.env.NODE_ENV === "test" ? 0 : 200));
const success = <T>(data: T, meta?: { page: number; pageSize: number; total: number }) => HttpResponse.json({ ok: true, data, ...(meta ? { meta } : {}) });

const projects = clients.flatMap((client) => client.projects.map((project) => ({ ...project, description: null, clientId: client.id, startDate: null, completedAt: null, archivedAt: null, createdAt: client.createdAt })));
const meetings = clients.flatMap((client) => client.meetings.map((meeting) => ({ ...meeting, agenda: null, meetingUrl: null, clientId: client.id, projectId: client.projects[0]?.id ?? null, createdById: "user_admin", createdAt: client.createdAt })));
const users = [
  { id: "user_admin", email: "admin@trustcode.test", name: "Ghost", role: "ADMIN", isActive: true, lastLoginAt: "2026-07-20T10:00:00.000Z", emailVerifiedAt: "2026-05-01T09:00:00.000Z", createdAt: "2026-05-01T09:00:00.000Z" },
  { id: "user_member", email: "member@trustcode.test", name: "David Mensah", role: "MEMBER", isActive: true, lastLoginAt: null, emailVerifiedAt: null, createdAt: "2026-05-02T09:00:00.000Z" },
];
const invitations = [
  { id: "invite_1", email: "newhire@trustcode.test", name: "New Hire", role: "MEMBER", status: "PENDING", emailStatus: "DELIVERED", emailAttemptCount: 1, expiresAt: "2026-08-02T09:00:00.000Z", acceptedAt: null, revokedAt: null, createdAt: "2026-07-30T09:00:00.000Z" },
];

export const handlers = [
  http.get("*/api/backend/profile/avatar", () => success({ avatarUrl: profileAvatarUrl })),
  http.post("*/api/backend/profile/avatar", async ({ request }) => { const form = await request.formData(); const photo = form.get("photo"); if (!(photo instanceof File)) return HttpResponse.json({ ok: false, error: { code: "PHOTO_REQUIRED", message: "Choose a photo to upload." } }, { status: 422 }); if (!acceptedAvatarTypes.has(photo.type)) return HttpResponse.json({ ok: false, error: { code: "INVALID_PHOTO_TYPE", message: "Use a JPEG, PNG, or WebP image." } }, { status: 422 }); if (photo.size > avatarMaxBytes) return HttpResponse.json({ ok: false, error: { code: "PHOTO_TOO_LARGE", message: "The profile photo is too large." } }, { status: 413 }); const bytes = new Uint8Array(await photo.arrayBuffer()); let binary = ""; for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192)); profileAvatarUrl = `data:${photo.type};base64,${btoa(binary)}`; return success({ avatarUrl: profileAvatarUrl }); }),
  http.delete("*/api/backend/profile/avatar", () => { profileAvatarUrl = null; return success({ avatarUrl: null }); }),

  http.get("*/api/backend/clients", async ({ request }) => { await delayed(); const url = new URL(request.url); const status = url.searchParams.get("status"); const stage = url.searchParams.get("stage"); const page = Math.max(1, Number(url.searchParams.get("page") ?? 1)); const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? 20))); const rows = clients.filter((client) => (!status || client.status === status) && (!stage || client.stage === stage)); return success(rows.slice((page - 1) * pageSize, page * pageSize).map(baseClient), { page, pageSize, total: rows.length }); }),
  http.get("*/api/backend/clients/:clientId/contacts", ({ params }) => success(clients.find((client) => client.id === params.clientId)?.contacts ?? [])),
  http.get("*/api/backend/clients/:clientId/activity", ({ params }) => { const data = clients.find((client) => client.id === params.clientId)?.activity ?? []; return success(data, { page: 1, pageSize: 100, total: data.length }); }),
  http.get("*/api/backend/clients/:clientId", ({ params }) => { const client = clients.find((item) => item.id === params.clientId); return client ? success(baseClient(client)) : HttpResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Client not found." } }, { status: 404 }); }),

  http.get("*/api/backend/projects", ({ request }) => { const url = new URL(request.url); const clientId = url.searchParams.get("clientId"); const status = url.searchParams.get("status"); const priority = url.searchParams.get("priority"); return success(projects.filter((project) => (!clientId || project.clientId === clientId) && (!status || project.status === status) && (!priority || project.priority === priority))); }),
  http.get("*/api/backend/projects/:projectId/milestones", () => success([])),
  http.get("*/api/backend/projects/:projectId/members", () => success([{ id: "member-1", projectId: "mock", userId: "user_admin", role: "OWNER", joinedAt: "2026-05-01T09:00:00.000Z", user: users[0] }])),
  http.get("*/api/backend/projects/:projectId", ({ params }) => { const project = projects.find((item) => item.id === params.projectId); return project ? success(project) : HttpResponse.json({ ok: false, error: { code: "NOT_FOUND", message: "Project not found." } }, { status: 404 }); }),
  http.get("*/api/backend/meetings", ({ request }) => { const url = new URL(request.url); const clientId = url.searchParams.get("clientId"); const projectId = url.searchParams.get("projectId"); const view = url.searchParams.get("view"); return success(meetings.filter((meeting) => (!clientId || meeting.clientId === clientId) && (!projectId || meeting.projectId === projectId) && (view !== "cancelled" || meeting.cancelledAt) && (view !== "upcoming" || (!meeting.cancelledAt && new Date(meeting.startsAt) >= new Date())))); }),
  // Registered before the generic users route so it is not shadowed by "*/api/backend/users".
  http.get("*/api/backend/users/invitations", ({ request }) => { const status = new URL(request.url).searchParams.get("status"); const rows = invitations.filter((invitation) => !status || invitation.status === status); return success(rows, { page: 1, pageSize: 100, total: rows.length }); }),
  http.post("*/api/backend/users/invitations", async ({ request }) => { const body = await request.json() as { name: string; email: string; role: string }; const invitation = { ...invitations[0]!, id: `invite_${invitations.length + 1}`, ...body, status: "PENDING", emailStatus: "SUBMITTED", emailAttemptCount: 1 }; invitations.unshift(invitation); return success(invitation); }),
  http.post("*/api/backend/users/invitations/:id/resend", ({ params }) => success({ ...invitations[0], id: String(params.id), emailStatus: "SUBMITTED", emailAttemptCount: 2 })),
  http.patch("*/api/backend/users/invitations/:id/revoke", ({ params }) => success({ ...invitations[0], id: String(params.id), status: "REVOKED", revokedAt: new Date().toISOString() })),
  http.get("*/api/backend/users", () => success(users, { page: 1, pageSize: 100, total: users.length })),
];

function baseClient(client: (typeof clients)[number]) { return { id: client.id, name: client.name, description: client.description, email: client.email, phone: client.phone, website: client.website, status: client.status, stage: client.stage, archivedAt: client.archivedAt, createdAt: client.createdAt, updatedAt: client.updatedAt }; }
