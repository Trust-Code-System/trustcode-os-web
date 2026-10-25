# TrustCode Contract Studio

Integrated into TrustCode OS at `/documents/contracts`. See `../../docs/DOCUMENT_STUDIOS.md` for deployment and access details.

The core contract form, data model, preview, JSON and Word export remain plain JavaScript. React islands enhance the agreement/view switches, notifications and completion mark. Dropdown motion keeps the existing accessible listbox and viewport placement logic.

## Build

From the repository root, run `npm ci --ignore-scripts --prefix studios/contracts` and `pnpm build:studios`. This builds the React islands and embeds all runtime assets and licence notices in `studio-assets/contract/index.html`. No external CDN is needed by the application.

Deploy the OS repository to its existing Vercel project. The HTML and blank PDF/DOCX templates are served exclusively through authenticated `/api/studios/contract/` routes; they must remain outside `public/`.

## React Bits adaptations

Source: https://github.com/DavidHDev/react-bits, revision `e12c22192ac7b4b452c5e2feb9b586d74765d696`. See `reactbits/provenance.json` for registry source hashes and `reactbits/LICENSE.md` for the MIT plus Commons Clause terms. Component source is used as part of this application, not offered as a component library or component pack.

- Rubber Segment: TrustCode tokens, 44 px controls, keyboard/assistive click activation, integration with existing type/view actions, and touch drag disabled to preserve page scrolling.
- Swipe Toast: TrustCode colors, a 44 px close button, matching inline SVG instead of adding an icon library, paused countdown on hover/focus, swipe/keyboard dismissal and focus restoration.
- Status Mark: determinate progress from actual remaining fields and a check when those fields are filled. It does not imply legal approval or completed signatures.
- Glide Select: moving-highlight interaction adapted to the existing listbox; existing keyboard selection and mobile popup positioning remain in place.

The application honors reduced motion and forced colors. Runtime React, React DOM and Motion licences are included with the generated bundle. Dependency versions are locked in package-lock.json.

## Verification

Run `pnpm test` and `pnpm exec playwright test e2e/studios.spec.ts --project=chromium` from the repository root, then `pnpm build`. Existing blank document templates are preserved independently of the editor build.
