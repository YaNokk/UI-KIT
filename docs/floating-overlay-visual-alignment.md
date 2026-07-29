# Floating overlay visual alignment

The MP UI Kit is a visual reference only. Production values come from
canonical design-system tokens and private component geometry.

## Audit

| Concern | Designer reference | Existing DS role | Decision | Final source |
| --- | --- | --- | --- | --- |
| Popover surface | Neutral raised panel | `background.surfaceRaised` | Use existing theme-aware surface | Semantic raised surface |
| Popover text | Normal application text | `text.primary` | Keep canonical content semantics | Consumer primitives / inherited text |
| Popover radius | Compact rounded panel | `radius.lg` | Use existing 8 px control/panel radius | `radius.lg` |
| Popover border | Thin neutral border | `border.subtle` | Use existing semantic border | Default border width + subtle color |
| Popover padding | Compact panel spacing | `space.3` | Use 12 px canonical spacing | `space.3` |
| Popover elevation | Medium floating elevation | `shadow.md` | Use existing elevation | `shadow.md` |
| Popover width | Content width; dropdown patterns may match trigger | Component geometry | Cap ordinary content and support semantic trigger matching | Private max width + `matchTriggerWidth` capability |
| Tooltip surface | Dark neutral on any page surface | Missing inverse informational surface | Admit reusable inverse surface role | `background.inverse` |
| Tooltip text | White compact text | Missing inverse neutral text role | Admit reusable inverse text role | `text.onInverse` |
| Tooltip typography | About 12 px medium | `typography.caption` | Use canonical compact role | Caption typography |
| Tooltip padding | About 10×6 px | `space.2`, `space.3` | Use canonical 8×12 relationship | Block `space.2`, inline `space.3` |
| Tooltip radius | Compact rounded shape | `radius.md` | Use existing 6 px radius | `radius.md` |
| Tooltip shadow | Subtle/medium floating elevation | `shadow.md` | Use existing elevation | `shadow.md` |
| Tooltip arrow | Same color as surface | Inverse surface + component geometry | Private 8 px rotated square | `space.2`, `background.inverse` |
| Sheet surface | Existing DS BottomSheet | Existing modal roles | Do not specialize/fork | BottomSheet |
| Sheet title/body | Compact informational content without a redundant generic heading | Existing modal title semantics and body spacing | Keep a private localized accessible title visually hidden; render shared content as body | Tooltip + BottomSheet composition |
| Sheet footer | No action row for informational content | Optional modal footer | Omit | No footer |
| Sheet safe area | Handle and safe-area bottom spacing | Existing BottomSheet | Reuse unchanged | BottomSheet |

## Token admission

The designer requires a dark neutral Tooltip in both light and dark themes.
`background.surfaceRaised` is theme-dependent and becomes light in the light
theme; `background.overlay` is translucent and semantically a dim layer.
Neither expresses a solid inverse informational surface.

Two reusable neutral roles are therefore admitted:

```text
background.inverse
text.onInverse
```

They are expected to serve Tooltip, future teaching bubbles, keyboard shortcut
hints, and other compact inverse informational surfaces. Both are
brand-independent, status-independent, and responsive-independent.
Light/dark currently map to the same neutral pair so contrast and designer
intent remain stable across themes.

No Tooltip/Popover-specific color, spacing, radius, shadow, arrow, breakpoint,
or BottomSheet tokens are added.

## Intentional deviations

- Raw prototype colors, shadows, 12 px typography, padding, and arrow borders
  are not copied.
- Popover uses the canonical theme-aware raised surface rather than prototype
  Tailwind/Radix styling.
- Tooltip uses canonical caption typography and 8/12 px spacing.
- Compact Tooltip is a real DS BottomSheet, not the prototype’s inline touch
  alternatives or a forked action sheet.
- The sheet has no default action footer; the canonical close action and swipe/
  backdrop behavior are sufficient.
