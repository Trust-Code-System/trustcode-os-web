# Stitch UI Implementation Plan

## Source of truth

- Stitch project: `2337476445538277491` (`TrustCode OS Dashboard`)
- Retrieved screens: Design System, Dashboard, Clients, Client Profile, Project Workspace, Projects, Meetings, Documents, Team, Activity, Login, Settings, and the supplied image asset.
- Brand reference: `https://trustcodesystem.tech/`
- Local reference files: `.stitch-reference/` (ignored; screenshots and generated HTML only)

## Integration rules

1. Preserve the existing Next.js App Router, TypeScript, BFF proxy, HTTP-only session cookies, protected routing, TanStack Query, Zod validation, error normalisation, MSW, and Client CRM behavior.
2. Translate Stitch composition into the existing component architecture. Generated HTML is a visual reference, not production source.
3. Use Stitch for information architecture, density, responsive behavior, component geometry, and screen composition.
4. Use the production TrustCode site for brand assets and identity tokens. The application remains an operational product, so the marketing site's display serif is not used for dense UI headings.
5. Deferred modules are presentation-only typed fixtures. Controls that require unsupported APIs must be disabled or clearly non-committal; no successful backend behavior is simulated.

## Audited design language

- Desktop reference canvas: 1280 logical pixels in project layout; exported screens are 2560px at 2x density.
- Shell: narrow dark navy rail, white utility header, pale application canvas, persistent desktop navigation, drawer navigation below the large breakpoint.
- Layout: 24px outer padding, 16px module gutters, modular bordered surfaces, dense tables, responsive stacking.
- Shape: 8px controls, 12–16px modules, pills for statuses.
- Typography: Inter for UI; JetBrains Mono for IDs, technical labels, and timestamps.
- Elevation: borders and tonal layering first; subtle shadows only for overlays and interactive emphasis.
- Brand tokens verified from the live site: ink `#10151f`, paper `#f7f8f6`, surface `#ffffff`, blueprint `#1b3fae`, teal `#0e7490`, verified `#0e9f6e`, slate `#5b6472`, grid `#e3e7e2`.
- Downloaded approved logos: `public/brand/trustcode-systems-logo.png` and `public/brand/trustcode-system-logo-dark.png`.

## Component plan

- Foundation: revise semantic tokens, font loading, page canvas, focus states, density, and responsive breakpoints.
- Brand: reusable `BrandLogo` with intrinsic dimensions through `next/image`.
- Shell: branded rail, active indicator, utility header, command search, notifications, account menu, mobile drawer.
- Shared primitives: compact buttons/fields, page and section headers, badges, avatars, tables, metrics, progress, tabs, filters, empty/loading/error states.
- Screen patterns: `DataPanel`, `StatCard`, `ProgressBar`, `FixtureNotice`, compact responsive table/card fallbacks.

## Route implementation map

| Route | Stitch reference | Data strategy | Behavior |
| --- | --- | --- | --- |
| `/login` | Login | Existing auth API | Fully functional |
| `/dashboard` | Dashboard | Typed presentation fixture | Read-only overview |
| `/clients` | Clients | Existing Client API/MSW | Fully functional list/search/filter/pagination |
| `/clients/[clientId]` | Client Profile | Existing Client API/MSW | Fully functional detail/tabs |
| `/projects` | Projects | Typed presentation fixture | Read-only layout |
| `/projects/[projectId]` | Project Workspace | Typed presentation fixture | Read-only layout |
| `/meetings` | Meetings | Typed presentation fixture | Read-only layout |
| `/documents` | Documents | Typed presentation fixture | Read-only layout; upload unavailable |
| `/team` | Team | Typed presentation fixture + existing role gate | Read-only layout |
| `/activity` | Activity | Typed presentation fixture | Read-only feed |
| `/settings` | Settings | Existing session identity + typed fields | Read-only profile presentation |
| `/settings/security` | Settings | Existing password API | Functional security flow retained |

## Responsive acceptance

- 320–479px: drawer navigation; single-column modules; tables become stacked records; no horizontal page overflow.
- 480–767px: compact single/two-column composition where content permits.
- 768–1023px: tablet grid, scrollable dense tables, compact header actions.
- 1024–1439px: persistent rail, multi-column modules.
- 1440px+: centered content with bounded maximum width.

## Verification gates

- ESLint with zero warnings
- TypeScript `--noEmit`
- Vitest suite
- Next production build
- Playwright functional, accessibility, and responsive suites
- Desktop/tablet/mobile route screenshots compared with Stitch references
- Keyboard focus, landmarks, form labels, contrast, overflow, and reduced-motion checks

## Known source discrepancies

- Stitch uses generated placeholder people and operational data. Production code uses typed fixtures only where the backend contract is absent.
- Stitch's primary blue (`#0052cc`) differs from the verified production blueprint blue (`#1b3fae`); production branding takes precedence.
- Stitch specifies Inter for product UI while the marketing site uses Switzer and Source Serif 4. Product UI retains Inter for dense operational legibility and uses JetBrains Mono for technical labels.
- Only desktop screens were supplied. Tablet and mobile layouts are responsive adaptations derived from the approved system, not separate Stitch artboards.
