# Floating overlay foundation

Status: v1.3.1 dismiss lifecycle correction freezes private floating
infrastructure, `Popover` v1, and responsive `Tooltip` v1 before Select
Foundation.

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
| Mobile title | Core leaves naming to BottomSheet props | Not applicable | Locale context and required modal title | Tooltip | Private generic localized accessible title is visually hidden; no mobile-only public prop |
| Popover role | Core is a positioning primitive | `useRole`, click/dismiss hooks | Public DS component conventions | Popover + private semantics | Public default is non-modal `dialog`; internal DS role supports listbox/menu/tooltip/no role |
| Outside dismiss | Core Tooltip listens on document; Core Popover delegates positioning only | Event signals | Parent modal remains authoritative | Private foundation | Same-surface controls continue; modal guard is consumed after child dismiss |
| Escape | Core desktop does not provide complete modal arbitration | Dismiss hooks plus DOM capture | ModalRuntime/Radix parent | Private foundation | Open floating child consumes first Escape; parent modal remains open |
| Focus | Core leaves focus largely on trigger | Reference/floating prop getters | Native focus and ModalRuntime | Component | Tooltip keeps trigger focus; Popover has no trap or automatic focus transfer |
| Placement | Core exposes Popper placements | Vendor placement accepted at final engine call | No public raw geometry | Private DS placement contract | Popover exposes 12 DS placements; Tooltip exposes a four-side DS subset |
| Arrow | Core Popover supports arrow | `arrow()` middleware | Spacing/radius/surface tokens | Tooltip | Tooltip only in v1; private geometry |
| Width matching | Core exposes anchor-width behavior | `size()` middleware | Component capability | Popover | `matchTriggerWidth` means exact trigger width, viewport-constrained |
| Portal | Core accepts portal-container callbacks | Floating UI does not require its Portal | Canonical DS Portal/provider host | DS Portal | Floating surfaces always render through DS Portal |
| Layer | Core accepts raw z-index/stack context | Positioning is layer-agnostic | `ModalLayerContext`, `zIndex.popover` | Private floating layer adapter | Five modal floating layers `+2…+6`; overflow clamps and warns in DEV |
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

Public `Popover` remains dialog-like for its current interactive-panel use
cases, but this is not a universal foundation invariant. The private adapter
accepts the DS-owned `FloatingSemanticRole` (`dialog`, `tooltip`, `listbox`,
`menu`, or no role). A future Select can therefore own `listbox` semantics
without a public Popover `role` prop or nested generic dialog semantics.

`FloatingPlacement` is likewise DS-owned. Only the final call inside the
Floating UI adapter converts it to the vendor placement type; public and
private architectural inputs contain no Floating UI type.

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

Four related DOM regions remain distinct:

- the **reference region** owns Floating UI positioning and the configured
  reference interaction such as `useClick`;
- the **floating region** contains the positioned surface and is internal to
  outside-pointer dismissal;
- the optional private **outside-press boundary**
  (`outsidePressBoundaryRef`) extends only the DOM region treated as internal
  by outside-pointer dismissal;
- the **focus-containment region** is component-owned and determines whether a
  focus move stays internal.

`outsidePressBoundaryRef` does not expand the Floating UI reference, handle
Escape, alter focus-out, reorder the nested overlay activation stack, or
participate in modal focus management. Select/MultiSelect use their outer
FieldShell as this boundary so clear and chip-remove pointer interactions do
not dismiss an open panel.

Outside a modal, floating surfaces use `zIndex.popover`. Inside a modal they
consume `ModalLayerContext.floatingLayer`; nested floating surfaces advance
within the private reserved range. The next modal guard/surface therefore
remain above all floating descendants.

The practical supported modal depth is five simultaneous floating surfaces:
`+2`, `+3`, `+4`, `+5`, and `+6`. A sixth surface requests `+7`, is
deterministically clamped to `+6`, and emits one DEV warning containing the
parent modal identity. Production does not crash or exceed the next modal
guard. The clamp is a safety fallback, not support for arbitrary nesting.

While an open floating child is present, its first Escape is consumed at the
window capture boundary. A document-scoped activation stack ensures only the
latest floating surface reacts, before a parent Dialog can process the same
keyboard event. Outside press uses the same topmost arbitration with a target
policy:

- a control inside the same parent modal surface dismisses the floating child
  and receives its original interaction exactly once;
- a parent modal guard/backdrop dismisses the floating child and consumes that
  pointer sequence, so the parent does not also close;
- an unrelated higher modal surface is left alone;
- ordinary page Popover dismissal continues to the page target.

Floating Tooltip never traps or moves focus. Popover also remains non-modal
and does not lock scroll or create a guard.

`matchTriggerWidth` is frozen as exact inline-size equality with the reference
width, after viewport constraints. This matches the public name and existing
behavior. A future Select requirement for “minimum reference width with
content growth” must introduce a separately named capability instead of
silently changing this contract.

Compact Tooltip keeps the localized generic label (`Tooltip`, `Подсказка`,
`Кеңес`) as BottomSheet's accessible title but visually hides it. The shared
informational content remains the visible body; focus containment and the
localized close action are unchanged. No public mobile title prop is added.

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

## v1.2 freeze corrections baseline

The corrective browser regression confirmed:

- one Save click inside the parent Dialog dismissed Popover and activated Save
  exactly once; the Dialog remained open;
- one parent guard click dismissed Popover without dismissing the Dialog;
- trigger click toggled the open Popover once;
- Drawer → Dialog → Popover produced two modal surfaces and floating layer
  `510`, immediately above the child Dialog surface `509`;
- five supported nested surfaces used `502…506`; the sixth stayed at `506`
  and never crossed the next modal guard `508`;
- desktop Dialog → Tooltip remained `501 → 502`, and first Escape left the
  Dialog mounted;
- mobile Dialog → Tooltip remained Dialog `501`, one guard `508`, sheet `509`;
- the mobile sheet retained the accessible name “Tooltip” while its generic
  title marker was visually hidden.

An in-memory TypeScript declaration emit inspected the root, Popover, and
Tooltip declarations. They contain no `@floating-ui/react`, `FloatingContext`,
middleware, or BottomSheet internals.

## v1.3 final hardening — activation stack lifetime

The final hardening pass decoupled the document-scoped activation stack
from React render lifecycles:

- **Activation order is logical open order.** An overlay registers into the
  `WeakMap<Document, symbol[]>` stack when it transitions to open, keeps its
  position while it stays open, unregisters on close or unmount, and a later
  `false → true` reopen creates a new activation order.
- **Rerender does not reactivate.** Callback identity changes
  (`onOpenChange` inline wrappers, consumer rerenders) no longer unregister
  or re-register an open overlay; controlled rerenders cannot move an overlay
  to the top of the stack.
- **Latest callback semantics.** Dismiss handlers invoke the freshest
  `onOpenChange` via a latest-value ref, so fixing stack lifetime does not
  freeze stale closures. Dismiss configuration (`dismissOnEscape`,
  `dismissOnOutsidePress`) is read at event time.
- **Duplicate safety.** Registration defensively removes any stale token
  entry before appending (with a DEV warning); React StrictMode effect replay
  leaves at most one registration per active overlay instance, and unmount
  removes the token exactly once.
- **Topmost arbitration** is derived only from the logical activation stack —
  never from DOM order, portal order, effect execution order, or z-index.
- **ownerDocument migration** is a legitimate re-registration trigger: if the
  reference element's document identity changes, the overlay unregisters from
  the old document and registers into the new one.
- **Cross-realm checks.** Outside-target classification resolves `Node` /
  `Element` constructors from `ownerDocument.defaultView` instead of the
  main window, so iframe or alternate-window nodes are handled by the correct
  realm. Full cross-realm browser verification (an overlay positioned against
  a real iframe document) remains an unsupported scenario and is not part of
  the frozen contract; helper-level realm resolution is covered by unit
  regression through the standard jsdom realm.

Regression coverage added for the freeze:

- open A → open B → rerender A with a new inline `onOpenChange` identity →
  Escape closes B first, second Escape closes A;
- identical setup for outside press — B arbitrates first;
- rerender with a new callback implementation still invokes the latest
  callback on dismiss;
- dismiss configuration toggles apply at event time without re-registration;
- StrictMode replay keeps a single registration and correct A < B order;
- unmount cleanup removes the token exactly once;
- close → reopen creates a new activation order;
- Dialog with Popover A and Popover B (opened later): rerendering A keeps
  Escape order B → A while the Dialog stays mounted.

## v1.3.1 dismiss lifecycle correction

The activation/listener effect now depends only on logical lifecycle inputs —
`open` and `ownerDocument` — so dismiss configuration can no longer
unregister/re-register an open overlay:

- **Dismiss configuration is event-time state.** `dismissOnEscape` and
  `dismissOnOutsidePress` live in a latest-value ref that dismiss handlers
  read when an event fires; they never drive registration lifetime.
- **Config changes do not reactivate.** Toggling dismiss props, changing
  `onOpenChange` identity, or rerendering while open never unregisters and
  re-appends the overlay token, so activation order stays the logical open
  order. `activationEpoch` increments only on logical open/close transitions
  and `ownerDocument` migration.
- **`ownerDocument` migration remains the only non-open/close
  re-registration case.** Moving the reference element to another document
  unregisters from the old stack and registers into the destination stack as a
  genuine lifecycle transition.
- **Registration is unconditional once open.** Listeners attach for every open
  overlay (including ones that currently disable both dismiss policies), so a
  later config toggle applies without touching stack position.

Regression coverage added for the correction:

- open A → open B → toggle A `dismissOnEscape` → Escape closes B first,
  second Escape closes A;
- open A → open B → toggle A `dismissOnOutsidePress` → outside press
  arbitrates B first, then A;
- latest `dismissOnEscape` / `dismissOnOutsidePress` values apply at event
  time without reordering;
- dismiss config churn plus new `onOpenChange` identity never moves A above
  B;
- nested Dialog with Popover A and later-opened Popover B: A config rerenders
  keep Escape order B → A and outside-press arbitration on B while the Dialog
  stays mounted.
