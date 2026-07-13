# TrustCode OS Design System

The approved Google Stitch project now supplies the product UI composition and density. The live TrustCode System site supplies the identity layer and approved logo assets.

## Token model

`src/styles/tokens.css` defines semantic color, surface, border, focus, overlay, shadow, radius, spacing, and typography variables. Components consume semantic variables, not raw color literals. The supplied Stitch screens are light-mode product screens, so this integration intentionally ships the approved light canvas rather than retaining an unapproved inferred dark theme.

Identity values verified from `trustcodesystem.tech` are ink `#10151f`, paper `#f7f8f6`, surface `#ffffff`, blueprint `#1b3fae`, teal `#0e7490`, verified `#0e9f6e`, slate `#5b6472`, and grid `#e3e7e2`. Semantic success/warning/danger text tokens are darkened where necessary to pass WCAG AA on tinted badges.

Inter is the dense product UI face and JetBrains Mono is reserved for IDs, technical labels, timestamps, and fixture provenance. Both are optimized through `next/font`.

Automated WCAG A/AA scanning is part of Playwright. It covers login, Client CRM, and every approved Stitch route. The integration corrected muted, success, warning, and danger token contrast globally.

## Primitive principles

- Native semantic elements first; Radix for interaction patterns that require robust focus/keyboard management.
- Every interactive control has a visible focus-visible state and disabled treatment.
- Loading controls retain accessible names and prevent duplicate submission.
- Form errors are text-associated; status never relies on color alone.
- Tables have a mobile card alternative where wide layouts would overflow.
- Motion is subtle and removed under `prefers-reduced-motion`.

## Source-of-truth contract

Stitch controls composition and product density; the live site controls brand identity. Generated Stitch HTML remains ignored reference material. Business logic, schemas, feature hooks, API adapters, session handling, and route protection remain independent of visual changes.
