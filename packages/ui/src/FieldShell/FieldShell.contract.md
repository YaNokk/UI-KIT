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
Shared size-specific block geometry variables divide inner-label fields into
an upper label band and a lower value/content band. The requested size remains
the actual field height: 32/40/48 for `sm`/`md`/`lg`; inner labels never promote
a control to another size. Empty resting fields suppress their placeholder in
the shared shell, while focus or an owner-supplied floated state reveals the
placeholder/value in the lower band. Adornments remain centered in the full
shell and presentation states do not change these vertical baselines.

The v1.6 optical freeze defines label top/line, content top/bottom, value line
and inline padding explicitly for each size. Every size has a non-zero bottom
inset. `sm` uses an explicit compact caption/value geometry and no negative
gap. The stable caption label remains at its floated top and represents its
resting state only through translate/scale; only transform and color animate.
Consumers center content only inside the resulting lower zone and never add
their own vertical offsets. See `docs/field-inner-geometry.md`.

MultiSelect freezes inner selected presentation by requested size: `sm` and
`md` use a textual localized summary, while `lg` uses a single row of chips
plus `+N` overflow. Available width may change only the visible chip count in
`lg`, never the presentation policy. Outer-label MultiSelect continues to use
the normal chip/overflow presentation.

`onFocusRequest` is invoked only by non-interactive start/end adornment columns.
Their visual gap is internal logical padding, so the root needs no click
delegation. Native controls own the inner-label hit area because the positioned
inner label is pointer-transparent. Outer semantic labels keep native
`htmlFor` interaction;
interactive descendants and nodes marked `data-field-interactive` preserve
their own action. FieldShell is not focusable and never owns a value or business
behavior.
