# Sidebar contract

`Sidebar` is a reusable presentation and interaction primitive for application
navigation. It owns its rail geometry, internal content scrolling, navigation
layer, collapsed flyouts and group disclosure behavior. It does not own routes,
permissions, feature flags, active-route detection or application menu data.

- `collapsed`/`defaultCollapsed` and `open`/`defaultOpen` follow controlled and
  uncontrolled conventions. Active item and group state is always supplied by
  the application.
- `Sidebar.Item` and `Sidebar.Subitem` render native buttons by default. With
  `asChild`, one supplied link-like element becomes the interactive root; the
  component never nests a button inside a link. Router-specific props remain on
  that child.
- Labels are required strings and remain the accessible name while collapsed.
  Applications may provide `aria-current` on a link-like child.
- Expanded groups use native disclosure buttons with `aria-expanded` and
  `aria-controls`. Collapsed groups use the shared Floating UI/Portal
  infrastructure, support pointer and focus interaction, reposition on
  scroll/resize, flip at viewport edges, and dismiss on Escape/outside press.
- Sidebar is on `zIndex.navigation`, above local sticky content and below
  popovers. Flyouts use the shared `zIndex.popover` runtime, including the
  modal-local floating layer range when composed inside a modal.
- Sidebar does not apply page offsets or responsive policy. A consuming shell
  places it in grid/flex layout and controls `collapsed` at its chosen
  breakpoint. Header and footer remain fixed while `Sidebar.Content` owns menu
  scrolling.

