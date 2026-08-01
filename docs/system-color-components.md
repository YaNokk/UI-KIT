# System Color Foundation v1

## Audit

| Concern | Designer reference | Core behavior | Existing DS token | Decision |
| --- | --- | --- | --- | --- |
| Closed palette | `gray`, `blue`, `green`, `amber`, `red`, `purple`, `brand` | Core Tag exposes broader visual variants, not this palette | Status tokens cover only success/warning/danger/info | Add the exact seven-value `SystemColor` union |
| Soft surfaces | Pale Tag background, tone foreground and border | Checked/hover/disabled states are relevant | Existing status roles have no hover/selected and no gray/purple | Add reusable `systemColor.*.softBackground*`, `foreground`, `border` roles |
| Marker and solid surfaces | Status points preserve exact identity; compact counters carry text | Core StatusBadge confirms multi-size compact indicators | No split marker/text-surface family | Add `markerBackground` plus `solidBackground` and `onSolid` roles |
| Runtime brand | Designer has a fixed brand swatch | Not owned by Core DS | Runtime resolver exposes mode-aware soft roles, exact `accent` and contrast-safe action pair | Marker aliases accent; Badge aliases the Primary Button action pair; no second contrast algorithm |
| Interaction | Designer removable Tag uses a small nested button | Core Tag covers pressed, disabled, clear and keyboard-native button behavior | Canonical project controls use native button semantics and focus tokens | Selectable and removable Tag are each one button; modes are mutually exclusive |
| Accessibility | Visual reference does not name icon-only remove actions | Core provides useful disabled/pressed cases but not the v1 API | WCAG baseline requires semantic HTML, focus and names | `aria-pressed`, required `removeLabel`, decorative embedded dot, labeled standalone status |

## Token admission

The missing reusable role is a bounded category/status color family with soft,
interactive, selected, border, solid and on-solid semantics. Existing `status.*`
cannot express it: it has four product meanings, lacks gray/purple/brand and has
no hover or selected roles. The new tokens therefore belong to the semantic
layer, not to individual components.

Fixed colors alias primitive palettes and remain brand-independent. Light mode
uses pale 100/200/300 surfaces; dark mode uses independently reviewed
900/800/700 surfaces. `brand` alone aliases the runtime mode-aware brand family.
Brand marker aliases `{brand.accent}` exactly. Brand solid/on-solid aliases
`{brand.actionBackground}` and `{brand.actionForeground}`, matching Primary
Button's contrast-safe pair. The roles are not responsive: component geometry and
container layout handle density without duplicating color tokens.

The added primitive palette steps only support reusable semantic states that
were missing from the current bounded palettes. Components never consume these
primitive values directly.

## Public contracts

- `StatusIndicator`: `sm | md`, decorative without `label`, labeled image with it.
- `Tag`: `sm | md`, static/selectable/removable modes, optional decorative dot.
- `Badge`: string/number content, optional numeric `max`, optional label override.
- Public subpaths: `status-indicator`, `tag`, `badge`, `system-color`.

Avatar, Checkbox, Autocomplete and MultiSelect chip replacement remain out of
scope. The components keep stable geometry across mobile, tablet and desktop;
wrapping, truncation and grouping belong to the owning layout or pattern.

## Reference provenance

Visual calibration: local MP UI KIT `Tag.tsx`, `Badge.tsx`, `App.tsx` and the
public implementation at `https://mp-ui-kit.vercel.app/`. Behavioral review:
local Core DS Tag and StatusBadge sources, stories and tests. No reference code
or raw colors are imported into production UI components.
