# Popover contract

`Popover` is a controlled, non-modal floating surface anchored to one trigger.
It uses DS Portal, semantic surface tokens, and the modal floating layer range
when rendered inside a modal.

- Outside press and Escape dismissal are configurable booleans.
- The first Escape closes Popover without closing its parent modal.
- Popover never locks document scroll, creates a guard/dim, traps focus, or
  sets `aria-modal`.
- Placement types are DS-owned strings; Floating UI types are private.
- `matchTriggerWidth` is a semantic capability for field/dropdown consumers,
  not a raw width API.
