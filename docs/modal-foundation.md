# Modal Foundation v1.4

## Status

Implementation specification for the first `Dialog`, `Drawer` and
`BottomSheet` integration. `ModalRuntime` owns relationships between modal
surfaces. Radix is a private, replaceable implementation dependency for the
mechanics of one surface.

The observations below apply to pinned
`@radix-ui/react-dialog@1.1.23`. They are version-specific implementation
evidence, not Radix public contracts. Every Radix upgrade must rerun the nested
focus, nested scroll-lock, scrollbar compensation, Portal integration,
Escape/outside arbitration and SSR suites.

## Ownership audit

| Concern | Core DS behavior | Radix 1.1.23 observed behavior | Final owner | Decision |
| --- | --- | --- | --- | --- |
| Focus containment | `react-focus-lock` in `BaseModal` | Modal `Content` composes a trapped focus scope | Radix per surface, DS contract | Adopt mechanics; browser-test nested scope suspension |
| Initial focus | Focuses modal wrapper unless disabled | Provides preventable mount autofocus | Radix default; DS explicit override | A valid explicit ref overrides; otherwise Radix owns tabbability discovery |
| Focus return | `FocusLock` return focus | Provides preventable unmount autofocus | DS fallback through Radix signal | Valid opener → parent surface/opener → Radix safe fallback |
| ARIA isolation | Modal wrapper and focus lock; isolation is not hierarchy-aware | Modal content uses `aria-hidden` isolation | Radix per surface | Adopt only after nested browser verification |
| Escape | Wrapper keydown stops propagation | Dismissable layer emits a preventable top-layer signal | ModalRuntime | Only the active top entry may request close |
| Outside interaction | Backdrop mouse-down/up target validation | Dismissable layer emits preventable outside signals | ModalRuntime | Drawer always prevents; Dialog/BottomSheet follow `dismissOnBackdrop` |
| Portal | Core portal defaults to body/container | Radix offers its own portal | DS Portal | Preserve provider host / explicit element / `null` reset contract |
| Scroll locking | `react-remove-scroll` plus legacy iOS helpers | Source audit shows scroll-lock behavior on the modal Overlay path | ModalRuntime | **Variant B selected:** runtime-owned document lock; Radix Overlay lock path is not used |
| Stack | Numeric stack context | Dismissable layers coordinate per-surface ordering | ModalRuntime | Parent hierarchy and activation order never depend on DOM order |
| Guard and dim | Backdrop combines interaction and visuals | Overlay is a per-dialog surface | ModalRuntime | One active `ModalGuard`; dim is an optional visual state |
| Nested modal | Independent mounted primitives | Nested focus/dismiss primitives are supported mechanically | ModalRuntime | Runtime owns parent branch, guard, invalidation and layering |
| Gesture | BottomSheet uses `react-swipeable` plus custom arbitration | Not owned by Dialog | BottomSheet controller | Dependency is an input adapter only if its spike passes |
| VisualViewport | BottomSheet subscribes to viewport resize/scroll | Not owned by Dialog | BottomSheet | Guarded client-only subscription |
| Responsive policy | Public responsive variants/breakpoints | Not owned by Dialog | DS | Canonical `breakpoint.md`; no public numeric breakpoint |

## Blocking scroll-lock decision

**Decision: Variant B — `ModalRuntime` owns the only document scroll lock.**

The browser spike used pinned Radix 1.1.23, the current DS `Portal`, one
effective top Overlay/guard, `Drawer → Dialog` and `Dialog → Dialog`.

Observed:

- opening Drawer set the document lock and outside pointer isolation;
- transferring the single top Overlay to a nested Dialog retained one lock
  owner (`data-scroll-locked="1"`) and one guard;
- closing the nested Dialog kept the document locked;
- closing roots restored the original document styles;
- Escape dismissed one Dialog at a time;
- nested focus moved into the child surface;
- rendering the primitive through `react-dom/server` did not access missing
  browser globals.

Variant A failed its required geometry assertion: removing the scrollbar
changed `documentElement.clientWidth` from 1265px to 1280px and moved a fixed
right-edge probe by approximately 15px. Radix applies body compensation, but
fixed/sticky consumers require implementation-specific opt-in classes. The DS
cannot require application elements to know Radix internals.

Production therefore does not render Radix `Dialog.Overlay` and does not rely
on its observed `react-remove-scroll` path. `ModalRuntime` locks according to
active, non-invalidated entries, compensates the document without moving
fixed/sticky viewport geometry, and restores the captured state only on
`1 → 0`. Radix `Content` remains responsible for per-surface focus, ARIA
isolation, dismissable signals and presence.

## Public lifecycle contract

Components are controlled-only. A DS-initiated close emits
`onOpenChange(false, { reason })` at most once per activation. A later
consumer-driven `open=false` does not echo the callback.

Ancestor closure immediately deactivates the currently registered descendants
and emits one `reason: "ancestor"` request per activation. Invalidation is
tied to the exact internal instance id and activation version. A normally
rerendered instance remains suppressed until `false → true`; an unmounted and
later remounted component receives a new logical identity and is not matched
to an old tombstone. Tombstones are never transferred by `parentId + kind`,
so same-kind siblings cannot suppress one another.

## Layer contract

`MODAL_LAYER_STRIDE = 8` is private:

```text
+0 guard
+1 surface
+2..+6 future child floating range
+7 reserve
```

Tests assert only:

```text
parent surface
< child floating overlay
< nested modal guard
< nested modal surface
```

Concrete z-index values are not public behavior.

## Tokens

- `size.overlay.dialog.md = 500px` is the canonical constrained Dialog width.
- `size.overlay.drawer.md = 500px` is the default Drawer geometry.
- `size.overlay.drawer.lg = 600px` is the admitted dense-form geometry.
- The roles remain independent even while their values match.
- Both are brand-, theme- and mode-independent.
- `breakpoint.md = 768px` is a separate responsive concept.

`closeLabel` remains required until the design system has a verified
translation catalog for canonical control labels.

## Responsive consumption

Modal surfaces consume the generated responsive artifacts described in
`responsive-foundation.md`; they do not own raw breakpoint values.
`ModalPrimitive` uses `--ds-below-md`, generated from canonical
`breakpoint.md`, for the existing compact Drawer and Dialog presentation.

The exact behavior remains:

```text
width < 768px  → compact Drawer/Dialog presentation
width >= 768px → regular presentation
```

Breakpoints are static build/design configuration. They do not vary by
runtime brand, theme, locale, backend input or `DesignSystemProvider`.
Dialog and Drawer are frozen against this boundary. BottomSheet does not
consume `md` merely because it is mobile-first; its real-device gesture and
VisualViewport hardening remains a separate track.

## BottomSheet gesture spike

`react-swipeable@7.0.2` was evaluated separately after Dialog and Drawer were
implemented. A downward drag on the sheet handle produced the expected
direction, distance and velocity data. The same drag beginning inside the
scrollable body still produced `onSwipedDown` while the body had
`scrollTop=260`. The library therefore does not own the required inner-scroll
priority and would still require a custom target/scroll guard plus visual
offset state.

Decision: do not add `react-swipeable`. BottomSheet uses a private pointer
adapter which starts only for touch/pen, ignores horizontal and upward
gestures, gives a non-zero inner scroll position priority, and keeps the
private `0.4 px/ms` or `20%` dismissal thresholds.

## v1.2 browser freeze baseline

Validated in Storybook dev mode at 390×844, 768×1024 and 1440×900:

- Drawer → Drawer, Drawer → Dialog and Dialog → Dialog kept one effective
  guard, one document lock and top-only Escape/pointer arbitration;
- Drawer guards never dismissed on outside pointer; Dialog and BottomSheet
  reported `backdrop` only after a completed down/up sequence on the same
  effective guard;
- explicit nested initial focus and child → parent opener restoration passed;
- ancestor closure hid the registered child immediately and emitted one
  `ancestor`; a different same-kind remount was treated as a new instance
  without tombstone leakage;
- layer probes observed guard `+0`, surface `+1`, floating `+2` and nested
  surface `+9` relationships without asserting the public meaning of numbers;
- nested provider Portal content remained inside its dark/runtime-brand scope;
- with a classic 15 px scrollbar, lock kept `clientWidth=1425` and the fixed
  probe at `x=1393` before and during lock; closing restored `scrollY=420`;
- Drawer covered the 375 px client area at the 390 px viewport override and
  used the independent 500 px width at the 768 px breakpoint;
- BottomSheet tracked `VisualViewport.height=844`, retained input focus/value,
  used one guard, and kept its scroll body independently scrollable.

The private gesture adapter also has a deterministic pointer test for swipe
dismissal and non-zero inner-scroll priority.

Dialog and Drawer are frozen at this baseline. BottomSheet tracks only
`VisualViewport.height` while active to reduce keyboard overlap; it does not
claim verified keyboard positioning, `offsetTop` handling or full mobile
viewport resilience. BottomSheet remains mobile-hardening pending until those
real-device geometry and gesture checks pass.

## v1.3 corrective browser baseline

Revalidated against the Storybook dev server after the identity, focus,
backdrop and gesture corrections:

- Radix default focus skipped native hidden, CSS-hidden, disabled and inert
  candidates and selected the first visible eligible control. An explicit ref
  to a hidden control fell back to the same Radix discovery path.
- When a nested Dialog opener was removed before close, DS restoration focused
  the parent Drawer surface. Radix remains the fallback when DS has no valid
  opener or ancestor target.
- Invalidating child A emitted `child-A:ancestor`; mounting same-kind sibling B
  and reopening the root displayed B immediately. No tombstone was transferred
  across the remount.
- A completed pointer down/up on the Dialog guard emitted one `backdrop`.
  Guard drag into the surface left the Dialog open. The same outside click left
  Drawer open.
- At 390×844 the active BottomSheet surface height equalled
  `VisualViewport.height=844`; its body had `overflow-y: auto` and a real wheel
  interaction changed `scrollTop` from `0` to approximately `450` without
  dismissing the sheet.
- At 768×1024 Dialog retained its independent 500 px width and one document
  lock. At 1440×900 Drawer retained its independent 500 px width, one guard and
  one document lock.

Touch velocity/distance arbitration and nested scroll-owner selection are
covered deterministically by pointer tests. Full mobile keyboard positioning,
`offsetTop`, real-device touch physics and safe-area combinations are still
outside the frozen promise and remain BottomSheet hardening work.

## v1.4 responsive freeze baseline

Revalidated in a fresh Storybook dev process with the generated responsive
artifact and PostCSS expansion active:

- loaded component CSS contained the static
  `@media (width < 768px)` fallback and no unresolved
  `--ds-below-md` reference;
- at 767 CSS px Drawer used the compact viewport-cover width and zero radius;
- at 768 CSS px Drawer used the regular independent 500 px width and regular
  leading radius;
- the next-above-boundary browser override remained regular; exact 767/768/769
  classification is also covered by the generated TypeScript boundary test;
- Radix default focus still selected the visible eligible control;
- ancestor invalidation still emitted once for child A and did not suppress
  remounted sibling B;
- a completed Dialog guard click still emitted `backdrop`;
- Drawer outside interaction remained blocked and document lock stayed active.

No `ModalRuntime`, focus, identity, backdrop or scroll-lock architecture
changed in v1.4. Dialog and Drawer are frozen. BottomSheet API remains stable
with the previously documented mobile-hardening work outstanding.

## Drawer geometry and modal chrome additive pass

Drawer registers its semantic `md | lg` size with the existing ModalRuntime.
For an adjacent pair, the child view receives only the parent size enum and CSS
resolves the matching token. There is no measurement, new stack, consumer
offset, focus manager or scroll lock. Compact presentation still covers the
viewport regardless of size.

Drawer body is the sole flexible scroll region. Header and footer remain
intrinsic siblings. Public modal chrome separates a neutral consumer-owned
`headerLeading` slot, heading, trailing overflow actions and the canonical
final close control. The UI-kit owns region geometry; contextual history,
Router and entity/workspace navigation remain consumer feature concerns. See
`modal-chrome.md`.

Validation commands: `tokens:check`, lint, typecheck, Storybook MCP readiness
and the complete unit suite. Build, Storybook build, pack/consumer and
build-dependent tree-shaking gates are intentionally skipped by `AGENTS.md`.

Responsive header commands are owned by ActionMenu, not ModalRuntime. Regular
ActionMenu uses the modal-local floating container and stays below the next
modal guard. Compact ActionMenu reuses BottomSheet, therefore registers as the
top nested modal branch, shares the one document lock and restores focus to its
trigger. No new guard, stack or adjacent-Drawer rule is introduced.
