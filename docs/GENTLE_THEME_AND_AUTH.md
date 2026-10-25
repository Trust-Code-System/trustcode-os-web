# Gentle navigation, themes and account access

The user requested slower, softer motion and a curtain reveal when changing theme. These timings intentionally follow that explicit preference over the shorter defaults in the Emil design-engineering skill.

## Interaction design

- Same-origin pointer navigation uses the browser View Transition API to retain the shell and move page content in over 720ms. The previous content leaves over 300ms. New navigation interrupts the current transition. Query filters, download links, external links, hash links and the standalone document editors preserve their existing navigation behavior. Keyboard navigation retains immediate interaction; unsupported browsers use the existing page entrance. Reduced motion removes the spatial transition.
- Dropdown entrances take 560ms with a gentle custom curve and a trigger-relative origin. Values and focus remain handled by Radix.
- A theme change captures the old and new views and reveals the new theme from top to bottom over 1000ms using an inset clip path. The dropdown closes before the reveal begins. A shared coordinator prevents theme and page transitions competing. Reduced motion and unsupported browsers apply the selected theme directly.
- Light, Dark and Device are available in the toolbar and Appearance settings. The choice is saved in local storage on this browser; Device follows the OS. A script applies the choice before hydration to avoid a flash of the other theme. Storage and media listeners are removed on teardown.
- Invoice and contract chrome follows the selected theme. Document paper and print output retain their light palette.

## Greetings

`src/features/workspace/greetings.ts` contains 200 original notes, 25 for each of eight local-time periods. The dashboard shows one note at a time. It changes on a new dashboard visit or time period, with a short crossfade. The clock updates once a minute while the greeting is mounted; the interval stops on unmount. There is no external quote API, tracking request, or third-party copy. The source bank is approximately 9KB before compression.

## Authentication reference and scope

The split composition adapts shadcn's official `login-04` block to TrustCode tokens, original logo and existing forms. Registry: https://ui.shadcn.com/r/styles/new-york-v4/login-04.json. Reviewed upstream revision: `481d523374745e77d0cf9c53a4115ab5dd7c8481`, source paths `apps/v4/registry/new-york-v4/blocks/login-04/page.tsx` and `components/login-form.tsx`. The complete MIT notice is deployed at `/licenses/shadcn-ui.txt`.

The existing backend uses invitations for account creation. Sign-in, invitation activation, email verification and password recovery share the redesigned shell. The implementation retains their real API, token, verification and validation behavior. Theme controls and presentation do not add authentication providers or self-service registration.

The motion direction also draws on the locally installed Emil Kowalski design-engineering skill: purposeful movement, explicit properties, continuity, interruptible transitions, trigger origins, accessible focus and reduced motion. No paid course assets or private source were copied.

## Verification

The theme/navigation/auth browser suite inspects actual view-transition effects and their durations, verifies persistence and Device mode, exercises route interruption, checks dark contrast across portal routes, covers 320px authentication layouts, and tests white document paper in screen and print media. Existing portal, sidebar, form, scrolling, studio and private-file checks remain relevant. Browser emulation and automated accessibility checks do not establish physical-device performance or complete accessibility conformance.

Verified on 25 October 2026: lint, type checking, 35 unit tests and the production build passed. The targeted desktop/mobile browser checks passed after correcting the keyboard test to wait for Radix focus readiness; desktop-only gestures are skipped in the duplicate mobile project. Rendered screenshots were inspected for both themes and phone/desktop layouts.
