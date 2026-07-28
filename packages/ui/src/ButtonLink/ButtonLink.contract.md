# ButtonLink contract

## Purpose

`ButtonLink` is navigation with the approved `Button` visual language. It is
not an action button and always renders a native `<a>`.

## Semantics

- A real `href` is required.
- Keyboard and assistive-technology behavior comes from the native anchor.
- `target="_blank"` is opt-in and is never inferred from the URL.
- Router integration belongs in application adapters; `@mypoint/ui` remains
  router-independent.
- `Button as="a"` and `Link as="button"` are not part of the public API.

## Proposed API

```ts
type ButtonLinkProps =
  Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "children" | "color" | "href" | "style"
  > & {
    href: string;
    children: React.ReactNode;
    variant: ButtonVariant;
    size?: ButtonSize;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    fullWidth?: boolean;
  };
```

Defaults and required values match `Button` where semantics permit:

```text
variant   required
size      md
fullWidth false
```

## Visual contract

The implementation must share a private, non-polymorphic Button visual layer:

| Size | Typography | Icon | Control height |
|---|---|---|---|
| `sm` | `typography.bodySm` + medium weight | `size.icon.sm` | `size.control.sm` |
| `md` | `typography.body` + medium weight | `size.icon.md` | `size.control.md` |
| `lg` | `typography.bodyLg` + medium weight | `size.icon.lg` | `size.control.lg` |

Variants, padding, gap, radius, focus-visible, light/dark behavior and runtime
brand behavior must stay visually equivalent to `Button`.

## Accessibility

- The anchor owns its accessible name.
- Text-adjacent icons are decorative and normalized by the ButtonLink icon slot.
- There is no disabled prop: native anchors do not support disabled semantics.
  Omit unavailable navigation or render non-interactive text.
- No automatic margins are added.

## Responsive behavior

The selected size is stable across viewport widths. Patterns may choose another
size or full width for a narrow container; the component does not switch
automatically.

## v1 implementation decision

Implemented after extracting the private `Button` visual layer. `Button` and
`ButtonLink` consume the same variant, size, content, icon-slot, full-width and
focus/state class source. Button-only loading, disabled and form behavior
remain outside this component.
