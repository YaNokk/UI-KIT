# MultiSelect ChoiceIndicator Integration v1 — freeze report

Status: **frozen**

Base commit: `aeba7678e50184868a8fee323f7b9d13ce34e0bc`

Verification date: 2026-08-02

This pass integrates the private frozen `ChoiceIndicator` into MultiSelect
option rows without reopening the Choice Controls v1 or Select / MultiSelect v1
public contracts.

## Dependency and migration

The dependency direction is private and one-way:

```text
MultiSelect
→ SelectListboxView
→ internal/choice-control/ChoiceIndicator
```

`ChoiceIndicator` is not exported from the package root or a public subpath and
does not depend on MultiSelect. The previous local checkbox marker wrapper,
checked class, SVG sizing and duplicate marker colors were removed from
`SelectListbox.module.css`; the independent single-Select check marker remains.
The selected option surface is retained because it communicates row selection
in addition to the leading indicator.

Changed implementation and evidence files:

- `packages/ui/src/MultiSelect/MultiSelect.tsx`
- `packages/ui/src/MultiSelect/MultiSelect.test.tsx`
- `packages/ui/src/internal/select/SelectListboxView.tsx`
- `packages/ui/src/internal/select/SelectListbox.module.css`
- `packages/ui/src/internal/select/SelectListbox.module.css.d.ts`
- `packages/ui/src/internal/select/SelectMultiSelectBrowserRegression.stories.tsx`
- `packages/ui/src/internal/select/SelectStories.module.css`
- `packages/ui/src/internal/select/SelectStories.module.css.d.ts`
- `packages/ui/src/internal/select/selection-semantics.contract.md`

## Semantic and size mapping

MultiSelect remains a `role="listbox"` with
`aria-multiselectable="true"`; selectable rows remain `role="option"` and
publish `aria-selected` plus the existing disabled state. Each indicator is a
direct visual child of its option with `aria-hidden="true"`, no role, input,
tabindex or event handler. Selection and activation remain owned by MultiSelect;
the option row is the sole pointer and keyboard target.

Private size mapping:

| MultiSelect size | ChoiceIndicator size | Browser geometry |
| --- | --- | ---: |
| `sm` | `sm` | 20×20 px |
| `md` | `md` | 24×24 px |
| `lg` | `md` | 24×24 px |

The 125% fixture verifies the `lg → md` indicator at 30×30 rendered pixels and
preserves checkmark containment. Long labels wrap, descriptions retain stable
row height, and the indicator aligns with the first content line.

## State, brand and environment results

The integration preserves the frozen filled checked mapping
(`action.primary.background*`) rather than introducing a second
selection-indicator mapping. Brand values enter only through
`DesignSystemProvider`; no raw brand color is passed to MultiSelect or
ChoiceIndicator. The browser matrix passed default blue, bright yellow, light
green, dark navy and purple in light and dark modes by comparing computed
indicator color with the scoped semantic probe.

| Area | Result |
| --- | --- |
| Selected / unselected | Approved; `aria-selected` and visual checked state remain synchronized |
| Disabled | Approved; option blocks activation and indicator mirrors the frozen disabled visual |
| Hover / active / focus-visible | Approved; feedback remains option-owned, indicator has no focus ring or target |
| Popover | Approved; exact existing overlay behavior and 24 px `md` geometry |
| BottomSheet | Approved at 390×844; same semantics and geometry, no alternate marker |
| Grouped options | Approved; six groups remain non-virtualized, headers have no indicator, option toggle works |
| Virtualized options | Approved with 10,000 items; mounted rows derive checked state from current value and do not shift height |
| Search / actions / async rows | Approved; indicators render only for option rows, never action/status/group rows |
| Runtime brands | Approved for five brands × light/dark through semantic variables |
| Forced colors | Approved in dedicated Chromium profile; indicator owns stable system-color adjustment and border visibility |
| Reduced motion | Approved in dedicated Chromium profile |
| 100% / 125% | Approved by exact geometry and containment assertions |
| RTL | No direction-specific implementation added; existing logical row layout remains the governing contract |

## Interaction and accessibility evidence

Unit coverage asserts the visual-only DOM contract and a click through the
indicator area producing exactly one `onChange`. Browser stories assert pointer
and Space-key toggles exactly once, option-based selection announcements, no
nested input/checkbox role/tab stop, disabled ownership, grouped and virtualized
behavior, and Popover / BottomSheet parity.

The Storybook preview runs addon-a11y with `test: "error"`. The passing default,
selected/disabled, grouped, Popover and BottomSheet integration stories therefore
provide axe coverage in addition to explicit DOM assertions. A direct in-app
Chromium inspection confirmed 24×24 geometry, `aria-hidden`, zero nested
interactive indicator nodes and a real pointer transition from change count 2
to 3 with one `aria-selected` change.

## Verification gates

- `npm run tokens:check` — passed.
- `npm run typecheck` — passed.
- `npm run test` — 41 files, 352/352 tests passed.
- `npm run choice-controls:verify` — 24/24 executions, 14/14 negative fixtures and 2/2 real state-capture tests passed. Local browser-server startup required `NODE_OPTIONS=--dns-result-order=ipv4first` so Chromium used the listening IPv4 localhost endpoint.
- `npm run test:storybook` — 24 files, 285/285 tests passed across Chromium, forced colors and reduced motion.
- `npm run build-storybook` — passed.
- `npm run build` — tokens, UI and retail UI passed.
- `npm run pack:check` — passed for all three packages.
- `npm run consumer:test` — clean tarball consumer typecheck and build passed.
- `npm run tree-shaking:test` — passed, including static and dynamic subpath isolation.
- `npm run lint` — passed.
- `npm run typography:check` — passed.
- `npm run motion:check` — passed.

Known non-fatal warnings remain unchanged: jsdom lacks scroll, canvas and
pseudo-element implementations; Storybook reports unmatched optional story
globs, ignored dependency `use client` directives and large chunks; the UI build
retains the existing empty `modal/index` and `system-color/index` chunks.

## Freeze decision

MultiSelect ChoiceIndicator Integration v1 is frozen for the private dependency
direction, visual-only `aria-hidden` contract, `sm → sm` and `md/lg → md` size
mapping, first-line option layout, selected/unselected/disabled visual mapping,
option-owned interaction and focus, Popover / BottomSheet parity, runtime-brand
and forced-colors behavior, virtualization compatibility and grouped-option
compatibility. Public MultiSelect props and Choice Controls v1 contracts are
unchanged. Future modifications require a versioned corrective pass.
