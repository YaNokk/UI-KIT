# Input behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/input`.

- Useful behavior: native prop/ref forwarding, controlled and uncontrolled
  values, helper/error states and generic leading/trailing content.
- Adopted: native input event signatures, outer/inner labels, hint/error messages, three sizes,
  disabled/readOnly/invalid and generic adornments.
- Normalized: current 32/40/48 control scale and semantic FieldShell geometry.
- Deferred: clear action; it is not required for the stable base contract.
- Dropped: numeric/amount, lock, responsive package split and reference styling.
- Base Input performs no value transformation, preserving IME and autofill.
- Native input fills the content box and owns normal clicks/caret behavior.
  Decorative adornment columns may request focus; interactive adornments are isolated.

## v1.4 DOM/interaction audit

The local Core DS native input is `display:block; width:100%; height:100%` inside
the input wrapper. Left/right addons are sibling flex columns. Its FormControl
receives caller mouse handlers but does not add a shell-wide `input.focus()`
fallback for ordinary input interaction. This native-hit-area and sibling-addon
model is adopted; Alfa-specific non-semantic visual label markup is not.

Our final structure remains:

```text
FormControl
└ FieldShell
  ├ decorative/interactive start adornment
  ├ content
  │ ├ semantic label
  │ └ full-size native input
  └ decorative/interactive end adornment
```

Normal input and label clicks are native. Shared focus forwarding exists only
on non-interactive adornment columns; their visual gap is padding inside the
column rather than a shell-owned pointer boundary.
