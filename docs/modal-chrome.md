# Modal chrome contract

## Regions

Modal header follows one stable logical order:

```text
consumer leading controls | minmax(0, 1fr) heading | trailing actions + close
```

`headerLeading` is a neutral `ReactNode` slot for consumer-provided contextual
controls. The UI-kit owns their placement but does not own history, Router,
entity/workspace context or Back/Forward behavior. `headerActions` is for
secondary and destructive commands. The system close control remains the final
trailing action and uses required `closeLabel`.

Body is the only modal-local vertical scroll owner. Drawer body grows between
intrinsic header and footer. Footer remains a normal flex sibling with the
shared subtle divider; compact safe-area padding is surface-owned.

## Sizes

- `Drawer size="md"` (default): `size.overlay.drawer.md`, 500 px.
- `Drawer size="lg"`: `size.overlay.drawer.lg`, 600 px.
- below canonical `md`: every Drawer covers the viewport width.

Adjacent placement uses the registered size of the actual parent. Consumers
never provide width, offset, depth or a CSS variable.

## Leading controls and actions

Contextual history/navigation belongs to the consumer feature that owns its
state and commands. It may compose labelled `IconButton` controls into
`headerLeading`; the UI-kit intentionally provides no Back/Forward component
or generic wrapper around this already sufficient slot.

`ModalHeaderActions` is a thin policy composition over public `ActionMenu` and
accepts the same labelled secondary/destructive actions. Regular viewports use
one overflow trigger and an ActionMenu-owned anchored menu surface. Below
generated `md`, the same trigger opens a BottomSheet with full-width rows.
Presentation is not a consumer option and is not implemented twice in modal
chrome.

A danger action explicitly chooses `confirmation: false` or provides inline
confirmation. Simple confirmation replaces the list in the same container;
Cancel returns to the list. Promise actions reject repeat submission. Success
closes the container. Rejection keeps the current view, clears pending state
and is delivered through `onActionError`. The UI-kit consumes the rejection
even when the callback is absent, but intentionally renders no notification or
backend error text. Feedback remains consumer-owned.

Use a consumer-controlled nested Dialog for detailed consequences, dependent
entities, typed confirmation, extra inputs, multiple business decisions or a
complex error state. Existing ModalRuntime nesting remains authoritative.

Generic Dropdown/DropdownMenu stays presentation-stable at every breakpoint.
Responsive command presentation belongs only to ActionMenu. Tooltip shares the
private responsive selector but remains a separate explanatory semantic.

Save, Create, Apply and other primary actions belong in footer.
`ModalFooterActions` arranges optional leading context, secondary and primary
ReactNodes without cloning them. Compact actions stack full width, with primary
last in thumb reach.

## Horizontal overflow

Responsive forms keep grid/flex descendants at `min-inline-size: 0`. Wide
tables and code own a local horizontal scroller. Drawer does not hide overflow
created by consumer fixed widths.

## Migration note

Consumers can remove temporary Drawer body flex-grow, local 600 px width,
local header geometry and custom responsive overflow menus after adoption.
Consumer feature controls for contextual history remain consumer-owned and are
placed in `headerLeading`. Fixed-width legacy body content still needs a
consumer correction or local horizontal scroller.
