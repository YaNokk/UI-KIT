# FieldShell contract

FieldShell is the public advanced geometry primitive for input-like controls.
It owns `sm`/`md`/`lg` height, value typography, neutral hover, focus-within,
disabled, read-only and invalid presentation plus generic adornment alignment.

Its child may be an input, button/combobox trigger or another focusable content
region. Adornment nodes retain their own semantics; only direct decorative SVG
geometry is normalized by the slot.

FieldShell supports the shared outer/inner label placement. The owner supplies
generic `labelFloated` state; FieldShell never reads a native value. Its visible
hit area calls `onFocusRequest` for shell, decorative icon and non-interactive
prefix/suffix clicks. Native interactive descendants and nodes marked
`data-field-interactive` preserve their own interaction. FieldShell never owns
a value or business behavior.
