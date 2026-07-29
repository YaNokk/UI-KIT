# Modal visual alignment

Status: visual calibration baseline for `Dialog`, `Drawer`, and `BottomSheet`.

The production modal contracts and `docs/modal-foundation.md` remain the
behavior, accessibility, lifecycle, Portal, layering, focus, dismissal,
scroll-lock, and gesture authority. `references/raw/mp-ui-kit/App.tsx` and the
deployed MP UI Kit are visual references only. Canonical design-system tokens
remain the production value authority.

## Audit

| Concern | Designer reference | Current production | Existing DS token | Decision | Final value/source |
| --- | --- | --- | --- | --- | --- |
| Surface background | White/dark raised surface | Raised semantic surface | `background.surface.raised` | Keep | `--ds-background-surface-raised` |
| Dialog width | 400/440/480 px examples | Canonical 500 px constraint | `size.overlay.dialog.md` | Keep; examples are use-case fixtures, not a size API | `--ds-size-overlay-dialog-md` |
| Drawer width | Panel language; no authoritative width | Independent 500 px constraint | `size.overlay.drawer.md` | Keep provisional and independent from Dialog | `--ds-size-overlay-drawer-md` |
| Surface radius | About 12 px | 12 px | `radius.xl` | Keep | `--ds-radius-xl` |
| Surface border | Subtle neutral edge | Subtle semantic border | `border.subtle`, `border.width.default` | Keep | Existing semantic border |
| Surface shadow | Strong modal elevation; prototype uses a larger raw shadow | Canonical large elevation | `shadow.lg` | Keep; raw prototype shadow would bypass the elevation scale | `--ds-shadow-lg` |
| Backdrop color/opacity | `rgb(15 17 23 / 60%)` | Light 56%, dark 68% semantic overlay | `background.overlay` | Keep theme-aware semantic dim | `--ds-background-overlay` |
| Backdrop blur | 3 px in prototype | None | No admitted semantic effect | Reject for v1: glass/blur is not part of current surface language and complicates nested/mobile rendering | No blur |
| Header padding | 24 px inline/top, about 20 px bottom | 24 px on all sides | `space.6`, `space.5` | Tighten bottom while preserving canonical scale | `space.6 space.6 space.5` |
| Header separator | None | Subtle divider | Existing border tokens | Remove; the reference hierarchy reserves separation for the footer | None |
| Body padding | 24 px inline/bottom; visual gap is owned by header | 24 px on all sides | `space.6` | Remove duplicated top padding | `0 space.6 space.6` |
| Footer padding | 24 px inline, 16 px block | Already matches | `space.6`, `space.4` | Keep | `space.4 space.6` |
| Footer separator | Subtle top separator | Subtle top separator | `border.subtle` | Keep | Existing semantic border |
| Title typography | About 17 px semibold | Canonical modal-scale heading | `typography.heading.md` | Keep semantic hierarchy; do not add a 17 px role | `Heading` `md` |
| Description typography | About 13 px muted | Canonical small body, secondary | `typography.body.sm`, `text.secondary` | Keep | `Text` `bodySm` |
| Close action geometry | About 32×32 px | Canonical 32 px action and small icon | `size.control.sm`, `size.icon.sm` | Keep | `IconButton` `sm` |
| Close placement | Header end, aligned with title column | Header end in two-column grid | Existing spacing | Keep without prototype negative offsets | Header grid |
| Body scrolling | Independent scroll area | Independent scroll area | Component layout | Keep | Internal body `overflow: auto` |
| Footer alignment | Actions at end | Slot did not impose alignment | Existing layout primitives | Fix structural mismatch | Internal flex row, `justify-content: flex-end` |
| Button gap | About 10 px | Slot did not impose a gap | `space.2` = 8 px, `space.3` = 12 px | Use the denser canonical action gap | `space.2` |
| Dialog max-height | About 88 viewport percent | Viewport minus 32 px | Component-local geometry | Adopt the calmer reference proportion without exposing API | `88dvh` |
| BottomSheet top radius | About 16 px in one prototype fixture | Canonical 12 px | `radius.xl` | Keep shared large-surface radius; 16 px is a prototype-only difference | `--ds-radius-xl` top corners |
| BottomSheet handle | About 40×4 px | 32×4 px | `space.10`, `space.1` | Align to the live reference using existing tokens | `space.10 × space.1` |
| BottomSheet header padding | About 20 px inline, compact block spacing | Shared 24 px header | `space.5`, `space.2`, `space.4` | Use sheet-specific density | `space.2 space.5 space.4` |
| BottomSheet body padding | About 20 px inline, 12 px bottom | Shared 24 px body | `space.5`, `space.3` | Use sheet-specific density | `0 space.5 space.3` |
| BottomSheet footer/safe area | About 20 px inline, 12 px top, 24 px bottom plus safe area | Shared footer plus surface safe area | `space.5`, `space.3`, `space.6` | Preserve runtime safe-area ownership and tighten the visual row | `space.3 space.5 space.6` plus `env(safe-area-inset-bottom)` |

No new token is admitted: every reusable role already exists. The only new
values are private layout policy (`88dvh`) and relationships composed from
existing spacing tokens.

## Browser baseline

The deployed MP UI Kit was inspected in the Modal section on 2026-07-29.
Its live create dialog confirms:

- left-aligned title and description with a 32 px close action at the end;
- no header divider and a compact transition from header to fields;
- a separated footer with intrinsic-width secondary and primary actions at
  the end;
- a 12 px surface radius and visibly strong elevation;
- a dark dim layer with blur.

The current production long-content story showed the main P1 differences:
duplicated header/body vertical spacing, a header divider, and a surface that
could extend almost edge-to-edge vertically. Footer alignment was a P0
structural gap because the container did not own the required action row.

The aligned production stories were then reviewed at 1440×900, 768×1024, and
390×844. Dialog retained an 8 px compact-screen gutter, Drawer switched to its
documented compact full-viewport presentation below `md`, and BottomSheet kept
its bottom anchoring, scroll container, and safe-area ownership. Light and dark
mode were checked independently; the dark surface and 68% dim came from the
existing semantic theme rather than reference colors.

## Intentional deviations

- Dialog remains 500 px rather than copying the prototype's 400/440/480 px
  examples.
- The semantic overlay remains theme-aware at 56%/68%; raw prototype RGBA is
  not copied.
- Backdrop blur is rejected for v1.
- Canonical `shadow.lg`, `Heading md`, `Text bodySm`, Button, and IconButton
  remain authoritative even where the prototype uses raw values.
- BottomSheet keeps the shared 12 px large-surface radius instead of adding a
  sheet-only 16 px token.
- The action gap is canonical 8 px rather than the prototype's approximate
  10 px.

## Freeze boundary

This pass may change modal CSS and visual calibration stories only. It does
not change public props, `ModalRuntime`, Radix ownership, focus behavior,
close reasons, outside/Escape arbitration, controlled invalidation, Portal,
layers, scroll locking, VisualViewport behavior, or gesture thresholds.

Any Radix upgrade still follows the upgrade baseline in
`docs/modal-foundation.md`; this visual document does not replace it.
