# Forms foundation

## Responsibilities

```text
FormControl
  label / required / description / error / IDs and ARIA
        ↓
FieldShell
  size / border / surface / focus / disabled / readOnly / invalid / adornments
        ↓
native or input-like control
  value / events / selection / domain behavior
```

`FormControl` and `FieldShell` intentionally remain separate. Input is the
convenience composition for ordinary native text-like inputs. Domain controls
such as amount, mask, phone, date, Select and Autocomplete reuse the same shell
but own their parsing and interaction model.

## IDs and accessibility

An explicit Input `id` is used unchanged. Otherwise FormControl derives a
stable ID from React `useId`. Description and error IDs append
`-description`/`-error`; caller `aria-describedby` tokens are preserved and
deduplicated. An error makes `aria-invalid=true`. `required` drives both the
visual marker and the native input attribute.

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
