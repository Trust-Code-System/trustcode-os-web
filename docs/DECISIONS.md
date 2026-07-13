# Decisions

## 2026-07-13 — Separate frontend repository

The API is a standalone NestJS repository without monorepo tooling. The frontend lives in sibling `trustcode-os-web`; backend files are not reorganised.

## 2026-07-13 — Same-origin BFF for auth

Because the backend returns bearer and refresh tokens in JSON, Next.js route handlers mediate auth and hold them in HTTP-only cookies. This is safer than browser persistence and leaves room for the backend to adopt first-party cookies later.

## 2026-07-13 — MSW at the network boundary

Mock and live screens use identical feature services. Scenario behavior is selected by `NEXT_PUBLIC_MOCK_SCENARIO` in development/test only.

## 2026-07-13 — Provisional Client CRM aggregate

Client API code does not exist in the backend. The reference module uses a clearly labelled provisional adapter and mock contract; no claim is made that fields or routes are confirmed.

## 2026-07-13 — Neutral token-driven UI

This session optimises architecture, behavior, accessibility, and responsive structure. Final colors, decorative layout, charts, and brand styling wait for Google Stitch.

## 2026-07-13 — No Zustand

TanStack Query, URL state, component state, and one harmless local-storage preference cover the approved scope.
