# Single-line control typography

Flex alignment centers a font line box, not the visible glyphs. Fixed-height controls therefore use the internal single-line typography foundation instead of local pixel nudges or changes to global body typography.

## Roles

- `controlTextSm/Md/Lg`: Button, ButtonLink and Select trigger values.
- `compactControlTextSm/Md`: Tag and private MultiSelect chips/summaries.
- `counterText`: Badge and future compact counters.
- `choiceControlLabel`: Select option/action primary labels and future single-line Checkbox, Radio and Switch labels.

Each role owns its font metrics and its optical block offset. The current calibrated offset is the canonical zero spacing token; progressive `text-box-trim` is applied only in the shared foundation. Component CSS must not add `translateY`, `top`, `padding-top` or `inset-block-start` to text labels.

## Audit decisions

Button, ButtonLink, Tag, Badge, private MultiSelect chips, Select trigger and Select option/action labels use the shared roles. Tooltip remains normal compact flowing text because its content can wrap. LinkButton is link-like and may wrap. Input-family editors keep frozen FieldShell/caret geometry. IconButton and StatusIndicator have no visible text. Tabs, segmented controls, menu items, pagination and fixed-height breadcrumbs are not present. Future choice controls should use `choiceControlLabel` only for a single-line label; multi-line label/description blocks use normal flow.

## Calibration baseline

The Storybook story `Foundations/SingleLineControlTypography/Matrix` waits for `document.fonts.ready`, checks the intended Inter-first stack, and covers Latin, Cyrillic, digits, symbols, descenders, role weights and control sizes. The frozen automated baseline is Chromium on Windows at 100% zoom. A stable 125% runner is not configured, so no cross-engine or 125% optical-equivalence claim is made.

Story-only center guides cross the physical center of each control. Review visible glyph balance rather than treating DOM rectangle centering as optical measurement. The targeted `npm run typography:check` gate prevents new component-local optical hacks while allowing the shared foundation and unrelated component geometry.
