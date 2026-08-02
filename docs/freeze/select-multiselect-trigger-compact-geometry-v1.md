# Select / MultiSelect Trigger and Compact Geometry v1

Status: **corrective implementation in verification; freeze pending full CI**

Base commit: `66fca4d439ed68678dd70f37676eb8181cd7b0ef`

Corrective pass v1.1 base commit: `af0819ca1aa5f06461bc2b77133ae4edf56831a5`

Implementation date: 2026-08-02

## Freeze withdrawal

The previous MultiSelect ChoiceIndicator Integration v1 freeze is withdrawn.
It must not be restored until the complete CI matrix and focused browser review
pass for this corrective implementation.

## Corrections

### Tag remove containment

The chip remains the owner of its border, radius, fixed height and clipping.
The private remove button keeps its existing accessible name and single-action
behavior. `overflow: hidden` clips hover/active surfaces to the chip radius;
hover and active states do not change padding, width or height. Focus-visible is
drawn inward so it remains visible without escaping the chip.

### Popup reference width

`SelectPanel` now accepts a private reference ref. Select and MultiSelect pass
their outer `FieldShell`, so Floating UI measures the complete trigger border
box rather than the inner value button. The focus and ARIA owner remains the
native trigger button. Focus containment still treats the trigger and popup as
one region.

At the 320 px fixture width, browser assertions compare popup width and both
edges to the shell within 0.5 px, verify viewport containment, and repeat after
selected content, leading content, clear and chip addons appear.

### Compact option indicator

The internal `ChoiceIndicator` has a private `presentation="option"` mode.
It preserves the existing checked, disabled, brand, forced-colors and mark
language while changing only option-row geometry:

| MultiSelect size | Option indicator |
| --- | ---: |
| `sm` | 16×16 px |
| `md` | 20×20 px |
| `lg` | 20×20 px |

The public Checkbox/ChoiceIndicator geometry is unchanged. No transform scaling
is used.

### Slot architecture and inner-label isolation

The outer `FieldShell` owns three physical slots:

```text
FieldShell
├── start adornment (leading)
├── content (inner label + value/placeholder/chips)
└── end adornment (clear + spinner + chevron)
```

Inner-label padding is now confined to the content/control slot. Leading and
trailing adornments are flex-none shell siblings and remain vertically centered.
The trigger height, right inset and popup reference do not depend on label state.
MultiSelect retains one chip row, fixed trigger height, stable trailing space and
the existing `+N` overflow policy.

## Accessibility results

- Trigger button naming, `aria-expanded`, `aria-controls` and busy state are unchanged.
- Selected Select leading content is wrapped in a local `aria-hidden` subtree.
  An intentionally named `Customer icon` SVG does not enter the trigger accessible
  name; placeholder, selected, readOnly, inner-label and outer-label naming remain
  owned by the field label.
- Tag remove remains a real button with an accessible name and one removal per activation.
- Option indicators remain `aria-hidden`, without role, tabindex, nested input or event owner.
- Decorative shell addons focus/toggle through the existing FieldShell delegation;
  readOnly addons only restore focus and do not open the presentation.

## Browser and Storybook coverage

Focused stories cover tag containment at 100%/125%, normal/hover/active chip
geometry, Select and MultiSelect 320 px popup alignment through idle,
refreshing and loading addon transitions,
compact indicator size/state/brand/virtualization/Popover/BottomSheet behavior,
and inner-label addon isolation for `sm`/`md`/`lg`.

`SelectLeadingAccessibilityIsolation`, `SelectNarrow320AddonTransitions`,
`MultiSelectNarrow320AddonTransitions` and `PopupReferenceLifecycle` assert the
corrective contracts in Chromium, forced-colors and reduced-motion environments.
The focused Playwright state capture proves genuine `:hover` and delayed-click
`:active` before reading geometry; chip width/height stay stable, the remove action
stays contained, `:active` clears after release and exactly one value is removed.

## Corrective reference lifecycle decision

The state-driven `shellElement` and the competing layout-effect reference update
were removed. `SelectPanel` now installs one stable Floating UI virtual reference,
whose geometry and `contextElement` are read from `shellRef.current`. The interactive
button remains the focus/ARIA owner, while `FieldShell` remains the authoritative
geometry owner. Callback-ref null/node churn during ordinary rerenders is ignored,
so clear/spinner/chevron and selected-value transitions neither null the reference
nor close/reopen the popup.

Collection preparation was also stabilized: an unfiltered source reuses the
controller's normalized collection, and listbox option/action rows are partitioned
in one pass. The unit runner retains file parallelism but caps it at four workers,
preventing CPU-heavy jsdom suites from starving the unchanged 5 s 10,000-option
contract. No timeout was increased.

## Gates

Passed locally:

- `npm run typecheck`
- `npm run tokens:check`
- `npm run lint` (including typography and motion governance)
- focused Select/MultiSelect unit tests (50/50)
- three consecutive complete `npm run test` executions on the final code:
  353/353 in 28.61 s, 353/353 in 28.53 s and 353/353 in 28.13 s
- the 10,000-option Select test completed in 2.034 s in a complete run and
  1.477 s in the final focused Select run
- `npm run test:storybook` through the repository-required IPv4-first runner
  (24 files, 339/339 tests across Chromium, forced colors and reduced motion)
- `npm run choice-controls:verify` (24/24 story executions, 14/14 negative
  verifier fixtures and 2/2 real-browser state-capture tests)
- focused Select tag-remove Playwright capture (1/1)
- focused Select/MultiSelect Storybook browser file (141/141 across the three
  Chromium environments)

The remaining repository, Storybook, package and CI gates are recorded only
after execution. Per repository instructions, this local corrective pass does
not run `build`, `build-storybook`, `pack:check`, `consumer:test` or
`tree-shaking:test`; the latter package gates invoke consumer/build work.

## Known limitations

- Visual approval of the selected 16/20/20 px option geometry remains a human review gate.
- Full CI and package-distribution evidence is pending.
- Existing jsdom diagnostics for unimplemented canvas, pseudo-element computed
  style and `window.scrollTo` remain noisy but do not fail the complete unit gate.
- BottomSheet popup-width matching is not applicable because the sheet owns its viewport width;
  selection, compact-indicator and accessibility parity remain required.

## Freeze decision

No freeze is declared. Re-freeze only after tag containment, 320 px alignment,
compact indicator visual approval, inner-label isolation, focused real-browser
assertions and the complete CI job all pass.
