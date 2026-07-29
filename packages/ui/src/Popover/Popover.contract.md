# Popover contract

`Popover` is a controlled, non-modal floating surface anchored to one trigger.
It uses DS Portal, semantic surface tokens, and the modal floating layer range
when rendered inside a modal.

- Outside press and Escape dismissal are configurable booleans.
- The first Escape closes Popover without closing its parent modal.
- Outside press on a control in the same modal surface dismisses Popover and
  lets that control activate. A parent modal guard press is consumed after
  dismissing Popover so the same pointer sequence cannot close both layers.
- Popover never locks document scroll, creates a guard/dim, traps focus, or
  sets `aria-modal`.
- Public Popover defaults to dialog-like semantics, but the private foundation
  owns a DS semantic role and can render listbox/menu/no-role surfaces without
  inheriting `dialog`.
- Placement types are DS-owned strings; Floating UI types are private.
- `matchTriggerWidth` means exact floating inline size equality with the
  trigger width, still constrained by the viewport. A future minimum-reference
  width capability must use a different name.
- One modal branch supports five monotonically layered floating surfaces
  (`+2…+6`). Further descendants clamp to `+6`; DEV warns and production stays
  deterministic below the next modal guard.
