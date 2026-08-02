# Select / MultiSelect Trigger and Compact Geometry v1

Status: **corrective implementation complete; freeze pending full CI**

Base commit: `66fca4d439ed68678dd70f37676eb8181cd7b0ef`

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
- Tag remove remains a real button with an accessible name and one removal per activation.
- Option indicators remain `aria-hidden`, without role, tabindex, nested input or event owner.
- Decorative shell addons focus/toggle through the existing FieldShell delegation;
  readOnly addons only restore focus and do not open the presentation.

## Browser and Storybook coverage

Focused stories cover tag containment at 100%/125%, normal/hover/active chip
geometry, Select and MultiSelect 320 px popup alignment, addon transitions,
compact indicator size/state/brand/virtualization/Popover/BottomSheet behavior,
and inner-label addon isolation for `sm`/`md`/`lg`.

## Gates

Passed locally:

- `npm run typecheck`
- `npm run tokens:check`
- `npm run lint` (including typography and motion governance)
- focused FieldShell/Select/MultiSelect unit tests (56/56)
- `npm run test:storybook` through the repository-required IPv4-first runner
  (24 files, 324/324 tests across Chromium, forced colors and reduced motion)
- `npm run choice-controls:verify` (24/24 story executions, 14/14 negative
  verifier fixtures and 2/2 real-browser state-capture tests)
- focused in-app browser inspection for 320 px popup edges, compact indicator
  geometry, tag containment and inner-label addon centers

The complete unit suite reached 351/352 in its parallel run; the sole failure
was the existing 5 s timeout in the 10,000-option Select test. That exact test
passed immediately in isolation (1/1), and the focused Select suite passed
25/25. This is recorded as a non-functional timing flake rather than a freeze
gate success for the complete unit job.

The remaining repository, Storybook, package and CI gates are recorded only
after execution. Per repository instructions, this local corrective pass does
not run `build`, `build-storybook` or build-dependent package gates.

## Known limitations

- Visual approval of the selected 16/20/20 px option geometry remains a human review gate.
- Full CI and package-distribution evidence is pending.
- BottomSheet popup-width matching is not applicable because the sheet owns its viewport width;
  selection, compact-indicator and accessibility parity remain required.

## Freeze decision

No freeze is declared. Re-freeze only after tag containment, 320 px alignment,
compact indicator visual approval, inner-label isolation, focused real-browser
assertions and the complete CI job all pass.
