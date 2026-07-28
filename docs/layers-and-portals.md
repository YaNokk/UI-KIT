# Layers and portals

Canonical ordering:

```text
default 0 < focused 100 < popover 300 < modal 500 < toast 600
```

`focused` is only for local overlap resolution and is not applied to every
focused control. UI code consumes the generated `--ds-z-index-*` variables and
does not introduce arbitrary z-index values.

Portal is transport infrastructure, not an overlay. It preserves React context
and targets an explicit `container`, then the nearest `PortalProvider` root,
then `document.body`. DOM access starts after the client effect, so the default
mode renders no server or hydration markup. `disabled` intentionally renders in
place.

Portal does not add positioning, dismissal, focus management, scroll lock or
modal semantics. Future Popover, Tooltip, BottomSheet and Modal primitives own
those behaviors. Nested overlays may install a nearer PortalProvider root for
local stacking. Future BottomSheet work must cover safe areas, mobile keyboard,
viewport resizing, focus management and scroll locking.
