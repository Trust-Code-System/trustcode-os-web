# API Contracts

Audit source: `Trust-Code-System/trustcode-os-api` commit `4fc7018a704af01396c9cbcf50715a6fa0584927` on 2026-07-28. The backend repository was inspected read-only.

## Platform contract

- Base prefix: `/api`
- Success: `{ ok: true, data, meta? }`
- Error: `{ ok: false, error: { code, message, fields? } }`
- Browser traffic uses the same-origin `/api/backend/*` route handler. Bearer and refresh tokens remain in HTTP-only cookies.
- A 401 from a protected backend route triggers one rotating-refresh attempt and one retry.
- Live API origin is configured with server-only `API_BASE_URL`.

## Connected modules

- Auth: login, logout, refresh, forgot/reset/change password, current user.
- Users: paginated list, invite, role update, activate/deactivate. Team administration remains admin-only in both navigation and API authorization.
- Clients: paginated list by status/stage, detail, create, edit, stage change, archive/restore.
- Client contacts: list, create, choose primary contact, delete.
- Client activity: paginated per-client timeline.
- Projects: list/filter, detail, create, priority/status change, archive/restore.
- Project milestones: list, create, status update, complete, delete.
- Project members: list, add, role update, remove.
- Meetings: list/filter, schedule, reschedule, cancel.

Client detail is composed in parallel from the client, contacts, projects, meetings, and per-client activity endpoints because the backend intentionally returns separate resources.

## Not exposed by the current backend

There is no controller/read contract yet for documents, tasks, notifications, a company-wide activity feed, dashboard analytics, profile editing, or profile photos. The frontend does not simulate those features in live mode. Dashboard counts are derived from current client, project, and upcoming-meeting reads.
