# Drawer contract

`Drawer` is a controlled, right-side modal surface. It guards interaction
without dimming the page and never dismisses from an outside pointer. Escape
is enabled by default and can be disabled.

The surface is an overlay on tablet/desktop and covers the viewport on narrow
screens. Its body owns content scrolling. Focus, Portal, layering, ancestor
invalidation and document scroll locking use the shared modal foundation.
