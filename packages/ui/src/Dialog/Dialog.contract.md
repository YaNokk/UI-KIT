# Dialog contract

`Dialog` — controlled modal action surface. It always renders through the
design-system Portal, traps focus while topmost, dims and guards the page, and
reports only user/runtime close requests. A consumer-driven `open=false` does
not call `onOpenChange`.

- `dismissOnBackdrop` and `dismissOnEscape` default to `true`.
- `closeLabel` is required for the canonical close `IconButton`.
- A valid `initialFocusRef` overrides autofocus; otherwise Radix FocusScope
  owns default tabbability discovery.
- Focus returns to a still-valid opener, then to the parent modal fallback.
  If neither DS target is valid, the Radix close-autofocus path is not
  prevented.
- Nested modal ownership, layers, ancestor invalidation and document scroll
  locking belong to `ModalRuntime`.

At narrow/mobile, tablet and desktop widths the centered surface remains
viewport-bounded and its body owns overflow scrolling.
