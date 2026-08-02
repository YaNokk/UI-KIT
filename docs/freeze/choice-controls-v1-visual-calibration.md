# Choice Controls v1 — visual calibration report

Status: v1.1 corrective geometry completed; full visual freeze is not declared.

## Verification basis

- Base and reproducible-report commit: `7601899074256540686688650a43683da713c501`.
- Verification candidate: the v1.1 working-tree changes documented below, applied over that commit.
- No public props, native input semantics, component sizes, typography values, motion values, Select, MultiSelect or FieldShell contracts were changed.

## Designer reference reviewed

- MP UI KIT public `Form Controls` composition at `https://mp-ui-kit.vercel.app/`.
- Read-only source composition in `references/raw/mp-ui-kit/App.tsx`, including Checkbox, Radio and Toggle examples.
- The reference uses compact 18 px choice indicators and a 40×24 px toggle. The project semantic size contract remains authoritative, so the visual character was normalized to the existing `sm`/`md` sizes instead of copying raw dimensions.

## Geometry decisions

| Area | Frozen decision | Result |
| --- | --- | --- |
| Checkbox outer box | `sm` 20×20, `md` 24×24 | Approved |
| Checkbox checkmark | `sm` 12×12 (`size.icon.sm - space-1`), `md` 16×16 (`size.icon.sm`) | Corrected and asserted |
| Checkbox indeterminate | Same 12/16 icon box; minus visible, check hidden, centered and contained | Corrected and asserted |
| Radio outer ring | `sm` 20×20, `md` 24×24 | Approved |
| Radio dot | Exact private geometry: `sm` 8×8, `md` 10×10 | Corrected and asserted |
| Switch track | `sm` 32×20, `md` 40×24 | Approved |
| Switch thumb inset/travel | Exact 2 px physical edge inset at both endpoints; travel equals inner width minus thumb width | Corrected and asserted |
| LTR/RTL Switch | `sm` and `md`, off/on, symmetric logical start/end travel | Corrected and asserted |
| Single-line content | Label-only rows center against the indicator; label+description remains first-line aligned | Corrected and visually approved |
| Responsive fixture | 320/390/768/1440 fixtures use zero-min grid tracks and do not force page overflow | Corrected and inspected |

Radio dot sizes are private component geometry custom properties, not public DTCG tokens. No public token was added. Existing semantic roles continue to own background, border, foreground, focus, disabled, error and motion behavior.

## CSS changes

- Replaced percentage Radio dot sizing with private exact `8px`/`10px` geometry.
- Kept Checkbox mark sizes on canonical icon/spacing roles and froze their resolved dimensions in browser assertions.
- Preserved exact token-derived Switch travel and 2 px inset introduced in the v1 calibration baseline.
- Preserved semantic hover/active mappings in production CSS:
  - unchecked hover → `control.borderHover`;
  - selected hover → `action.primary.backgroundHover`;
  - selected active → `action.primary.backgroundActive`;
  - checked Radio retains `control.background` as its surface.

## Storybook and browser assertions

The `Foundations/ChoiceControlsVisualCalibration` story collection contains all 17 required stories.

v1.1 added or tightened assertions for:

- Checkbox SVG resolved size, visibility, stroke presence, centering and containment;
- indeterminate check/minus visibility, size, centering and containment;
- Radio 20/24 outer geometry, exact 8/10 dot geometry, ≤0.5 px center delta and containment;
- LTR and RTL Switch `sm`/`md` off/on endpoints, exact 2 px inset and thumb containment;
- story-only probes for `control.borderHover`, `action.primary.backgroundHover` and `action.primary.backgroundActive`;
- hover color comparison only when the browser test runtime exposes a real active `:hover` pseudo-state;
- forced-colors perceivability, focus outline, 125% deterministic geometry and narrow-width no-clipping.

The synthetic Storybook `userEvent.hover` in the current Vitest browser runtime dispatches pointer events but does not retain CSS `:hover`. The assertions therefore do not manufacture a production test selector and do not claim a hover result when the pseudo-state is absent. Active pointer-down timing is likewise kept as manual approval rather than a flaky automated assertion.

## Environment results

- Light mode: approved for geometry, neutral/selected/disabled/error distinction and focus optics.
- Dark mode: approved by manual Storybook inspection; unchecked borders, selected state, disabled state, error and descriptions remain distinguishable.
- Forced colors: approved by the `chromium-forced-colors` project; borders remain non-zero, marks/dot/thumb are present and `forced-color-adjust` ownership is retained.
- Reduced motion: approved by the `chromium-reduced-motion` project; geometry is unchanged and component transitions follow the canonical reduction rule.
- 125% deterministic CSS zoom: approved; expected outer sizes resolve to 25/30 px for Checkbox/Radio and 40×25/50×30 px for Switch with no clipping.
- LTR/RTL: approved for exact `sm` and `md` Switch endpoint geometry.
- Responsive: approved at 320, 390, 768 and 1440 px; long labels/descriptions wrap without control-level overflow.
- System UI fallback: approved in the label-alignment fixture.

## Runtime-brand result

| Brand fixture | Checkbox | Radio | Switch | Status |
| --- | --- | --- | --- | --- |
| Default blue | Approved | Approved | Approved | Approved |
| Bright yellow | Approved | Visible but low surface contrast | Approved | Pending contrast policy |
| Light green | Approved | Low ring/dot contrast on white | Approved | Needs correction outside v1.1 geometry scope |
| Dark navy | Approved | Approved | Approved | Approved |
| Purple | Approved | Approved | Approved | Approved |

Checkbox and Switch can use `action.primary.foreground` inside a filled brand surface, so the runtime resolver supplies an appropriate black/white foreground. Checked Radio intentionally keeps a neutral surface while both ring and dot map to `action.primary.background`; very light accent backgrounds therefore have lower non-text contrast against white. Changing Radio to `brand.accentContent` or another semantic role would change the frozen state mapping and requires a separate token/contrast governance decision.

## Manual approval matrix

| Matrix area | Status | Notes |
| --- | --- | --- |
| `sm`/`md` outer geometry | Approved | Automated exact rectangles |
| Checkbox unchecked/checked | Approved | Mark bounds and center frozen |
| Checkbox indeterminate | Approved | Visibility and containment frozen |
| Radio unchecked/checked | Corrected | Production and test now agree on 8/10 dots |
| Switch off/on | Corrected | Exact LTR/RTL travel frozen |
| Disabled | Approved | Neutral semantics preserved |
| Invalid | Approved | Standalone border and group ownership preserved |
| Focus-visible | Approved | Canonical outline present; no label overlap seen |
| Hover | Pending manual pseudo-state capture | Token mapping exists; current synthetic runner cannot retain `:hover` |
| Active | Pending manual pointer-down capture | Kept manual to avoid timing-only regression |
| Light | Approved with runtime-brand exception | See brand matrix |
| Dark | Approved | Manual Storybook inspection |
| Runtime brands | Partially approved | Bright yellow/light green Radio contrast needs policy decision |
| Forced colors | Approved | Automated in dedicated project |
| LTR/RTL | Approved | Automated exact endpoints |
| 100%/125% | Approved | Manual 100%, automated and manual 125% |
| 320/390/768/1440 | Approved | No horizontal clipping after fixture correction |

## Gates

All required commands passed on 2026-08-02:

- `npm run tokens:check`
- `npm run typecheck`
- `npm run test` — 41 files, 349 tests
- `npm run choice-controls:storybook:verify` — 24 executions, 0 skipped, 0 failed
- `npm run test:storybook` — 24 files, 270 tests across Chromium, forced colors and reduced motion
- `npm run build-storybook`
- `npm run build`
- `npm run pack:check`
- `npm run consumer:test`
- `npm run tree-shaking:test`
- `npm run lint`
- `npm run typography:check`
- `npm run motion:check`

## Freeze decision and known limitations

The v1.1 corrective geometry is ready for visual review without production/test mismatches. A full visual freeze is intentionally **not** declared while these items remain pending:

1. real hover and active pseudo-state capture in a runner that can retain those browser states;
2. a semantic-token decision for checked Radio contrast with bright yellow and light-green runtime brands.

Consequently `ChoiceControlLayout`, `ChoiceControlContent`, `ChoiceIndicator`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` and `Switch` retain their verified behavioral baseline, but their final visual-freeze declaration remains pending a versioned approval pass.
