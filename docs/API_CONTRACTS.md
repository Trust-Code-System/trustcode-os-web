# API Contracts

Audit source: `Trust-Code-System/trustcode-os-api` commit `0af492cd` (merge of `feat/team-invitations`) on 2026-07-30. The backend repository was inspected read-only.

## Platform contract

- Base prefix: `/api`
- Success: `{ ok: true, data, meta? }`
- Error: `{ ok: false, error: { code, message, fields? } }`
- Browser traffic uses the same-origin `/api/backend/*` route handler. Bearer and refresh tokens remain in HTTP-only cookies.
- A 401 from a protected backend route triggers one rotating-refresh attempt and one retry.
- Live API origin is configured with server-only `API_BASE_URL`.

## Connected modules

- Auth: login, logout, refresh, forgot/reset/change password, current user, accept invitation, verify email, resend verification.
- Users: paginated list, role update, activate/deactivate. Team administration remains admin-only in both navigation and API authorization.
- Team invitations: create, paginated list by status, resend, revoke. Admin-only.
- Clients: paginated list by status/stage, detail, create, edit, stage change, archive/restore.
- Client contacts: list, create, choose primary contact, delete.
- Client activity: paginated per-client timeline.
- Projects: list/filter, detail, create, priority/status change, archive/restore.
- Project milestones: list, create, status update, complete, delete.
- Project members: list, add, role update, remove.
- Meetings: list/filter, schedule, reschedule, cancel.

## Onboarding and email verification

- Inviting a member creates a pending `TeamInvitation` and emails a link; the user account is only created when the invite is accepted. Invitations expire after 3 days and carry a delivery status (`emailStatus`, `emailAttemptCount`) reported by the Resend webhook.
- The backend emails links to `${APP_URL}/accept-invite?token=...` and `${APP_URL}/verify-email?token=...`, so `APP_URL` must be the deployed frontend origin.
- Login returns `403` with code `EMAIL_VERIFICATION_REQUIRED` for an unverified address and re-sends the verification email (5-minute cooldown). The login form surfaces this and offers a manual resend.
- Unauthenticated auth calls (`accept-invite`, `verify-email`, `resend-verification`, forgot/reset password) go through `/api/session/*`, not `/api/backend/*`, which requires a session cookie.

Client detail is composed in parallel from the client, contacts, projects, meetings, and per-client activity endpoints because the backend intentionally returns separate resources.

## Not exposed by the current backend

There is no controller/read contract yet for documents, tasks, notifications, a company-wide activity feed, dashboard analytics, profile editing, or profile photos. The frontend does not simulate those features in live mode. Dashboard counts are derived from current client, project, and upcoming-meeting reads.
