# ActionMenu contract

`ActionMenu` is the semantic responsive command menu. One typed `actions`
array feeds both presentations:

- regular (`width >= breakpoint.md`): anchored, viewport-constrained floating
  surface with `menu` / `menuitem` semantics;
- compact (`width < breakpoint.md`): canonical full-width `BottomSheet` with
  the same list, title, close control, modal hierarchy, safe area and scroll
  mechanics.

Consumers do not select a presentation and do not provide a media-query flag.
Changing presentation while open closes the current menu once and never mounts
both surfaces or reopens automatically.

## Action model

Every action has a stable `id`, visible `label`, optional icon, optional native
disabled state and a sync or async `onSelect`. A danger action must explicitly
choose `confirmation: false` or provide title, confirm and cancel labels. This
discriminated policy prevents accidental unlabeled destructive commands.

Simple confirmation replaces the list inside the current floating surface or
BottomSheet. Cancel returns to the list. Confirm executes once; while a Promise
is pending all actions are disabled and the selected row exposes loading state.
Resolution closes the menu. Rejection keeps it open and remains the consumer's
error/notification responsibility. `onActionError(error, action)` is the
explicit feedback channel. Pending state is always cleared and the action can
be retried. Without the callback the rejection is still consumed as a safe
no-op: ActionMenu never creates an unhandled rejection, notification or
backend-error presentation.

Use `confirmation: false` when `onSelect` opens a controlled `Dialog` for
related entities, typed confirmation, inputs, validation or a multi-step flow.
ActionMenu never creates business notifications or complex dialogs.

## Interaction

The regular list supports ArrowUp, ArrowDown, Home, End, native Enter/Space,
Escape and disabled-item skipping. Tab closes the menu and returns focus to the
trigger. Outside press closes it. Inside a Drawer, the floating branch uses the
Drawer-owned floating portal/layer; compact mode registers one nested modal in
the existing `ModalRuntime`. Adjacent Drawer parent and child triggers retain
their own reference surface without changing workspace architecture.

The trigger is a React element and owns its accessible name. Disabled native
triggers do not open either presentation. Labels and close/title defaults use
the locale foundation (`ru`, `kk`, fallback `en`); business action labels always
come from the consumer.

The trigger exposes `aria-haspopup="menu"` for the regular presentation and
`aria-haspopup="dialog"` for the compact BottomSheet. Floating confirmation
uses a labelled `alertdialog` in the same floating surface. Compact
confirmation is a labelled region inside the existing BottomSheet dialog and
does not create a second dialog landmark.

## Boundaries

- `Dropdown` / `DropdownMenu` remains presentation-stable across breakpoints.
- `Tooltip` is a separate explanatory hover/focus semantic and is not an
  ActionMenu dependency.
- `Popover` is arbitrary anchored content; its public dialog-like role is not
  used as ActionMenu's final semantic wrapper.
- `ModalHeaderActions` is a thin policy composition over ActionMenu. Close is
  not an overflow action; Save/Create/Edit primary commands belong in the modal
  footer. Consumer-owned contextual navigation belongs in `headerLeading` and
  is not modeled by ActionMenu or UI-kit history APIs.

Public import: `@mypoint/ui/action-menu`.
