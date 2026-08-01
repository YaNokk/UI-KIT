# Select / MultiSelect v1 freeze

Status: **frozen**  
Behavioral baseline commit: `13f38c7843155bf2dc5bcfc4e823a2bde043b71d`  
Verification date: 2026-08-01

This report freezes the public behavior and the shared foundations exercised by
Select and MultiSelect. The verification pass itself changes no component
behavior, public API, DOM anatomy, geometry, typography, motion value, or
overlay architecture.

## Public APIs

`Select<Value extends string>` is a controlled semantic value field with
`value: Value | null`, `onChange`, and `items`. `MultiSelect<Value extends
string>` uses `value: Value[]`, `onChange`, and the same collection model. Both
components expose optional resolved selection data, collection/loading state,
search configuration, controlled or uncontrolled open state, field label and
supporting-text semantics, disabled/read-only/required/clearable states,
`sm | md | lg` sizing, locale and message overrides, native form identity, and
accessible-name/description props. The exported prop types remain the source
of truth; this freeze adds no compatibility aliases or new props.

## Private foundations

- `FormControl` owns label, hint, error, required, and described-by semantics.
- `FieldShell` owns input-like geometry, state visuals, inner-label layout, and
  the shared trigger content area.
- The private select collection, search, state controller, listbox view, and
  `SelectPanel` foundations are shared by Select and MultiSelect.
- `useFloatingOverlay`, canonical `Portal`, and BottomSheet presentation own
  overlay positioning and dismissal. `outsidePressBoundaryRef` extends only
  outside-pointer containment; it does not redefine the Floating UI reference
  or Escape semantics.
- Shared single-line typography utilities apply canonical field-value and
  compact-chip roles. Semantic motion tokens own label and indicator motion.

The private boundary name `outsidePressBoundaryRef` is used consistently by
`UseFloatingOverlayOptions`, `useFloatingOverlay`, `SelectPanelProps`,
`SelectPanel`, Select, MultiSelect, tests, and documentation. No compatibility
alias remains.

## Behavior invariants

- One main trigger owns placeholder, value/summary/chip body, chevron, and
  loading spinner hit regions. Each click produces exactly one open-state
  transition and the controlled transition sequence is `true, false`.
- The spinner stays inside the trigger, is `aria-hidden`, is not focusable, and
  never receives a separate button role or click handler. Loading exposes
  `aria-busy="true"` on the trigger.
- Select value and placeholder clicks toggle; clear never toggles. MultiSelect
  placeholder, summary, chip body, chevron, and spinner toggle; remove and
  clear actions never toggle.
- Outside press and Escape close the overlay. Controlled and uncontrolled open
  state remain supported, including focus restoration.
- Disabled and read-only fields never open. Read-only MultiSelect also never
  mutates its value.
- Popover and compact BottomSheet presentations preserve the same semantic
  state; the sheet Done action closes the presentation.

## FieldShell inner geometry

FieldShell owns all size-specific vertical offsets. Input, PasswordInput,
Select, and MultiSelect do not add their own offsets.

| Size | Height | Label top / line | Content top / bottom | Value line | Inline padding |
| --- | ---: | ---: | ---: | ---: | ---: |
| `sm` | 32px | 2px / 10px | 12px / 4px | 14px | 8px |
| `md` | 40px | 4px / 10px | 14px / 4px | 20px | 12px |
| `lg` | 48px | 4px / 12px | 16px / 8px | 22px | 16px |

Every size keeps a non-zero bottom inset. The native editor remains full-size
and typography-only: it receives no position, inset, or translation from
optical calibration.

## Typography roles

Field values use `typography.fieldValueTextSm`,
`typography.fieldValueTextMd`, and `typography.fieldValueTextLg`. MultiSelect
chips and the `+N` summary use `typography.compactChipText`; they are not field
values. Private field-value wrappers may use the local progressive optical
enhancement, while native inputs use the typography role only. Typography
metrics are independent of theme, runtime brand, and responsive breakpoints.

## Motion roles

- `motion.control.label`: 180ms (`motion.duration.normal`) with
  `cubic-bezier(0.2, 0, 0, 1)`; FieldShell transitions label transform and
  color only.
- `motion.control.indicator`: 120ms (`motion.duration.fast`) with the same
  standard easing; the select chevron uses this semantic role.
- Reduced-motion mode resolves the semantic control durations to `0ms`.

Components consume semantic roles rather than legacy duration variables.

## Browser baseline and story coverage

The verified baseline is Playwright Chromium on Windows in standard,
forced-colors, and reduced-motion profiles. The run collected 18 files and 195
tests; it was not a zero-test or partial collection. It rendered the full
`InnerLabelGeometryV1_6` story group and executed these required regression
stories:

`TriggerToggle`, `UncontrolledTriggerToggle`, `TriggerHitRegion`,
`MultiSelectTriggerHitRegion`, `LoadingSpinnerHitRegion`, `ReadOnlyContract`,
`CompactBottomSheetPresentation`, `TriggerHitRegionGeometry`,
`FieldValueTypographyMatrix`, `NativeEditorGeometry`,
`NativeEditorGeometryZoom125`, and `LabelStateAndDirection`.

The typography matrix also exercised the system-ui fallback. Geometry coverage
includes the deterministic 100% and story-level 125% zoom cases.

## Verification record

| Command or check | Result |
| --- | --- |
| `npm ci` | Failed before verification: Windows `EPERM` while unlinking the loaded `lightningcss.win32-x64-msvc.node` native module. |
| `npm install` | Passed as the repository-equivalent dependency restore: 335 packages added, 146 changed, 518 audited. Cleanup warnings remained for locked native temporary directories; npm reported one high-severity advisory. No audit remediation was applied in this non-functional pass. |
| `npm run tokens:check` | Passed, including responsive token validation. |
| `npm run typecheck` | Passed. |
| `npm run test` | Passed: 36 files, 320 tests. Non-failing jsdom warnings for `window.scrollTo` and canvas `getContext` remain. |
| `npm run test:storybook` | Passed: 18 files, 195 tests across all three Chromium profiles. |
| `npm run build-storybook` | Skipped: repository `AGENTS.md` explicitly forbids running a build after task completion. |
| `npm run typography:check` | Passed. |
| `npm run motion:check` | Passed. |
| `npm run lint` | Passed; it also includes typography and motion checks. |
| Stale-name search | Zero production hits for `dismissBoundaryRef`, `--ds-motion-fast`, `--ds-motion-normal`, and `--ds-motion-slow`. The only repository hit for each name is this audit row. |
| Private-boundary audit | `outsidePressBoundaryRef` is present in the hook API/implementation, panel API/implementation, Select, MultiSelect, tests, and docs; no old-name alias exists. |

GitHub status checks were not published or inspected by this local pass.

## Known limitations

- Story-level 125% CSS zoom is not a claim of OS-DPI equivalence.
- Cross-engine optical equivalence is not claimed; this baseline covers
  Chromium only, not Firefox or WebKit.
- Native browser/password-manager autofill painting cannot be invoked
  deterministically by Storybook automation.
- The dependency restore reported one high-severity npm advisory; resolving it
  requires a separately scoped dependency review.
- Autocomplete and InternationalPhoneInput are future work and are not covered
  by this component freeze.

## Future extension points

Autocomplete may compose the same FieldShell, select collection, overlay, and
display-span foundations without changing the frozen contracts.
InternationalPhoneInput belongs to its independent phone-domain foundation.
Any change to a frozen behavior or foundation requires a new versioned
corrective pass, an explicit regression, and a documented contract change.
Checkbox, Radio, and Switch work must not modify these foundations
opportunistically.

## Freeze declaration

Subject to the explicitly recorded local environment skip above, the following
contracts are formally frozen at the behavioral baseline SHA:

- FieldShell Inner Geometry v1
- Select v1
- MultiSelect v1
- Motion Foundation v1
- Single-Line Control Typography v1
