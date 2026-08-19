# Drawer contract

`Drawer` is a controlled, right-side modal surface. It guards interaction
without dimming the page and never dismisses from an outside pointer. Escape
is enabled by default and can be disabled.

The surface is an overlay on tablet/desktop and covers the viewport on narrow
screens. Public `size="md" | "lg"` selects the canonical 500 px or 600 px
content geometry; `md` remains the default. Its body owns content scrolling
and uses `flex: 1 1 auto` plus zero logical minimum sizes. Header and footer
are non-growing siblings, so a short body fills the remainder and a long body
scrolls without moving the footer. Focus, Portal, layering, ancestor
invalidation and document scroll locking use the shared modal foundation.

ModalRuntime automatically recognizes a direct Drawer child. At the canonical
`xl` viewport and above, the current Drawer pair is presented adjacent: the
parent remains at logical inline-end and the child occupies the actual
registered semantic width of its parent immediately before it. The four
`md/lg` parent-child combinations share this runtime path without DOM
measurement or consumer offsets. Below `xl`, the child overlays the parent;
below `md`, both surfaces keep the existing full-viewport compact geometry.
Logical positioning mirrors the pair in RTL.

Only the latest directly related Drawer pair is adjacent. For A → B → C, B/C
form the visible pair and A remains mounted beneath B; a Dialog or BottomSheet
opened from B does not collapse the existing A/B pair. Consumers do not manage
depth, offset, parent width or z-index.

An active wide adjacent pair is one cooperative modal workspace. Both visible
Drawer surfaces accept pointer and keyboard interaction while one transparent
guard blocks the page outside their union. Focus is contained by the pair,
but Escape still closes the latest Drawer even when focus currently belongs to
its parent. No dim, blur or opacity treatment is applied between the surfaces,
and the adjacent surfaces do not cast shadows onto each other. Adjacent Drawer
enter/exit motion is intentionally disabled. The parent keeps that no-motion
state for the remainder of its current open lifecycle after the child closes,
so returning from a pair cannot restart the standalone enter animation.

The two adjacent surfaces remain separately named `dialog` regions. Neither
claims `aria-modal`, because they are sibling portal surfaces and no single
dialog DOM subtree owns the whole workspace. The shared isolation boundary
hides everything outside both portal roots and traps focus across their union.
This keeps both regions available to assistive technology without a false
single-owner modal claim.

Opening a Dialog or BottomSheet above the pair restores normal top-only modal
interaction until that overlay closes. Below `xl`, including the fullscreen
compact layout, the child overlays its parent and remains the only interactive
Drawer. For A → B → C, only B/C form the cooperative pair and A is suppressed.
Standalone, narrow overlay and mobile fullscreen Drawer use the upstream Radix
`FocusScope` trapping behavior plus the same `hideOthers` isolation primitive
used by Radix Dialog. The custom tabbable traversal is limited to the wide
multi-surface workspace. The internal Radix Root remains in stable non-modal
mode because changing its `modal` flag swaps Content implementations and would
remount a nested controlled Drawer while the pair is being established.

Header and footer section boundaries share the modal foundation divider style:
the existing default border width with the semantic subtle border color. No
Drawer-specific decorative border token is introduced. Drawer surfaces are
edge-aligned rectangles without corner rounding at every viewport. Modal body
content starts after canonical `space.4`; this keeps control outlines and focus
rings clear of the header divider without a component-specific offset.

Normal responsive form content keeps flex/grid descendants shrinkable. Wide
tables, code and intentionally wide content own a local horizontal scroll
container. Drawer preserves logical minimum sizes but does not globally hide
overflow caused by consumer fixed widths or force word breaking on all body
content. URLs, identifiers and other long values choose wrapping locally.

While any active modal branch is open, `html` and `body` are not scroll owners.
The fixed body preserves the original page position and receives explicit
classic-scrollbar compensation; the root scrollbar stays hidden. Only the
element marked `data-modal-scroll-container` owns Drawer body scrolling, while
header and footer remain fixed surface siblings. Nested modal branches share
one document lock, restored only after the final branch closes, together with
the original overflow, position, inset, inline-size and compensation styles.
