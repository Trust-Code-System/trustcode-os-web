# Workspace navigation and visual refinement

The desktop sidebar expands into a labelled 256px navigation and folds away from its right edge. The toolbar toggle remains available when navigation is folded. Click the toggle, use Ctrl/Cmd+B outside an editable field, or drag the sidebar seam. Mobile navigation uses the existing Radix drawer with softer entry/exit motion.

One independently authored analytic spring drives the hinge, bounded navigation blur and space released to the workspace. It retains velocity on reversal, stops when settled and honors reduced motion, including changes during a transition. The spring uses unit mass, stiffness 230 and damping 27. Space stays reserved during the initial lift before releasing smoothly. Hidden navigation is inert, and focus moves to the toolbar toggle before closing.

The sidebar's grouping, wider spacing, quieter surfaces and project rows draw on user-supplied dashboard references. The original TrustCode identity and existing backend operations remain in place. Dashboard counts and the completed-project ring derive from the existing clients/projects/meetings API responses. No trends, revenue, task APIs or demo customer data are added to production. Document studio links make full navigations because their authenticated routes serve standalone HTML workspaces.

Workspace search filters permitted page links, supports arrow-key selection and uses Radix modal focus management. Ctrl/Cmd+B remains available to the sidebar while editable fields keep their own shortcuts.

## Reference and source selection

The user selected https://shaduocn.vercel.app/ on 25 October 2026. The live demo was inspected in Edge, including the quarter, half and fully folded states. It demonstrates a hinged fold, blur and a settling spring. No public repository or reuse license surfaced in the page or targeted GitHub searches. Its source bundles have not been copied into this repository.

OmniUI Forge candidates considered:

| Candidate | Evidence | Decision |
| --- | --- | --- |
| Existing React/Radix foundation | Already installed, shared role filtering, tooltips and focus-managed mobile dialog | Retained; no new runtime dependency |
| shadcn sidebar candidate `shadcn:d7cd8dfba39f9ff8` | Catalog revision `ba1503c64472b82256d9de95e2e62c5901a38e8b`, repository MIT metadata; scoped file not licensed for this task by metadata alone | No component imported; replacing the existing foundation adds unnecessary integration work |
| Motion spring example `motion:a44805487f603d8d` | Catalog revision `a03a6daf30d6ff63286e716a0f612d3b3a493802`, repository MIT metadata | No dependency added; this bounded interaction uses a small analytic solver |

## Verification

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm exec playwright test e2e/sidebar-motion.spec.ts e2e/shell-scroll.spec.ts e2e/studios.spec.ts --project=chromium`, and `pnpm build`.

The sidebar suite records a real browser fold trajectory and checks focus on collapse, rapid reversal, dragging, reduced motion, forced colors, automated accessibility, phone/tablet/desktop overflow and mobile drawer dismissal. The existing scroll and document suites check that the shell and private exports still work. Screenshots and trajectory JSON are written to ignored Playwright output directories. Browser emulation is not a physical-device performance benchmark or a complete accessibility conformance audit.
