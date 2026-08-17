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
  breakpoint. It receives its available block size from that container and
  never applies viewport height, fixed positioning or page-level geometry.
- Header and footer are non-growing flex siblings. `Sidebar.Content` uses
  `flex: 1`, `min-block-size: 0` and `overflow-y: auto`, so it becomes the sole
  internal scroll owner when the parent bounds Sidebar height. Without a
  bounded parent, Sidebar grows naturally and no internal scrollbar appears.
- Expanded, collapsed and flyout inline sizes use canonical `size.sidebar.*`
  geometry tokens. Spacing tokens remain limited to padding, gaps and margins.
- Items always fill the natural content box. During expanded-width reveal,
  `Sidebar.Content` keeps the canonical expanded canvas and the root clips only
  its inline overflow; this prevents temporary label rewrapping without making
  an item calculate Sidebar width, padding or border geometry.
- Footer controls keep a fixed control block size and a stable icon coordinate
  while root width changes. Footer padding/alignment does not switch between
  modes; long labels are clipped and ellipsized before the collapsed rail hides
  them. Reduced motion removes the root transition without changing geometry.
- A closed expanded submenu has synchronized `aria-hidden` and native `inert`
  state. The attribute is written through the DOM boundary so React 18 and 19
  do not receive incompatible boolean/string serialization.
- Navigation is intentionally a persistent dark/inverse surface in both
  application themes. Mode may tune its neutral aliases; runtime brand affects
  active/accent states, not the base navigation surface.
- `interpolate-size` and `@starting-style` progressively enhance transitions in
  supporting browsers. Unsupported browsers keep the same disclosure and
  layout behavior with an immediate, functional state change; no JS
  measurement fallback is required.
