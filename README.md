# TrustCode OS Web

Production-oriented frontend foundation for the TrustCode agency operating system. This first implementation intentionally stops at the responsive/auth/API/mock/component foundations plus a Client CRM list and detail reference module.

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

For live API mode, set `NEXT_PUBLIC_USE_MOCKS=false` and set server-only `API_BASE_URL` to the Nest API prefix, for example `http://localhost:3000/api`.

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

Start with `docs/FRONTEND_MASTER_PLAN.md`, `docs/API_CONTRACTS.md`, `docs/ARCHITECTURE.md`, and `docs/HANDOFF.md`. `docs/FRONTEND_TODO.md` is the source of truth for delivery status.
