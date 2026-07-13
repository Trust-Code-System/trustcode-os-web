# TrustCode OS Frontend Master Plan

## Session boundary

This implementation stops after the production foundation and one reference module: Client CRM list and detail. Projects, tasks, meetings, documents, activity, team administration, settings workflows, notifications, and dashboard aggregation remain typed placeholders.

## Delivery phases

1. Audit the standalone NestJS API and record confirmed contracts.
2. Scaffold the standalone Next.js App Router application.
3. Establish tokens, reusable primitives, API/error/query layers, MSW, and test tooling.
4. Establish a secure BFF-shaped auth/session foundation and protected routes.
5. Build the responsive application shell and role-aware navigation.
6. Add all planned route placeholders without speculative workflows.
7. Implement Client CRM list and detail against an isolated provisional contract.
8. Run lint, typecheck, tests, production build, Playwright, and responsive/accessibility verification.

## Architectural guardrails

- Feature code owns its types, schemas, API functions, hooks, components, and tests.
- Pages compose features; they do not contain transport or domain logic.
- Browser code calls same-origin endpoints only. Backend credentials stay in HTTP-only cookies managed by route handlers.
- The global API envelope is adapted exactly once by the central client.
- MSW intercepts the same requests used in live mode.
- URL parameters own list search, filters, sort, and pagination.
- Semantic CSS variables make the temporary neutral UI replaceable.

## Definition of done

A checked item must be implemented, include appropriate loading/empty/error/success behavior, pass typecheck/lint/tests/build, and be manually verified. Provisional backend contracts remain labelled provisional even when the mock UI is complete.
