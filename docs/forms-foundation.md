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

The complete visible FieldShell area is a hit target. `onFocusRequest` delegates
shell, border/padding, decorative SVG and non-interactive prefix/suffix clicks
to the primary control. Native interactive descendants and explicit
`data-field-interactive` regions retain their action and focus behavior.

Outer heights remain 32/40/48. Inner `sm` uses the existing 40px control token
because caption 11/16 plus bodySm 13/18 cannot fit accessibly in a 32px shell;
inner `md` and `lg` remain 40/48. No new size token is introduced.
