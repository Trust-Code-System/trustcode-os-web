# TrustCode OS Web

Production-oriented frontend for the TrustCode agency operating system. It connects the approved UI to the current NestJS API for authentication, clients and contacts, projects and milestones/members, meetings, and team users. Modules that are not yet exposed by the backend show explicit unavailable states instead of fictional data.

## Requirements

- Node.js 22 or newer
- pnpm 10

## Local setup

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Live API mode is the default. Set server-only `API_BASE_URL` to the Nest API prefix (for example `http://localhost:3000/api`), set the API's `APP_URL=http://localhost:3001`, start the backend on port 3000, and run this frontend with `pnpm dev --port 3001`.

For isolated frontend development, set `NEXT_PUBLIC_USE_MOCKS=true`. Mock sign-in uses `admin@trustcode.test` or `member@trustcode.test` with password `TrustCode123!`.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm test:e2e
```

## Documentation

Start with `docs/STITCH_IMPLEMENTATION_PLAN.md`, `docs/FRONTEND_MASTER_PLAN.md`, `docs/API_CONTRACTS.md`, `docs/ARCHITECTURE.md`, and `docs/HANDOFF.md`. `docs/FRONTEND_TODO.md` is the source of truth for delivery status.
