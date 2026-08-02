# Select / MultiSelect Trigger and Compact Geometry v1

Status: **corrective implementation complete; visual approval Blocked; CI verification pending; freeze withdrawn**

Base commit: `66fca4d439ed68678dd70f37676eb8181cd7b0ef`

Corrective pass v1.1 base commit: `af0819ca1aa5f06461bc2b77133ae4edf56831a5`

CI lifecycle hardening v1.2 base commit: `25435540501f1d008caf3fbd8f3665c51876ea45`

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

The v1.2 unit lifecycle coverage adds `SelectPanelTriggerRefLifecycle`,
`PopupReferenceReplacement` and `PopupReferenceUnmountCleanup`. It verifies that
replacement while open transfers the interactive reference, closing restores focus
only to the mounted replacement, unmount clears the interactive reference, and the
shell-backed virtual geometry reference remains stable during replacement.

## Corrective reference lifecycle decision

The state-driven `shellElement` and the competing layout-effect reference update
were removed. `SelectPanel` installs one stable Floating UI virtual reference,
whose geometry and `contextElement` are read from `shellRef.current`. The interactive
button remains the focus/ARIA owner, while `FieldShell` remains the authoritative
geometry owner. Its memoized callback ref now handles the complete lifecycle:
`node` installs or replaces the mounted interactive reference and `null` clears the
detached trigger from both internal and consumer refs. For shell-backed geometry,
the `null` transition deliberately does not clear the stable virtual reference.
Ordinary clear/spinner/chevron and selected-value rerenders keep the callback stable,
so they neither cause ref churn nor close/reopen the popup.

Collection preparation was also stabilized: an unfiltered source reuses the
controller's normalized collection, and listbox option/action rows are partitioned
in one pass. The unit runner retains file parallelism but caps it at four workers,
preventing CPU-heavy jsdom suites from starving the unchanged 5 s 10,000-option
contract. No timeout was increased.

## Gates

Passed locally:

- `npm run select-multiselect:verify`, the canonical v1.2 gate: focused real-browser
  tag state capture 1/1 plus the focused Select/MultiSelect Storybook regression
  file 141/141 across Chromium, forced colors and reduced motion
- `npm run typecheck`
- `npm run tokens:check`
- `npm run lint` (including typography and motion governance)
- focused Select/MultiSelect/lifecycle unit tests (52/52)
- three consecutive complete `npm run test` executions on the final code:
  355/355 in 27.92 s, 355/355 in 27.64 s and 355/355 in 28.24 s
- the 10,000-option Select test completed in 1.432 s in the focused Select run;
  file parallelism remains enabled, `maxWorkers` remains four and the 5 s timeout
  is unchanged
- `npm run test:storybook` through the repository-required IPv4-first runner
  (24 files, 339/339 tests in 30.04 s across Chromium, forced colors and reduced motion)
- `npm run choice-controls:verify` (24/24 story executions, 14/14 negative
  verifier fixtures and 2/2 real-browser state-capture tests)

The required CI workflow now runs `npm run select-multiselect:verify` as a required
step named for `${{ github.sha }}`, after Choice Controls verification and before
the complete Storybook and build gates. It has no `continue-on-error`; the existing
downstream gates remain intact. A workflow run ID/URL for the exact SHA is not yet
available, so CI verification is still pending and no CI success is claimed here.

The clean-install attempt reached an environment-specific `EPERM` while an existing
Storybook process held a native `lightningcss` binary open. The dependency tree was
restored with `npm install --ignore-scripts`, after which tokens, typecheck, lint,
Choice Controls and the complete Storybook suite passed. This is local environment
evidence only, not a successful clean-install gate.

The remaining repository, Storybook, package and CI gates are recorded only
after execution. Per repository instructions, this local corrective pass does
not run `build`, `build-storybook`, `pack:check`, `consumer:test` or
`tree-shaking:test`; the latter package gates invoke consumer/build work.

## Known limitations

- Visual approval of the selected 16/20/20 px option geometry remains a human review gate.
- Approval record for v1.2: **Blocked** — no explicit human visual approval was
  supplied in this task. Automated geometry/state/brand/environment assertions pass,
  but they do not replace the required review.
- Full CI and package-distribution evidence is pending.
- Existing jsdom diagnostics for unimplemented canvas, pseudo-element computed
  style and `window.scrollTo` remain noisy but do not fail the complete unit gate.
- BottomSheet popup-width matching is not applicable because the sheet owns its viewport width;
  selection, compact-indicator and accessibility parity remain required.

## Freeze decision

No freeze is declared. The implementation and local automated evidence are complete,
but human compact-indicator approval is Blocked and exact-SHA CI evidence is pending.
Re-freeze only after tag containment, 320 px alignment, compact indicator visual
approval, inner-label isolation, focused real-browser assertions and the complete CI
job all pass.
