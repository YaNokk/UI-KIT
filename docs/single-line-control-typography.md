# Single-line control typography

Flex alignment centers a font line box, not the visible glyphs. Fixed-height controls therefore use the internal single-line typography foundation instead of local pixel nudges or changes to global body typography.

## Roles

- `controlTextSm/Md/Lg`: Button, ButtonLink and Select trigger values.
- `compactControlTextSm/Md`: Tag and private MultiSelect chips/summaries.
- `counterText`: Badge and future compact counters.
- `choiceControlLabel`: Select option/action primary labels and future single-line Checkbox, Radio and Switch labels.

Each role owns its font metrics and its optical block offset. The current calibrated offset is the canonical zero spacing token. Production keeps the complete font line box: `text-box-trim` and `text-box-edge` are forbidden because cap/alphabetic trimming can remove Latin, Cyrillic, Kazakh Cyrillic and fallback-font descenders. Optical correction may move only the intact inner typography wrapper. Component CSS must not add `translateY`, `top`, `padding-top` or `inset-block-start` to text labels.

## Clipping architecture

Controls that truncate horizontally use two layers: an outer clip wrapper owns `min-inline-size`, `overflow`, ellipsis and `white-space`; its inner wrapper owns the typography role and optional optical offset. Tag, Badge, Select trigger/options/actions and MultiSelect chips/summaries follow this structure. Button does not need a clip wrapper because its label wraps rather than ellipsizes. No typography wrapper may also own `overflow: hidden`.

## Audit decisions

Button, ButtonLink, Tag, Badge, private MultiSelect chips, Select trigger and Select option/action labels use the shared roles. Tooltip remains normal compact flowing text because its content can wrap. LinkButton is link-like and may wrap. Input-family editors keep frozen FieldShell/caret geometry. IconButton and StatusIndicator have no visible text. Tabs, segmented controls, menu items, pagination and fixed-height breadcrumbs are not present. Future choice controls should use `choiceControlLabel` only for a single-line label; multi-line label/description blocks use normal flow.

## Calibration baseline

The Storybook stories `Foundations/SingleLineControlTypography/Matrix` and `SystemUiFallback` wait for `document.fonts.ready`, verify Inter and intentional `system-ui` fallback separately, check unchanged control heights and validate that text remains vertically inside every clip wrapper. Fixtures cover Latin (`Ag`, `gjpqy`, accented letters), Cyrillic (`Дру`, `Уцщ`, `ЦЩ`, `Йц`), Kazakh Cyrillic (`Ә Ғ Қ Ң Ө Ұ Ү Һ І`), digits, symbols and currency signs.

The frozen automated baseline is Chromium on Windows at 100% zoom. A stable 125% runner is not configured, so no cross-engine or 125% optical-equivalence claim is made. Frozen script coverage is Latin, Cyrillic and Kazakh Cyrillic with Inter and system-ui fallback. Arabic, Hebrew, Indic, Thai and CJK support requires explicit fallback, direction and writing-system validation before it can be claimed.

Story-only center guides cross the physical center of each control. Review visible glyph balance rather than treating DOM rectangle centering as optical measurement. The targeted `npm run typography:check` gate rejects unsafe trimming and prevents new component-local optical hacks while allowing the shared foundation and documented FieldShell geometry.
