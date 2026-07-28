# FieldShell contract

FieldShell is the public advanced geometry primitive for input-like controls.
It owns `sm`/`md`/`lg` height, value typography, neutral hover, focus-within,
disabled, read-only and invalid presentation plus generic adornment alignment.

Its child may be an input, button/combobox trigger or another focusable content
region. Adornment nodes retain their own semantics; only direct decorative SVG
geometry is normalized by the slot. FieldShell never owns a value or business
behavior.
