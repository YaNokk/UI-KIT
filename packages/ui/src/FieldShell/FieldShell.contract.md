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
Its logical inline inset and the native control padding resolve from the same
internal geometry variables. Canonical inline padding is `space-2`, `space-3`
and `space-4` for `sm`, `md` and `lg`; a start or end adornment consumes that
side through flex layout and clears only the corresponding content inset.
Shared block geometry variables place the resting label at 50%, the floating
label at `space-0`, and floated native content at `space-4`/`space-0`
block-start/block-end padding. Inner heights are 40/48/48 for `sm`/`md`/`lg`;
adornments and presentation states do not change those vertical baselines.

`onFocusRequest` is invoked only by non-interactive start/end adornment columns.
Their visual gap is internal logical padding, so the root needs no click
delegation. Native controls and semantic labels use browser interaction;
interactive descendants and nodes marked `data-field-interactive` preserve
their own action. FieldShell is not focusable and never owns a value or business
behavior.
