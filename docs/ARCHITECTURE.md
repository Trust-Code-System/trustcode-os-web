# Frontend Architecture

## Runtime shape

The Next.js App Router hosts server-rendered route structure, small client interaction islands, and same-origin route handlers. TanStack Query owns server state. Feature services call the central API client. In mock mode MSW intercepts those same requests.

## Source boundaries

- `src/app`: routes, layouts, loading/error boundaries, and BFF route handlers
- `src/features`: domain-owned types, schemas, APIs, hooks, components, tests
- `src/components`: genuinely shared UI, layout, navigation, and feedback
- `src/lib`: cross-cutting API, auth, config, errors, permissions, query, utilities
- `src/mocks`: network handlers, scenario selection, and realistic data
- `src/styles`: semantic tokens and global behavior

## Authentication

The backend currently returns bearer tokens directly. The frontend route-handler layer receives them and stores access/refresh tokens as `HttpOnly`, `SameSite=Lax`, path-scoped cookies (`Secure` in production). Browser JavaScript never reads or persists them. Protected routing performs a fast cookie-presence check; authoritative hydration uses `/auth/me`. A rejected session clears private query state and redirects to login. Return paths are restricted to local absolute paths to prevent open redirects.

Mock mode uses an opaque HTTP-only mock session cookie through the same frontend auth service. It does not place tokens in local storage.

## Data flow

`page -> feature component -> query hook -> feature service -> central API client -> same-origin request -> MSW (mock) or BFF/backend (live) -> envelope adapter -> typed domain data`

## State

- TanStack Query: remote/session data
- URL search parameters: search, filters, sorting, pagination
- Component state: drawers, menus, tabs, transient UI
- Local storage: harmless shell preference only (sidebar collapsed)
- No global state library is needed in this slice

## Security

- No secret or token is exposed through `NEXT_PUBLIC_*` or local storage.
- Route handlers suppress raw upstream response bodies on unexpected failures.
- User content is rendered as text; no unsafe HTML path exists.
- Same-origin BFF cookies reduce token exposure; CSRF posture relies on `SameSite=Lax` and same-origin mutating endpoints. Add a synchronizer token if cross-site embedding or broader cookie policy is introduced.
- Frontend role checks improve UX only; backend guards remain authoritative.
- Logout clears the private query cache.
- Proxy checks are optimistic route gating, not authorisation.

## Performance and accessibility

Routes remain server components unless interaction requires a client boundary. Icons are individually imported. Skeletons reserve layout space. Primitives use semantic elements or Radix behavior, visible focus, keyboard operation, reduced-motion rules, labelled controls, and touch-sized targets.
