# Reference UI update

The dashboard and sidebar follow the Solvix screenshots supplied on 20 November 2026, retaining the original TrustCode logo and blue and white palette. The dashboard presents existing clients, project creation/completion activity, project status, client distribution and recent projects. Report period, chart interval, tooltips, search, row selection and CSV download are functional. Revenue and growth percentages have not been invented.

Settings follow the supplied workspace-settings reference with a secondary navigation rail, separated form rows, a team view using the existing users/invitations APIs and the existing appearance/security screens. Both navigation rails stay fixed while the right-hand settings content scrolls. Unsupported workspace/profile mutations remain read-only. No billing, payout or arbitrary-role backend is introduced.

Invoice and Contract Studio now render inside the persistent app shell. Their HTML and downloads retain existing server-side staff-access verification. Editors scroll within same-origin frames, keeping the sidebar and toolbar visible. Their print layouts and file exports remain owned by the editors.

Authentication follows the split composition in [Shaban's reference](https://x.com/shabanwtf/status/2011807422139306297), using original contour artwork and TrustCode branding. Contours flow gently over an 18-second loop; focus and typing introduce small reactive movements without duplicating or rendering credential values. The shared input adds subtle blue typing feedback throughout the CRM.

The animated code component follows [sucodee's reference](https://x.com/sucodeee/status/2122645442437820904) and [React Bits Code Slots](https://reactbits.dev/micro/code-slots). It uses one native input for numeric entry, paste, autofill, selection and keyboard editing. Digits animate into rounded slots; externally supplied checking/error/success states drive feedback, with a collapsing Verified pill and brief blue confetti on success. It is a reusable UI component, demonstrated at `/dev/components`. At the user's final instruction, no code-based authentication backend was added; current verification links remain in use. Preview controls explicitly disclose that no account is verified.

Existing React Bits adaptations (Glide Select, Rubber Segment, Squish Switch, Spring Check, Swipe Toast, Warm Tooltip and Status Mark) remain in use. All dropdowns in the app use custom themed controls. Native browser focus rectangles are replaced by branded surface feedback, including the document studios. System high-contrast focus indicators are retained. Reduced motion suppresses spatial animation and the auth background loop.

The source and license references for React Bits remain in `docs/reactbits-micro-interactions.md`, `docs/vendor/react-bits.LICENSE.md` and the existing public license notice.

Local browser verification uses the documented mock backend and synthetic records. Production continues to use the existing live API configuration.
