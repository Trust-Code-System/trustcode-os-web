# API Contracts

Audit source: local `trustcode-os-api` at commit `bd8fa4a` on 2026-07-13.

## Confirmed platform contract

- Base prefix: `/api`
- OpenAPI UI: `/api/docs`; export is supported with `EXPORT_OPENAPI=true`
- Success envelope: `{ ok: true, data: T, meta?: { page, pageSize, total } }`
- Error envelope: `{ ok: false, error: { code, message, fields? } }`
- CORS: configured for `APP_URL` with credentials enabled
- Validation: whitelist, reject unknown properties, transform query values
- Roles: `ADMIN | MEMBER`
- Auth transport: bearer access token; rotating refresh token is submitted in JSON

## Confirmed auth endpoints

| Method | Path | Request | Response data |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | `{ email, password }` | `{ user: { id, email, name, role }, tokens: { accessToken, refreshToken } }` |
| POST | `/api/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/api/auth/logout` | `{ refreshToken }` | `{ success: true }` |
| POST | `/api/auth/forgot-password` | `{ email }` | `{ success: true }` |
| POST | `/api/auth/reset-password` | `{ token, password }` | `{ success: true }` |
| POST | `/api/auth/change-password` | `{ currentPassword, newPassword }` | `{ success: true }` |
| GET | `/api/auth/me` | bearer token | `{ id, email, role }` |

The `me` response currently lacks `name`, while login includes it. The frontend treats name as optional and uses an email fallback.

Backend invite emails point to `/accept-invite?token=…`; the frontend reuses the confirmed reset-password token contract to set the invitee's initial password.

## Confirmed team endpoints

All `/api/users` routes are authenticated. Invite/update/activate/deactivate require `ADMIN`. List pagination supports `page` and `pageSize` only.

## Provisional Client CRM contract

No client controller, DTO, or Prisma model exists in the audited backend. The frontend therefore isolates this provisional contract in `src/features/clients` and mocks it at network level.

- `GET /api/clients?q=&status=&pipeline=&sort=&page=&pageSize=` returns the standard paginated envelope.
- `GET /api/clients/:clientId` returns the standard envelope with a client detail aggregate.
- Provisional fields: identity, organisation/contact fields, status, pipeline stage, owner, timestamps, contacts, notes, related summaries, and activity.

These endpoints and fields must be reconciled with exported OpenAPI as soon as the backend client module lands. No generated file will be hand-edited.

## Error adaptation

Backend `error.fields` maps to frontend `AppError.fieldErrors`. Unknown JSON, HTML error pages, timeouts, network failures, and aborts are converted to safe user-facing errors. Raw backend details and stack traces are never displayed.
