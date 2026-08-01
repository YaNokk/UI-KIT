# Single-line control typography

Flex alignment centers a font line box, not the visible glyphs. Fixed-height controls therefore use the internal single-line typography foundation instead of local pixel nudges or changes to global body typography.

## Roles and approved values

Each role owns its font metrics and an independently approved optical block offset. Calibration is private font data rather than spacing: it uses explicit quarter-pixel values in the shared foundation and is not part of the public token API.

| Role | Offset | Metrics | Current consumers |
|---|---:|---|---|
| `fieldValueTextSm` | `-0.25px` | 13/14, medium | Input, Select, MultiSelect field value sm |
| `fieldValueTextMd` | `-0.25px` | 14/20, medium | Input, Select, MultiSelect field value md |
| `fieldValueTextLg` | `-0.5px` | 16/22, medium | Input, Select, MultiSelect field value lg |
| `compactChipText` | `-0.25px` | 13/18, medium | MultiSelect chip and overflow |
| `controlTextSm` | `-0.25px` | 13/18, medium | Button sm, ButtonLink sm |
| `controlTextMd` | `-0.25px` | 14/20, medium | Button md, ButtonLink md |
| `controlTextLg` | `-0.5px` | 16/24, medium | Button lg, ButtonLink lg |
| `compactControlTextSm` | `-0.5px` | 12/16, medium | Tag sm |
| `compactControlTextMd` | `-0.25px` | 13/18, medium | Tag md |
| `counterText` | `-0.5px` | 12/16, semibold | Badge, future compact counters |
| `choiceControlLabel` | `-0.25px` | 16/24, regular | Select option/action, future single-line Checkbox/Radio/Switch labels |

The negative direction moves the intact line box upward because the reviewed Inter glyph mass sat optically low inside these fixed-height consumers. Matching numeric values do not imply shared ownership: every role declares its own value, and governance/browser assertions freeze each mapping independently.

Production keeps complete font line boxes. `text-box-trim` and `text-box-edge` are forbidden because cap/alphabetic trimming can remove Latin, Cyrillic, Kazakh Cyrillic and fallback-font descenders. Optical correction may move only the intact inner typography wrapper. Component CSS must not add `translateY`, `top`, `padding-top` or `inset-block-start` to text labels.

## Clipping architecture

Controls that truncate horizontally use two layers: an outer clip wrapper owns `min-inline-size`, `overflow`, ellipsis and `white-space`; its inner wrapper owns the typography role and optical offset. Tag, Badge, Select trigger/options/actions and MultiSelect chips/summaries follow this structure. Button does not need a clip wrapper because its label wraps rather than ellipsizes. No typography wrapper may also own `overflow: hidden`.

Badge `labelClip` is an inline-flex centering container. Only its inner `counterText` moves; the Badge root, background, clip wrapper and padding remain unchanged. The same ownership rule keeps Button icons/spinner, Tag dot/remove icon, Select indicator/leading icon and MultiSelect remove icon geometrically centered independently from text.

## Audit decisions

Button, ButtonLink, Tag, Badge, private MultiSelect chips/summaries, Select trigger and Select option/action primary labels use the shared roles. Select Action currently shares the same metrics and weight as an option, so both deliberately use `choiceControlLabel`; a future typography divergence requires a separate role and calibration.

Tooltip remains normal compact flowing text because its content can wrap, including when a particular value happens to fit on one line. LinkButton is link-like and may wrap. Input-family editors keep frozen FieldShell/caret geometry. IconButton and StatusIndicator have no visible text. Tabs, segmented controls, menu items, pagination and fixed-height breadcrumbs are not present. Future choice controls use `choiceControlLabel` only for a single-line label; a multi-line label or label/description stack uses normal flow.

## Calibration and visual approval

The v1.2 values were approved on 2026-08-01 over baseline commit `e63253afc8e594237a68003bb012e1d2def6c42b`. The frozen primary target is Inter in Chromium on Windows at 100% zoom. Storybook `Foundations/SingleLineControlTypography` provides one section per role plus dedicated Badge, Button, Tag, Select, MultiSelect and system-ui visual fixtures.

Every fixture waits for `document.fonts.ready`, verifies the computed family, weight and exact custom-property value, checks unchanged control heights and confirms that text remains vertically inside every clip wrapper. Content covers counters (`0`, `3`, `8`, `12`, `99+`, `!`, `+1`), Latin (`Ag`, `gjpqy`, `Save`, `Pending`), Cyrillic (`Дру`, `Уцщ`, `Сохранить`, `Черновик`), Kazakh Cyrillic (`ӘҒҚҢӨҰҮҺІ`), symbols and currency signs.

Story-only guides cross the physical center of each control and outline its bounds. Approval is visual: compare visible glyph mass across digits, scripts and descenders, then confirm that icons, dots, remove controls and spinners remain independently centered. DOM rectangles are used only for no-clipping and frozen-height guards; line-box centering is not treated as optical proof.

The intentional `system-ui` fallback reuses the same values. It is expected to remain acceptable, not pixel-identical to Inter. Runtime font detection and font-specific offsets are out of scope. A stable 125% runner is not configured, so no cross-engine or 125% optical-equivalence claim is made. Arabic, Hebrew, Indic, Thai and CJK support requires explicit fallback, direction and writing-system validation before it can be claimed.

`npm run typography:check` rejects unsafe trimming, freezes every approved role value and prevents component-local optical hacks while allowing the shared foundation and documented FieldShell geometry.
