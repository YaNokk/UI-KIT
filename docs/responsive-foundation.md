# Responsive Foundation v1

## Status

This foundation makes viewport breakpoints a build-time design-system
contract. It does not make device classification a component API and does not
add runtime breakpoint configuration to `DesignSystemProvider`.

## Source of truth

The canonical DTCG-compatible source is:

```text
packages/tokens/src/primitive/primitive.tokens.json
└ breakpoint.md = 768px
```

The existing `sm`, `md`, `lg`, `xl` and `2xl` scale is retained. New
breakpoints are not added until a real layout failure requires them.

`packages/tokens/scripts/generate.mjs` produces all authoring consumers:

```text
primitive.tokens.json
├ generated/responsive.css
│  ├ --ds-below-md: width < 768px
│  ├ --ds-md-up:    width >= 768px
│  └ --ds-xl-up:    width >= 1280px
├ src/generated/responsive.ts
│  ├ breakpoints
│  └ mediaQueries
└ generated/tailwind.css
   └ static --breakpoint-* theme values
```

Generated files are never edited manually. `npm run tokens:check` verifies
freshness and then runs the responsive governance check.

## CSS authoring and distribution

Reusable UI authors use generated custom media:

```css
@media (--ds-below-md) {
  /* compact presentation */
}
```

CSS custom properties are not used inside media conditions. The root PostCSS
pipeline injects `generated/responsive.css` as global authoring data and
expands custom media through `postcss-custom-media`. The definitions are
removed from compiled component output, so published UI CSS contains ordinary
static media queries and does not require browser support for custom media.

`@mypoint/tokens/responsive.css` is the package-owned CSS authoring artifact.
Applications that author the same custom-media names must use an equivalent
PostCSS expansion pipeline; importing the file alone is not a runtime
polyfill.

## TypeScript representation

`@mypoint/tokens` exports:

```ts
breakpoints.md        // 768
mediaQueries.belowMd  // "(width < 768px)"
mediaQueries.mdUp     // "(width >= 768px)"
mediaQueries.xlUp     // "(width >= 1280px)"
```

These constants support internal JavaScript policy when a concrete consumer
needs `matchMedia`. There is no public `useBreakpoint` hook. `@mypoint/ui`
does not copy or republish a second breakpoint registry.

## Exact boundary

The v1 boundary is gap-free:

| Viewport width | Boundary result |
| --- | --- |
| 767px | `belowMd`, compact |
| 768px | `mdUp`, regular |
| 769px | `mdUp`, regular |

Do not replace this with a separately maintained `max-width: 767px`
convention.

## Breakpoint versus presentation policy

`breakpoint.md` is a raw layout threshold. It is not a permanent declaration
that every viewport below it is a mobile device.

Future `ResponsiveOverlay` and `Select` work should depend on an internal
presentation policy:

```text
viewport threshold
+ pointer / hover / coarse-input capability when justified
→ compact or regular overlay presentation
```

That policy may select Popover or BottomSheet without exposing raw geometry in
their public APIs. `ResponsiveOverlay` is intentionally not implemented by
this foundation.

## Tailwind and Storybook

Tailwind breakpoint theme values are generated from the same DTCG tokens as
CSS and TypeScript. The generated Tailwind bridge uses static dimensions
rather than media conditions containing CSS variables.

Storybook viewport presets such as 390×844, 768×1024 and 1440×900 are testing
conveniences only. They do not define or override token values.

## Governance

`scripts/check-responsive-foundation.mjs` reads the canonical `md` token and
rejects production CSS under `packages/ui/src` when a media condition authors
that raw literal directly. Token sources, generated artifacts, tests,
documentation and `references/raw` are outside that production scan.

The rule targets responsive conditions rather than banning the number `768`
repository-wide. Component-size suffixes such as
`size.overlay.dialog.md = 500px` remain unrelated to `breakpoint.md`.

## Validation

Required checks:

- generated artifacts are fresh;
- custom media expands to ordinary media syntax;
- TypeScript values preserve the exact boundary;
- production UI contains no raw canonical `md` media condition;
- browser behavior is compact at 767px and regular at 768px/769px;
- modal focus, lifecycle, backdrop and scroll-lock regressions remain green.

