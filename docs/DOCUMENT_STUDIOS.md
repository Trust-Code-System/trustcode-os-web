# Document studios

The Documents module contains Invoice Studio (`/documents/invoices`) and Contract Studio (`/documents/contracts`). Both use TrustCode OS sign-in. Contract Studio supports service agreements and mutual NDAs. The existing branded editors, responsive layouts, animated controls, original logo and exports are preserved.

## Access and storage

Every editor HTML request and template download is checked against the existing API's `/auth/me` endpoint with the server-held bearer cookie. Expired access tokens use the existing refresh flow. ADMIN and MEMBER are accepted staff roles. A display cookie alone never authorizes a download. The private asset route uses an exact filename allowlist, private/no-store caching and same-origin framing. Assets live outside `public/` and are included in the server function trace.

Entries remain in the current tab. Users should save JSON to resume later or export a document to send separately. These editors do not add server-side client document storage, email delivery, e-signatures or new backend APIs. Existing JSON files can still be loaded. Do not commit customer documents or environment credentials.

## Editing and rebuilding

Canonical editor sources are in `studios/invoice`, `studios/contracts`, and `studios/shared`. The checked-in HTML bundles and seven blank PDF/Word/Excel templates live in `studio-assets/`. A normal Next build uses these assets directly.

After changing editor sources:

```sh
npm ci --ignore-scripts --prefix studios/contracts
pnpm build:studios
pnpm lint
pnpm typecheck
pnpm test
pnpm exec playwright test e2e/studios.spec.ts --project=chromium
pnpm build
```

Commit the rebuilt `studio-assets/*/index.html` alongside source changes. The standalone React island build is isolated from the OS application dependencies. Its registry provenance and license notices remain in `studios/contracts/reactbits` and the generated bundle; JSZip's MIT license is in `studios/shared`.

The Playwright configuration uses the repository's explicit development mock mode and synthetic accounts. Production studio routes fail closed if mock mode is accidentally enabled. Unit tests cover bearer validation, refresh, role checks, file allowlists and cache headers. Browser tests cover anonymous access, phone/desktop iframe layout and all seven template downloads.

## Deployment

Deploy this repository to the existing `trustcode-os-web` Vercel project with its existing production API environment. Do not deploy `studios/` or `studio-assets/` as public static sites. The previous invoice and contract domains should redirect to their Documents pages. Protect old generated deployment URLs with Vercel Standard Protection so they cannot expose historical public copies.
