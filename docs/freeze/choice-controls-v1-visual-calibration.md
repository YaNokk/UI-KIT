# Choice Controls v1 — visual calibration report

Status: v1.3 CI visual-freeze gate implemented; CI verification pending; visual freeze is not declared.

## Verification identity

- Visual calibration implementation commit: `9656c00d0c4c28311dc6e909d9ed6fb1a94c9266`.
- Documentation baseline commit: `8330dc3fa376061420d98e5ccdda9c1d77792873`.
- CI gate implementation and locally verified runtime commit: `db9594111aa721bd983649c7f922b106652693a6`.
- Local verification timestamp: `2026-08-02T11:53:16+02:00`.
- Workflow / job: `UI Tests` / `storybook-browser`.
- Verified CI commit: pending.
- Workflow run ID / URL: pending.
- Job status: pending.
- Artifact: pending run; configured as `choice-controls-storybook-${{ github.sha }}`.
- Artifact retention: 30 days.
- CI state-capture result: pending.
- Previous visual-calibration baseline: `1e2ed0c768bcfa9bf36c4ca639988fc9e211904e`.

No public props, native input semantics, component outer geometry, typography values, motion values, Select, MultiSelect or FieldShell contracts changed in v1.2.

## Designer reference and geometry

Reviewed the MP UI KIT public `Form Controls` composition at `https://mp-ui-kit.vercel.app/` and the read-only Checkbox, Radio and Toggle composition in `references/raw/mp-ui-kit/App.tsx`.

The reference's compact visual character is normalized to project contracts:

| Area | Approved decision |
| --- | --- |
| Checkbox outer box | `sm` 20×20, `md` 24×24 |
| Checkbox checkmark | `sm` 12×12, `md` 16×16; centered and contained |
| Checkbox indeterminate | 12/16 icon box; check hidden, minus visible, centered and contained |
| Radio | outer 20/24; exact private dot 8/10; center delta ≤0.5 px |
| Switch | track 32×20 / 40×24; exact 2 px endpoint inset |
| LTR/RTL | symmetric logical Switch travel for `sm`/`md`, off/on |
| Content | label-only rows visually centered; descriptions preserve first-line alignment |
| Responsive | 320/390/768/1440 fixtures wrap without horizontal control overflow |

## Selection-indicator token decision

The missing reusable role was a brand-aware checked outline/dot/icon color that is safe against neutral control surfaces. `action.primary.background*` is designed for filled actions and guarantees foreground contrast, while `brand.accentContent` is designed for text/icons on soft accent surfaces. Neither expresses non-text contrast against `control.background`.

v1.2 introduces the resolver-owned family:

```text
brand.selectionIndicator*
→ control.selectionIndicator*
→ --ds-control-selection-indicator*
```

The resolver preserves the backend accent when it already reaches 3:1 against the mode control surface. Otherwise it moves the value toward the mode-appropriate high-contrast endpoint. Hover and active continue in that same resolver-owned direction. Components never darken backend colors locally. The role is brand- and mode-aware, not responsive, and can be reused by checked outlines, dots and icons.

Resolved fixture mapping:

| Brand | Mode | Default | Hover | Active |
| --- | --- | --- | --- | --- |
| Default blue | light | `#0080ff` | `#0076eb` | `#006cd6` |
| Bright yellow | light | `#b2910f` | `#a4850e` | `#967a0d` |
| Light green | light | `#5ca376` | `#55966d` | `#4d8963` |
| Dark navy | light | `#003366` | `#002f5e` | `#002b56` |
| Purple | light | `#7c3aed` | `#7235da` | `#6831c7` |
| Default blue | dark | `#0080ff` | `#148aff` | `#2994ff` |
| Bright yellow | dark | `#facc15` | `#fad028` | `#fbd43a` |
| Light green | dark | `#86efac` | `#90f0b3` | `#99f2b9` |
| Dark navy | dark | `#43698e` | `#527597` | `#6181a0` |
| Purple | dark | `#7c3aed` | `#864aee` | `#915af0` |

Checked Radio now maps ring/currentColor and dot to `control.selectionIndicator`; its surface remains `control.background`. Hover and active use the corresponding semantic roles.

## Contrast evidence

Resolver unit tests use the repository WCAG contrast calculation for all five brands in light and dark modes and require at least 3:1 for default, hover and active selection-indicator values.

The Storybook runtime matrix separately compares the computed Radio ring and dot with its semantic probe and checks computed contrast against the actual control surface. Browser inspection recorded:

| Brand | Light ratio | Dark ratio | Result |
| --- | ---: | ---: | --- |
| Default blue | 3.80:1 | 4.55:1 | Approved |
| Bright yellow | 3.02:1 | 11.27:1 | Approved |
| Light green | 3.02:1 | 12.30:1 | Approved |
| Dark navy | 12.61:1 | 3.00:1 | Approved |
| Purple | 5.70:1 | 3.03:1 | Approved |

## Real browser state capture

`ChoiceControlStateCapture.browser.test.tsx` runs through the Vitest Playwright provider rather than Storybook's synthetic user-event layer.

Hover capture:

- performs a page-level real hover;
- requires `owner.matches(":hover") === true`;
- compares unchecked Checkbox border with `control.borderHover`;
- compares checked Checkbox background/border with `action.primary.backgroundHover`;
- compares checked Radio ring/dot with `control.selectionIndicatorHover`;
- compares checked Switch track with `action.primary.backgroundHover`.

Active capture:

- starts a real provider click with a 600 ms pointer-down delay;
- requires `owner.matches(":active") === true` before style capture;
- reads computed Checkbox, Radio and Switch active styles before release;
- compares them with `action.primary.backgroundActive` or `control.selectionIndicatorActive` probes;
- awaits pointer release and requires `:active` to become false.

The current Vitest Playwright browser context exposes locator-level interactions but no stable direct `mouse.down()` / `mouse.up()` primitive. The test therefore keeps the verified `click({ delay: 600 })` timing window and asserts `:active` both before style capture and false after release. No production test class or synthetic pseudo-state override was added. Focused result: 1 browser file, 2 tests passed.

## Storybook and environment results

`Foundations/ChoiceControlsVisualCalibration` retains all 17 required stories and all geometry assertions. `RuntimeBrandMatrix` now covers five brands × light/dark and asserts selection-indicator equality and contrast. `ForcedColorsMatrix` verifies non-zero borders, checked Radio dot geometry, focus outline and disabled ownership without unstable system RGB assertions.

- Light and dark: Approved by automated contrast checks and visual inspection.
- Forced colors: Approved in `chromium-forced-colors`; system-color ownership remains unchanged.
- Reduced motion: Approved in `chromium-reduced-motion`; geometry is unchanged.
- 100%/125%: Approved; deterministic 125% dimensions and containment pass.
- LTR/RTL: Approved; exact Switch endpoint assertions pass.
- Responsive: Approved at 320, 390, 768 and 1440 px.
- System UI fallback: Approved in the label-alignment fixture.

## Visual approval matrix

| Matrix area | Status | Evidence |
| --- | --- | --- |
| `sm`/`md` | Approved | Exact outer/inner geometry assertions |
| Unchecked/checked | Approved | State matrices and native-state regressions |
| Indeterminate | Approved | Visibility, centering and containment assertions |
| Disabled | Approved | Neutral semantics plus forced-colors ownership |
| Invalid | Approved | Standalone border and fieldset-owned group error |
| Focus-visible | Approved | Canonical outline asserted in normal and forced colors |
| Hover | Approved | Real page-level `:hover` capture and semantic comparisons |
| Active | Approved | Real pointer-down capture before release |
| Light | Approved | Visual review and computed contrast matrix |
| Dark | Approved | Visual review and computed contrast matrix |
| Runtime brands | Approved | Five brands × two modes, minimum 3:1 |
| Forced colors | Approved | Dedicated Chromium project, stable geometry assertions |
| LTR/RTL | Approved | Exact logical Switch travel |
| 100%/125% | Approved | Visual review and deterministic zoom assertions |
| Responsive widths | Approved | 320/390/768/1440 no-clipping checks |

## Canonical Choice Controls verification

The single local and CI entry point is:

```text
npm run choice-controls:verify
```

It covers static collection protection, the 24-execution focused Storybook report, runtime identity verification, 14 negative execution fixtures and the two real Chromium hover/active captures.

The `UI Tests / storybook-browser` workflow runs this command as a required step named with `${{ github.sha }}`. It has no `continue-on-error`. The existing SHA-qualified runtime evidence upload remains after this step, while full Storybook, build and package gates remain later in the same job; artifact upload alone therefore cannot establish a successful freeze gate.

## Local gates

All required commands passed on the tree committed as `db9594111aa721bd983649c7f922b106652693a6`:

- `npm ci` — 511 packages installed, 518 audited; known deprecation and audit warnings below
- `npm run tokens:check`
- `npm run typecheck`
- `npm run test` — 41 files, 351 tests
- `npm run choice-controls:verify` — 24/24 focused executions, 14/14 negative fixtures, 2/2 `chromium-state-capture` tests
- `npm run test:storybook` — 24 files, 270 tests across Chromium, forced colors and reduced motion
- `npm run build-storybook`
- `npm run build`
- `npm run pack:check`
- `npm run consumer:test`
- `npm run tree-shaking:test`
- `npm run lint`
- `npm run typography:check`
- `npm run motion:check`

Known non-fatal warnings: npm reported deprecations for `whatwg-encoding@3.1.1` and `glob@10.5.0` plus one high-severity audit finding; jsdom reported unsupported scroll/canvas/pseudo-element capabilities; Storybook reported unmatched optional story globs, ignored dependency `use client` directives and chunks above 500 kB; the UI build retained the existing empty `modal/index` and `system-color/index` chunks.

## Freeze decision

Every visual matrix row is Approved and the implementation is locally eligible for freeze. The full visual freeze is **blocked with an explicit reason**: no successful `UI Tests / storybook-browser` run or uploaded runtime evidence artifact exists yet for CI gate commit `db9594111aa721bd983649c7f922b106652693a6`.

Until that external evidence exists, this report does not declare the final freeze for `ChoiceControlLayout`, `ChoiceControlContent`, `ChoiceIndicator`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` or `Switch`.

After the full job succeeds and the SHA-qualified artifact is available, the declaration may freeze their public APIs, native semantics, `sm`/`md` geometry, checked/indeterminate/on visuals, runtime-brand and selection-indicator mappings, hover/active/focus states, disabled behavior, error ownership, forced-colors behavior, LTR/RTL geometry and responsive wrapping. Any later change to those contracts requires a versioned corrective pass.

The candidate freeze explicitly excludes MultiSelect ChoiceIndicator integration, InternationalPhoneInput, card choices, SwitchGroup, segmented controls, new variants and new sizes.
