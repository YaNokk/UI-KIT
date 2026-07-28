# Icons and assets

## Source policy

Lucide is the default source for generic UI icons. Use static named ESM imports:

```tsx
import { Plus, Trash2 } from "lucide-react";
```

Do not use namespace imports, a global string registry, or re-export Lucide
through another package. Application code must not set arbitrary Lucide
`size`, `color`, `strokeWidth`, or `absoluteStrokeWidth`.

Custom Mypoint icons are admitted only when no semantically adequate Lucide
icon exists or a product-specific glyph is required. The repository has no
admitted custom icons yet, so a separate `@mypoint/icons` package is not
introduced. If the catalog becomes non-trivial, use a side-effect-free ESM
package below `packages/icons`; it must depend on React only as a peer and must
not depend on `@mypoint/ui` or re-export Lucide.

## Geometry and tones

The canonical Lucide-compatible line-icon contract is:

```text
viewBox: 0 0 24 24
fill: none
stroke: currentColor
stroke width: icon.stroke.default = 2
line cap/join: round
```

Approved rendered sizes are `size.icon.sm = 16px`, `size.icon.md = 20px`, and
`size.icon.lg = 24px`.

Approved semantic colors are `icon.primary`, `icon.secondary`,
`icon.disabled`, `icon.accent`, `icon.danger`, `icon.success`, and
`icon.warning`. `icon.accent` follows the bounded runtime brand family.
Status tones remain independent from brand. Light/dark themes change aliases,
not icon markup.

The missing roles are intentionally split by layer: stroke is primitive
geometry; danger/success/warning are semantic meanings and alias existing
status foregrounds. None of these roles is responsive.

## Slot ownership

The component that owns an icon slot owns its rendered size, color, alignment,
flex behavior, and accessibility treatment. `Button`, future `IconButton`,
inputs, selects, navigation, tabs, and toolbars therefore accept a React node
and normalize its SVG through the slot. Consumers pass a plain Lucide or
canonical custom icon without sizing or coloring it.

Do not add a generic `Icon` wrapper until a repeated standalone-icon use case
proves that it is needed. Icon-only actions belong to `IconButton`, not
`Button`.

## Accessibility

- An icon next to equivalent visible text is decorative and hidden from
  assistive technology.
- The interactive owner of an icon-only action has an explicit accessible
  name such as `aria-label`; the SVG does not provide it.
- An informative standalone icon needs explicitly designed accessible
  behavior. Prefer adjacent visible text.
- Never infer accessible names from exports, filenames, SVG titles, or backend
  icon strings.

## Asset classification

Classify every visual as `Icon`, `Logo`, `BrandMark`, `Flag`, `Illustration`,
`PaymentMark`, `QR/Barcode visual`, or `Image`. Lucide line rules apply only
to `Icon`. Other classes may preserve their own fills and brand colors.

## Custom icon admission and Figma export

Before adding a custom icon, document:

1. intended meaning and use locations;
2. Lucide and existing custom icons considered;
3. why those alternatives are insufficient;
4. whether the glyph is generic or product/domain-specific;
5. why another asset class is not more appropriate;
6. conformance with the Lucide-compatible visual language.

Figma source uses a 24 × 24 frame, stroke 2, round caps/joins, no fill unless
intentional, `currentColor`, and optical weight compatible with Lucide.

```text
Figma SVG → validation → SVGO → React component → visual review
→ Storybook metadata/gallery → canonical export
```

Validation rejects scripts, `<text>`, embedded raster data, external
references, style blocks, fixed brand colors, a non-24 × 24 viewBox, and fixed
dimensions that prevent contextual sizing. Repository-owned SVGO
configuration must preserve `viewBox` and geometry while removing metadata,
editor attributes, and unnecessary groups.

## Prototype promotion

Temporary SVGs may exist under `prototypes`, but production packages cannot
import them. Promotion inventories assets, searches Lucide and the canonical
catalog, replaces duplicates, classifies the remainder, validates admitted
custom icons, replaces temporary imports, and verifies currentColor, slot
ownership, accessibility, and tree-shaking.

Backend-driven icon names are not a default API. A genuine dynamic
configuration may use a small, explicitly approved static map only.

## Storybook, lint, and packaging

`Foundations / Icons` compares Lucide at 16/20/24, all semantic tones,
light/dark themes, and runtime-brand stress colors. `Icons / Custom` is the
canonical catalog and records each icon's name, meaning, source, rationale,
and status.

Lint rejects namespace Lucide imports, literal Lucide colors, per-icon size or
stroke overrides, and prototype asset imports in reusable UI. Package checks
must keep named ESM exports analyzable and verify that one used Lucide or
custom icon does not retain the full catalog. The clean consumer fixture has a
single-`Search` Lucide entry for this check.

If `@mypoint/icons` is introduced, its tarball, declarations, clean-consumer
installation, and tree-shaking join the existing package checks. Publish order
is `tokens → icons → ui → patterns` according to actual dependencies.
