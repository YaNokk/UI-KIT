# Modal Foundation v1.2

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
| Initial focus | Focuses modal wrapper unless disabled | Provides preventable mount autofocus | DS policy through Radix signal | Explicit ref, then first eligible control, then surface |
| Focus return | `FocusLock` return focus | Provides preventable unmount autofocus | DS policy through Radix signal | Restore child → parent opener → page opener |
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

Ancestor closure immediately deactivates descendants and emits one
`reason: "ancestor"` request. The consumer must reconcile each child from
`open=true` to `open=false`. Until that acknowledgement and a later
`false → true` transition, the invalidated activation remains suppressed.
Development builds warn if a parent becomes active while a controlled child
still exposes the invalidated `open=true`; production remains silent.

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
- `size.overlay.drawer.md = 500px` is provisional and must be visually reviewed
  at 1440×900 and 768×1024 with dense, long and nested content.
- The roles remain independent even while their values match.
- Both are brand-, theme- and mode-independent.
- `breakpoint.md = 768px` is a separate responsive concept.

`closeLabel` remains required until the design system has a verified
translation catalog for canonical control labels.

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
  reported `backdrop`;
- explicit nested initial focus and child → parent opener restoration passed;
- ancestor closure hid the child immediately, emitted one `ancestor`, warned
  once for stale controlled state, suppressed it after parent reopen, and
  allowed a later acknowledged `false → true` activation;
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

Validation commands: `tokens:check`, lint, typecheck, Storybook MCP readiness
and the complete unit suite. Build, Storybook build, pack/consumer and
build-dependent tree-shaking gates are intentionally skipped by `AGENTS.md`.
