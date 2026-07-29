# Tooltip contract

`Tooltip` is one informational component with two internal presentations:

- regular: floating `role=tooltip`, hover/focus, trigger-owned focus;
- compact: the existing DS BottomSheet opened by tap/click.

The compact branch inherits focus containment, Portal, guard/dim, document
scroll lock, safe area, backdrop, swipe, layers, and focus restoration from
BottomSheet. Tooltip does not reproduce or manually register those behaviors.

At a responsive presentation change, an open Tooltip closes once and does not
migrate or reopen. Responsive mechanics, BottomSheet props, title/close-label
infrastructure, delays, offsets, arrow geometry, and Floating UI types are not
public API.
