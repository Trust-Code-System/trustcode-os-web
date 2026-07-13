# TrustCode OS Web

Production-oriented frontend for the TrustCode agency operating system. It includes the protected auth/API/mock foundation, functional Client CRM reference module, and the approved Google Stitch visual system across the planned application routes. Modules without confirmed backend contracts are explicitly read-only typed presentation fixtures.

## Requirements

- Node.js 22 or newer
- pnpm 10

## Local setup

```bash
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Mock mode is enabled by default. Sign in with `admin@trustcode.test` or `member@trustcode.test` and password `TrustCode123!`.

For live API mode, set `NEXT_PUBLIC_USE_MOCKS=false`, set server-only `API_BASE_URL` to the Nest API prefix (for example `http://localhost:3000/api`), set the API's `APP_URL=http://localhost:3001`, and run the frontend on the non-conflicting port with `pnpm dev --port 3001`.

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
