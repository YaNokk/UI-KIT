# Drawer contract

`Drawer` is a controlled, right-side modal surface. It guards interaction
without dimming the page and never dismisses from an outside pointer. Escape
is enabled by default and can be disabled.

The surface is an overlay on tablet/desktop and covers the viewport on narrow
screens. Its body owns content scrolling. Focus, Portal, layering, ancestor
invalidation and document scroll locking use the shared modal foundation.

While any active modal branch is open, `html` and `body` are not scroll owners.
The fixed body preserves the original page position and receives explicit
classic-scrollbar compensation; the root scrollbar stays hidden. Only the
element marked `data-modal-scroll-container` owns Drawer body scrolling, while
header and footer remain fixed surface siblings. Nested modal branches share
one document lock, restored only after the final branch closes, together with
the original overflow, position, inset, inline-size and compensation styles.
