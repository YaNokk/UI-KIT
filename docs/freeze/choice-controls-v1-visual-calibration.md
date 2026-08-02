# Choice Controls v1 — visual calibration report

Status: Choice Controls v1 visual freeze declared.

## Verification identity

- Visual calibration implementation commit: `9656c00d0c4c28311dc6e909d9ed6fb1a94c9266`.
- CI gate implementation commit: `db9594111aa721bd983649c7f922b106652693a6`.
- Documentation baseline commit: `0332741811d848153c096d868c708ddb56c6c6e0`.
- Local verification timestamp: `2026-08-02T11:53:16+02:00`.
- Workflow / job: `UI Tests` / `storybook-browser`.
- Verified CI commit: `0332741811d848153c096d868c708ddb56c6c6e0`.
- Workflow run ID / URL: `30742854925` / `https://github.com/YaNokk/UI-KIT/actions/runs/30742854925`.
- Job status: `success`.
- Artifact: `choice-controls-storybook-0332741811d848153c096d868c708ddb56c6c6e0`; upload `success`; artifact ID `8831891949`.
- Artifact retention: 30 days.
- CI state-capture result: `chromium-state-capture`, 2/2 passed.
- Previous visual-calibration baseline: `1e2ed0c768bcfa9bf36c4ca639988fc9e211904e`.

The v1.4 pass changes documentation only. It does not change public props, native input semantics, component outer geometry, typography values, motion values, Select, MultiSelect or FieldShell contracts. This declaration commit follows the verified `0332741` tree and states that relationship explicitly rather than claiming self-verification.

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

The canonical focused Choice Controls verification is:

```text
npm run choice-controls:verify
```

It covers static collection protection, the 24-execution focused Storybook report, runtime identity verification, 14 negative execution fixtures and the two real Chromium hover/active captures.

The full repository freeze gate is the focused verification plus full Storybook, build, package, consumer, tree-shaking and governance checks. The `UI Tests / storybook-browser` workflow ran every layer successfully; artifact upload alone was not treated as sufficient evidence.

## Local gates

The local pre-CI gate set first passed on CI gate implementation commit `db9594111aa721bd983649c7f922b106652693a6`; the later full CI run independently verified documentation baseline and runtime tree `0332741811d848153c096d868c708ddb56c6c6e0`:

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

## CI evidence

The verified workflow checked out exact commit `0332741811d848153c096d868c708ddb56c6c6e0` and completed the whole `storybook-browser` job successfully.

| Evidence | Result |
| --- | --- |
| Workflow run | `UI Tests` run `30742854925` — `success` |
| Job | `storybook-browser` / job `91483261830` — `success` |
| Canonical focused verification | 24/24 Storybook executions; 0 skipped; 0 failed |
| Negative fixtures | 14/14 passed |
| State capture | `chromium-state-capture`; real hover/active; 2/2 passed |
| Full Storybook | 24 files; 270/270 passed |
| Build | Storybook static, tokens, UI and retail UI passed |
| Package | `pack:check` passed for three tarballs |
| Consumer | clean fixture typecheck and production build passed |
| Tree-shaking | static and dynamic subpath isolation passed |
| Governance | tokens, typecheck, unit tests, lint, typography and motion passed |
| Artifact | `choice-controls-storybook-0332741811d848153c096d868c708ddb56c6c6e0` uploaded successfully |
| Artifact retention | 30 days; expires 2026-09-01 10:01:20 UTC |

Run: `https://github.com/YaNokk/UI-KIT/actions/runs/30742854925`

Artifact: `https://github.com/YaNokk/UI-KIT/actions/runs/30742854925/artifacts/8831891949`

Existing non-fatal CI warnings match the local warning classes and additionally include GitHub's deprecation notice for Node.js 20 action runtimes being forced to Node.js 24. Project setup used Node.js 22.23.1. None failed a gate.

## Freeze declaration

All visual matrix rows are Approved. The exact verified tree passed real state capture, full Storybook, build, package, consumer, tree-shaking and governance gates, and its SHA-qualified runtime artifact is available. Choice Controls v1 visual freeze is declared for:

- `ChoiceControlLayout v1`;
- `ChoiceControlContent v1`;
- `ChoiceIndicator v1`;
- `Checkbox v1`;
- `CheckboxGroup v1`;
- `Radio v1`;
- `RadioGroup v1`;
- `Switch v1`.

Frozen contracts are public APIs; native input semantics; `sm`/`md` outer geometry; Checkbox checkmark and indeterminate geometry; Radio ring/dot geometry; Switch track/thumb geometry and LTR/RTL travel; runtime-brand selected states; `control.selectionIndicator` semantics; hover and active mappings; focus-visible, disabled and error ownership; forced-colors behavior; responsive wrapping; 100%/125% geometry; and light/dark behavior. Any future change requires a versioned corrective pass.

The freeze explicitly excludes MultiSelect ChoiceIndicator integration, InternationalPhoneInput, SwitchGroup, card choices, segmented controls, new sizes, new variants and a future theme redesign. These remain separate versioned work.
