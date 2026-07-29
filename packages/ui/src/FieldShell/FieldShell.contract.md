# FieldShell contract

FieldShell is the public advanced geometry primitive for input-like controls.
It owns `sm`/`md`/`lg` height, value typography, neutral hover, focus-within,
disabled, read-only and invalid presentation plus generic adornment alignment.

Its child may be an input, button/combobox trigger or another focusable content
region. Adornment nodes retain their own semantics; only direct decorative SVG
geometry is normalized by the slot.

FieldShell supports the shared outer/inner label placement. The owner supplies
generic `labelFloated` state; FieldShell never reads a native value. Content and
control fill the shell height and remaining width so the primary native control
can own the normal hit area. The positioned inner label does not consume a row.

`onFocusRequest` is a fallback for shell gaps, decorative icons and
non-interactive prefix/suffix columns only. Native controls, semantic labels,
interactive descendants and nodes marked `data-field-interactive` preserve
their own interaction. FieldShell never owns a value or business behavior.
