# Floating overlay foundation

Status: implementation baseline for private floating infrastructure,
`Popover` v1, and responsive `Tooltip` v1.

Architecture authority remains the current design system. Core DS is
behavioral evidence only, the MP UI Kit is visual evidence only, and
`@floating-ui/react` is a replaceable private positioning/interaction engine.

The repository snapshot does not contain raw Core Popover/Tooltip packages.
For this audit, the published Core DS packages
`@alfalab/core-components-popover@8.1.0` and
`@alfalab/core-components-tooltip@9.0.16` were inspected without copying their
implementation into the repository.

## Ownership audit

| Concern | Core DS behavior | Floating UI capability | Existing DS capability | Final owner | Decision |
| --- | --- | --- | --- | --- | --- |
| Desktop Tooltip | Tooltip composes Popover | `useHover`, `useFocus`, `useRole`, positioning middleware | Portal, tokens, modal floating range | Tooltip + private foundation | Floating, non-modal, hover/focus |
| Mobile Tooltip | Responsive component selects BottomSheet | Not applicable to modal mechanics | Existing BottomSheet and ModalRuntime | Tooltip resolver + BottomSheet | Compact presentation reuses BottomSheet |
| Responsive switch | Public breakpoint/client/default-match props | None required | `mediaQueries.belowMd` | Private resolver | 767 compact; 768/769 regular; no public responsive props |
| Presentation change | Core remounts responsive branch | Open state can be external to surfaces | React state and responsive subscription | Tooltip shared model | Close once; do not migrate or reopen |
| Shared open state | Core branches have separate local/forced-open paths | Controlled `open` context | Current controlled conventions | Tooltip | One controlled/uncontrolled state adapter shared by both branches |
| Hover/focus | Core desktop uses delayed hover; focus semantics are incomplete | Safe polygon hover, focus interaction | Native trigger semantics | Floating Tooltip | Private 300 ms open / 100 ms close policy; keyboard focus supported |
| Compact trigger | Core mobile opens on click | Click interaction available | Native click semantics | Tooltip adapter | Tap/click opens immediately; hover branch is disabled |
| Tooltip ARIA | Core source contains an unresolved accessibility TODO | `useRole("tooltip")` | React IDs and native ARIA | Floating Tooltip | `role=tooltip` and valid `aria-describedby`; tooltip never receives focus |
| Sheet ARIA | Core passes broad BottomSheet props | Not applicable | BottomSheet dialog semantics | BottomSheet | Internal localized title and close label; content remains body, not duplicated |
| Mobile title | Core leaves naming to BottomSheet props | Not applicable | Locale context and required modal title | Tooltip | Private generic localized “Tooltip” heading; no mobile-only public prop |
| Popover role | Core is a positioning primitive | `useRole`, click/dismiss hooks | Public DS component conventions | Popover | Non-modal `dialog`, never `aria-modal` |
| Outside dismiss | Core Tooltip listens on document; Core Popover delegates positioning only | `useDismiss` | Parent modal remains authoritative | Private foundation | Configurable for Popover; Tooltip floating closes without blocking page |
| Escape | Core desktop does not provide complete modal arbitration | Dismiss hooks plus DOM capture | ModalRuntime/Radix parent | Private foundation | Open floating child consumes first Escape; parent modal remains open |
| Focus | Core leaves focus largely on trigger | Reference/floating prop getters | Native focus and ModalRuntime | Component | Tooltip keeps trigger focus; Popover has no trap or automatic focus transfer |
| Placement | Core exposes Popper placements | `Placement`, offset/flip/shift | No public raw geometry | Private foundation | Popover exposes 12 semantic placements; Tooltip exposes four sides |
| Arrow | Core Popover supports arrow | `arrow()` middleware | Spacing/radius/surface tokens | Tooltip | Tooltip only in v1; private geometry |
| Width matching | Core exposes anchor-width behavior | `size()` middleware | Component capability | Popover | Public boolean `matchTriggerWidth`; no raw width prop |
| Portal | Core accepts portal-container callbacks | Floating UI does not require its Portal | Canonical DS Portal/provider host | DS Portal | Floating surfaces always render through DS Portal |
| Layer | Core accepts raw z-index/stack context | Positioning is layer-agnostic | `ModalLayerContext`, `zIndex.popover` | Private floating layer adapter | Modal floating `+2…+6`; nested floating surfaces increment privately |
| Modal nesting | Core uses independent stacks | Context is preserved through React portals | Modal parent/layer contexts | Current DS | Floating branches do not register; Tooltip sheet registers only through BottomSheet |
| Scroll/guard/dim | Core mobile delegates to BottomSheet | None | ModalRuntime and BottomSheet | BottomSheet | Never duplicated in Tooltip |
| SSR | Core exposes server match overrides | Hooks can render closed without DOM | Portal mounts after effect; `useSyncExternalStore` pattern | Resolver + Portal | Server snapshot is regular and closed; no DOM access or hydration mismatch |
| Upgrade baseline | Not a stable contract | Version-specific behavior | Docs/check suites | DS maintainers | Any Floating UI bump reruns positioning, interactions, layers, Portal and SSR |

## Public decisions

`Popover` is controlled and non-modal:

```ts
interface PopoverProps {
  open: boolean;
  onOpenChange(open: boolean): void;
  trigger: ReactElement;
  children: ReactNode;
  placement?: PopoverPlacement;
  dismissOnEscape?: boolean;
  dismissOnOutsidePress?: boolean;
  matchTriggerWidth?: boolean;
  className?: string;
}
```

`Tooltip` has one public model and two private presentations:

```ts
interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  placement?: TooltipPlacement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?(open: boolean): void;
}
```

There are no public breakpoint, pointer, presentation, BottomSheet, delay,
offset, arrow, z-index, title, or close-label mechanics. Controlled and
uncontrolled Tooltip modes use the same state transition boundary.

## Responsive and SSR policy

The resolver subscribes to `mediaQueries.belowMd` from `@mypoint/tokens`.
It returns `floating` for the server snapshot and during hydration. Tooltip is
closed by default, so no floating or sheet DOM is hydrated. When the client
snapshot resolves:

- closed Tooltip simply selects the correct presentation;
- open Tooltip crossing the boundary closes exactly once;
- the new presentation does not reopen automatically;
- focus remains on the still-mounted shared trigger.

Future hover/pointer capability may replace or augment the width policy inside
the resolver without changing public props.

## Layer and dismissal baseline

Outside a modal, floating surfaces use `zIndex.popover`. Inside a modal they
consume `ModalLayerContext.floatingLayer`; nested floating surfaces advance
within the private reserved range. The next modal guard/surface therefore
remain above all floating descendants.

While an open floating child is present, its first Escape is consumed at the
window capture boundary. A document-scoped activation stack ensures only the
latest floating surface reacts, before a parent Dialog can process the same
keyboard event. Outside press uses the same topmost arbitration; inside a
modal, the dismissing press is consumed so the parent modal stays open.
Floating Tooltip never traps or moves focus. Popover also remains non-modal
and does not lock scroll or create a guard.

## Blocking spike result

The browser spike was completed before production implementation:

- Floating UI positioned Popover and Tooltip correctly through DS Portal.
- Dialog surface layer `501` and floating layer `502` preserved the reserved
  modal relationship.
- Floating Tooltip produced a matching `role=tooltip` ID and trigger
  `aria-describedby`; focus stayed on the trigger.
- A raw `useDismiss` Escape closed both the floating child and the parent
  Radix Dialog. This is version-specific failed arbitration evidence, so the
  production foundation must consume the first Escape at the window capture
  boundary while a floating child is open.
- Compact Dialog → Tooltip BottomSheet produced Dialog `501`, one effective
  guard `508`, and sheet `509`.
- The nested sheet reused document scroll lock and returned focus to the
  Tooltip trigger inside the still-mounted Dialog.

The supported nested modal matrix therefore permits the mobile Tooltip branch.
Production implementation is unblocked with the documented Escape adapter.

## Upgrade baseline

Pin `@floating-ui/react` exactly. Any bump reruns:

- offset, flip, shift, size, arrow and `autoUpdate`;
- hover, focus, click, outside press and Escape;
- provider Portal/theme inheritance;
- nested modal layer ordering;
- SSR and hydration;
- responsive Tooltip boundary behavior.

Any BottomSheet change reruns mobile Tooltip backdrop, swipe, focus return,
scroll lock, safe area and nested Dialog flow.

## Production browser freeze

The production stories were checked in the browser at 390×844, 768×1024,
769×844, and 1440×900:

- Dialog `501` → floating Tooltip `502`; the trigger `aria-describedby`
  exactly matched the `role=tooltip` ID.
- Escape removed only the floating Tooltip and left its trigger focused inside
  the mounted Dialog.
- Popover outside press on the Dialog surface removed only Popover; nested
  Popover Escape removed only the latest floating activation.
- 767 px selected BottomSheet, while 768 and 769 px selected floating Tooltip.
  The presentation-change callback/suppression path is additionally frozen by
  the unit test because the browser viewport harness applies a new emulation
  size on reload rather than dispatching a live resize to the current page.
- At 390×844, Tooltip BottomSheet backdrop dismissal returned focus to the
  trigger.
- Dialog `501` → Tooltip BottomSheet guard `508` → sheet `509` produced one
  effective guard/dim, two modal surfaces, and one runtime-owned document
  scroll lock. Closing the sheet returned focus inside the still-mounted
  Dialog.
