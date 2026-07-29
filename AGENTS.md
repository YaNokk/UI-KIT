# Design System Agent Rules

Перед изменениями UI прочитайте `docs/design-system/README.md` и релевантные документы из `docs/design-system/docs`.

## Приоритет источников

1. Текущая публичная реализация проекта
2. Контракты компонентов и паттернов
3. Токены, темы, responsive- и accessibility-правила проекта
4. Продуктовые и доменные правила
5. Извлечённые визуальные референсы MP UI KIT
6. Извлечённые behavioral/API-референсы Core DS
7. Сырые внешние референсы
8. Общие знания

Более высокий источник всегда имеет приоритет. `references/raw` доступен только для чтения.

## Обязательные правила

- Не создавайте публичные props до проверки текущих типов, stories и Storybook MCP, когда он доступен.
- В reusable UI запрещены произвольные цвета, отступы, радиусы, тени и breakpoints.
- Компоненты используют semantic tokens; primitive color tokens не являются API компонентов.
- Runtime brand влияет только на документированную accent-семантику.
- Status-цвета не зависят от brand; light/dark меняют aliases, а не ветвят компоненты.
- Tailwind — styling engine, но не source of truth.
- Публичному reusable-компоненту нужны stories и подходящие interaction/a11y tests.
- Composite UI обязан документировать narrow/mobile, tablet и desktop поведение.
- Не создавайте вручную component manifest, дублирующий TypeScript/Storybook.
- Lucide — источник generic UI-иконок по умолчанию; перед custom icon ищите семантический эквивалент в Lucide.
- Используйте только статические named imports из `lucide-react`; запрещены namespace-import, глобальный string registry и re-export Lucide.
- Canonical line icons используют `currentColor`, `size.icon.*` и `icon.stroke.default`; размер, tone и a11y icon-slot задаёт владеющий им компонент.
- Production packages не импортируют SVG из `prototypes`; custom icons проходят admission и визуальный review в Storybook.
- Accessible name icon-only действия принадлежит интерактивному элементу, а не декоративному SVG.
- Icon package и Lucide imports обязаны сохранять ESM tree-shaking.
- Typography использует canonical `typography.*` roles, а не произвольные font values.
- Typography role и semantic text color остаются отдельными решениями.
- `Text`/`Heading` — optional ergonomic primitives; внутреннюю типографику primitive-компонент задаёт сам.
- Navigation использует anchor semantics, action — button semantics.
- `Link` и `LinkButton` разделяют visuals, но не DOM semantics; то же правило действует для `Button` и будущего `ButtonLink`.
- Не используйте `onClick` navigation, если подходит настоящий `href`; core `Link` остаётся router-agnostic.
- Typography primitives не добавляют layout margins.
- Generic Tailwind typography не используется, когда существует canonical `typo-*` role.
- `ButtonLink` — navigation с Button visuals и обязан переиспользовать внутренний Button visual contract без button-native props.
- `LinkButton` — action с Link visuals; не смешивайте его с `ButtonLink`.
- `IconButton` — отдельный action-only primitive, а не `Button iconOnly`; icon-only navigation в v1 не поддерживается.
- `IconButton` владеет размером и tone иконки; icon-only action требует accessible name.
- Не передавайте произвольные Lucide `size`/`color` в `IconButton`.
- Извлечение shared Button visuals обязано сохранять Button behavior и ESM tree-shaking.
- `Spinner` — единый progress visual; `Button` и `IconButton` не создают собственные spinner SVG.
- Внутри интерактивного owner `Spinner` декоративный: owner сохраняет accessible name, `aria-busy` и activation policy.
- Standalone `Spinner` без `label` декоративный, а с `label` предоставляет status semantics.
- Spinner sizes используют `size.icon.*`, tones — semantic icon tokens; только accent tone зависит от runtime brand.
- Все input-like controls переиспользуют геометрию `FieldShell`.
- `FormControl` владеет label/helper/error semantics; `FieldShell` не владеет value или business behavior.
- Specialized fields композируют foundations, используют generic adornments и не копируют Input styles.
- Disabled и readOnly остаются разными состояниями; native input refs/events/attributes сохраняются.
- Base `Input` не форматирует и не маскирует значения и не зависит от form-state library.
- UI и overlays используют canonical layer tokens без произвольных z-index.
- Overlay-компоненты используют canonical `Portal`; field-компоненты не вызывают `createPortal` напрямую.
- Field typography и colors используют canonical semantic tokens; runtime backend brand не читается полями.
- Все form labels используют общий `FieldLabelView`; placeholder не заменяет label.
- Inner-label floating state остаётся generic и не привязывает `FieldShell` к native input value.
- `hint` — supporting text под полем; `error` отличается от hint и заменяет его при отображении.
- Native input заполняет всю usable content-area `FieldShell`; shell-wide JS focus delegation не является основной interaction model.
- Root/content layout обязан обеспечивать vertical stretch native control; adornments центрируются независимо.
- Floating label позиционируется поверх full-size native control и не уменьшает его hit area.
- Decorative adornments участвуют в field hit target; interactive adornments сохраняют собственные semantics.
- Focus delegation используется только для decorative adornments, gaps и truly non-native shell zones.
- Input и PasswordInput используют одну geometry model; hit areas проверяются в browser/Storybook, не только JSDOM.
- Click-to-focus и floating-label CSS реализуются в shared foundation, а не отдельно в specialized fields.
- `FieldShell` остаётся совместимым с Select/Autocomplete и другими non-input controls.
- Floating label/value vertical geometry является общей для всей field-family; `md` — основной calibration size.
- Не задавайте отдельные vertical offsets в Input/PasswordInput: label и value должны сохранять явный baseline gap.
- Native control остаётся full-height; adornments не меняют vertical label/value geometry.
- Используйте logical block properties и canonical spacing tokens, затем проверяйте геометрию в Storybook/browser.
- Field interaction сначала опирается на native HTML semantics; label click использует `label/htmlFor`, когда это возможно.
- Shell-wide JS focus forwarding не является основной model; floating labels остаются semantic labels.
- `cursor:text` — visual semantics, а не замена корректному DOM interaction.
- Не используйте `pointer-events:none`, чтобы маскировать сломанные label/input hit areas.
- Decorative adornments могут запрашивать focus через shared foundation; interactive adornments владеют pointer/keyboard behavior.
- FieldShell не становится tabbable; главная Input/PasswordInput область работает нативно без shell JS.
- Изменения pointer, focus и field geometry требуют проверки канонических stories в настоящем браузере; одного JSDOM недостаточно.
- Cursor проверяется через computed style над input, label, decorative и interactive adornments, а focus/hit area — через реальные browser events и geometry.
- Storybook MCP остаётся dev-only discovery layer: не добавляйте ради него публичные props, runtime dependencies или exports.
- MCP/browser validation опирается на детерминированные stories; interactive adornments проверяются как реальные button/action элементы.
- Optical text alignment в tight single-line controls может использовать text-box trimming только как progressive enhancement.
- Не компенсируйте font metrics через pixel nudges, negative margins или asymmetric padding и не добавляйте trimming в global typography roles.
- Trimming остаётся локальным для control visual foundation, пока одинаковая потребность не доказана в нескольких независимых control families.
- Проверяйте в Storybook/browser кириллицу, descenders, числа, иконки, размеры и loading; fallback без text-box support должен оставаться визуально приемлемым.
- Используйте только canonical layer names; произвольные z-index aliases запрещены.
- Monetary display и monetary editing используют общие amount-domain helpers, но не общий React/editing state.
- Maskito — внутренний numeric editing engine и не определяет публичный API компонентов.
- Semantic value `AmountInput` отделён от форматированной DOM-строки; пустое значение — `null`, а `0` остаётся валидным.
- Для преобразования минорных единиц используйте строковые операции, когда они безопаснее floating-point transforms.
- Не добавляйте financial arithmetic в UI-KIT и не создавайте публичный `NumberInput` как побочный эффект monetary-задач.
- Currency в `AmountInput` является частью monetary editing presentation, а не generic `FieldShell` adornment.
- Generic field adornments и фиксированный currency affix остаются разными архитектурными концепциями.
- Component-level locale — optional override; foundation использует shared app/DS resolver boundary и не hardcode-ит product locale.
- `Amount` композируется через canonical typography utilities/className; его default typography обязан оставаться overrideable.
- Styling API `Amount` остаётся semantic и не принимает raw font/color/opacity props.
- Импорт одного `Amount` не должен подтягивать Maskito editing payload.

## Добавление токена

Перед добавлением объясните отсутствующую semantic role, невозможность использовать существующий токен, слой, поведение light/dark, связь с brand и responsive.

## Package distribution

- Публикуемые пакеты никогда не экспортируют `src` или внутренние `dist`-пути.
- React и ReactDOM остаются external peer dependencies UI-пакета.
- Изменения public package сохраняют ESM и анализируемый tree-shakeable module graph.
- Опубликованный CSS работает без Tailwind-конфигурации consumer-проекта.
- Package-изменения требуют проверки `npm pack` и установки tarball в clean consumer fixture.
- Секреты и authenticated `.npmrc` запрещено коммитить; registry auth поступает только из CI/env.
- Новые deep imports запрещены без явного subpath в `exports`.
- Publish допускается только после validation, build, consumer и tree-shaking checks.

## Designer/Codex workflow

- Продуктовые эксперименты размещаются в `prototypes/**` и подчиняются
  scoped-правилам `prototypes/AGENTS.md`.
- `apps/**` и `packages/**` никогда не импортируют `prototypes/**`.
- Promotion из prototype в `ui`, `patterns`, `retail-ui` или application —
  отдельная задача нормализации, а не перемещение файлов.
- Перед созданием primitive-like control проверяйте public exports, contracts,
  stories и Storybook MCP, когда он доступен.
