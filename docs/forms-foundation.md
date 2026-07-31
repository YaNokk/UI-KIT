# Forms foundation

## Responsibilities

```text
FormControl
  label / required / hint / error / IDs and ARIA
        ↓
FieldShell
  size / border / surface / focus / disabled / readOnly / invalid / adornments
        ↓
native or input-like control
  value / events / selection / domain behavior
```

`FormControl` and `FieldShell` intentionally remain separate. `FieldLabelView`
is shared by every input-like field and supports `outer` and `inner`. Input is the
convenience composition for ordinary native text-like inputs. Domain controls
such as amount, mask, phone, date, Select and Autocomplete reuse the same shell
but own their parsing and interaction model.

## IDs and accessibility

An explicit Input `id` is used unchanged. Otherwise FormControl derives a
stable ID from React `useId`. Hint/error IDs append `-hint`/`-error`; caller
`aria-describedby` tokens are preserved and deduplicated. The v1 policy is
error replacement: a visible error hides the hint and becomes the only internal
described message. An error makes `aria-invalid=true`. `required` drives both
the visual marker and the native input attribute.

Disabled remains non-interactive native `disabled`. Read-only stays focusable,
selectable and readable. Generic adornments retain their own semantics, so an
interactive adornment must provide its own accessible name.

## Native behavior and future controls

Input forwards the native ref, event signatures and attributes and supports
normal controlled/uncontrolled React usage. It does not filter, parse, format
or mask, preserving IME, autofill, password managers, selection and mobile
keyboard behavior.

Field sizes are explicit: `sm=32`, `md=40`, `lg=48`; typography and direct SVG
geometry use the matching canonical roles. Geometry uses logical inline
properties and semantic CSS variables.

## Label placement and native interaction

The default is `labelView="outer"`. The local MP Input reference has no floating
label, so inner placement is opt-in rather than guessed as the canonical form
language. Outer labels render above the shell.

Inner labels remain semantic `<label>` elements. Empty and unfocused means
resting; focus or string length greater than zero means floating. Placeholder is
hidden while the inner label rests. Input owns focus/content tracking and
FieldShell receives only generic `labelFloated` state. Caller focus, blur and
change handlers are composed with internal tracking.

FieldShell establishes a canonical block size; its content and control regions
stretch to the full inner height and remaining width. The native Input then
fills that box with `width/height: 100%`. Its own inline padding provides value
alignment, so center, upper, lower and inline-edge content clicks use native
pointer, caret, selection and mobile-keyboard behavior rather than `.focus()`.

The FieldShell root has no focus-forwarding click handler. Outer
`<label htmlFor>` clicks use native association. The positioned inner label is
pointer-transparent, so its physical area resolves to the underlying native or
input-like control: Input focuses and Select/MultiSelect opens through their
normal interaction. `onFocusRequest` remains only on decorative start/end
adornment columns. Their visual gap is logical padding inside those columns,
not a separate shell pointer boundary. Explicit `data-field-interactive`
regions retain their own action/focus behavior.

Text-like Input composition marks its semantic labels, content and decorative
adornments with `cursor:text`; readOnly remains text/selectable and disabled
uses the canonical disabled cursor. Password visibility keeps IconButton
pointer/keyboard semantics. Cursor CSS communicates affordance but does not
emulate focus.

Outer and inner fields both preserve the requested 32/40/48 height. Inner
placement never promotes `sm` or `md` to a larger control token and introduces
no new public size.

The inner label is absolutely positioned instead of consuming a normal-flow
row. FieldShell applies floated padding to its shared control region, producing
an upper label band and a lower content band without shrinking the native hit
area. Input, PasswordInput, NumberInput, AmountInput, Select and MultiSelect
center their value only inside that lower region and do not own vertical
offsets.

The optical freeze derives the content start from the shared label top, compact
caption line height and an explicit label/content gap. `md` and `lg` use a
positive `space-1` gap, so their label and value line boxes form separate bands;
`lg` additionally keeps `space-1` of bottom breathing room. `sm=32` is an
explicit compact policy: it keeps the public body-sm value role, uses a
`-space-1` optical gap and permits at most 4px of label/value rectangle overlap.
That tolerance is intentional, browser-asserted and is not a hidden size or a
new typography role. Resting labels remain at 50%. Adornments stay centered in
the complete shell, and error, disabled, readOnly and loading states do not
alter geometry.

Placeholder suppression belongs to FieldShell for both native
`::placeholder` and custom `[data-field-placeholder]` content. Resting empty
inner fields hide it; focus/open reveals it; a value floats the label and keeps
the value visible. Outer-label fields preserve normal placeholder behavior.
Chromium forced-colors replaces transparent placeholder colors unless the
resting placeholder pseudo-element opts out; the scoped forced-colors rule is
therefore limited to that hidden state and does not override active system
colors.

MultiSelect has a deterministic inner presentation policy: `sm` and `md` use
a localized textual selection summary, while `lg` uses one-row chips plus `+N`
overflow. Width affects only the number of visible `lg` chips. Outer-label
MultiSelect continues to use chips and overflow. Compact inner summary mode
does not create the chip sizing DOM, attach its ResizeObserver or perform chip
overflow measurement.

Value, placeholder and positioned inner label resolve their inline start/end
from the same internal geometry variables. The canonical inline padding is
`space-2` for `sm`, `space-3` for `md` and `space-4` for `lg`. Start/end
adornments consume space in the flex layout and clear only their corresponding
content-side inset, so neither direction-specific offsets nor runtime text/icon
measurement are required.

## Optical and responsive browser verification

Fixed `OpticalContainer390/768/1440` stories calibrate layout inside a wrapper;
they are not responsive tests. The separate responsive stories set the real
Storybook viewport to `390x844`, `768x1024` and `1440x900` and assert that the
Select resolver chooses BottomSheet below `md` and Popover from `md` upward.

The browser regression story measures rendered rectangles for the priority
fixtures: sm Input with value allows the documented 4px optical tolerance;
md Select with value and lg MultiSelect chips allow only 0.5px rounding
tolerance. It also covers label-area hit-testing, placeholder hide/restore,
Select/MultiSelect opening, focused long placeholders and a real Chromium
forced-colors context.

Run the required browser gate with:

```sh
npm run test:storybook
```

The same command runs in `.github/workflows/ui-tests.yml`. JSDOM remains useful
for state and ARIA coverage but is not accepted as geometry or hit-testing
evidence.
