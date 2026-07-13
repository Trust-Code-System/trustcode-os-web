# Design System Foundation

The current appearance is intentionally neutral and temporary. Google Stitch direction can replace token values without changing feature logic or component structure.

## Token model

`src/styles/tokens.css` defines semantic color, surface, border, focus, overlay, shadow, radius, spacing, and typography variables for light and dark schemes. Components consume semantic variables, not raw color literals.

Dark mode is selected by `.dark` and also has a system-preference fallback when no explicit mode is present.

Automated WCAG A/AA scanning is part of Playwright. The initial scan identified a 4.27:1 muted-text contrast ratio; the semantic token was corrected globally and the subsequent login/Client CRM scan passed with zero violations.

## Primitive principles

- Native semantic elements first; Radix for interaction patterns that require robust focus/keyboard management.
- Every interactive control has a visible focus-visible state and disabled treatment.
- Loading controls retain accessible names and prevent duplicate submission.
- Form errors are text-associated; status never relies on color alone.
- Tables have a mobile card alternative where wide layouts would overflow.
- Motion is subtle and removed under `prefers-reduced-motion`.

## Reskin contract

Change visual identity in this order: token values, typography variables, primitive variants, then composed layouts. Business logic, schemas, feature hooks, API adapters, and routes should not change for a visual refresh.
