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

## Label placement and focus delegation

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

`onFocusRequest` remains only for root gaps, decorative SVGs and
non-interactive prefix/suffix columns outside the native content. Native
interactive descendants, the semantic label and explicit
`data-field-interactive` regions retain their own action/focus behavior.
Adornments stretch with the shell but center their contents independently.

Outer heights remain 32/40/48. Inner `sm` uses the existing 40px control token
because caption 11/16 plus bodySm 13/18 cannot fit accessibly in a 32px shell;
inner `md` and `lg` remain 40/48. No new size token is introduced.

The inner label is absolutely positioned over the full-size input instead of
consuming a normal-flow row. Only floated value alignment changes through
native input padding; its hit-area dimensions do not change. Input and
PasswordInput share this exact content/native-control chain.

Value, placeholder and positioned inner label resolve their inline start/end
from the same internal geometry variables. The canonical inline padding is
`space-2` for `sm`, `space-3` for `md` and `space-4` for `lg`. Start/end
adornments consume space in the flex layout and clear only their corresponding
content-side inset, so neither direction-specific offsets nor runtime text/icon
measurement are required.
