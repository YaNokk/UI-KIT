<!-- intent-skills:start -->
# TanStack Intent - before editing files, run the matching guidance command.
tanstackIntent:
  - id: "@tanstack/react-table#create-table-hook"
    run: "npx @tanstack/intent@latest load @tanstack/react-table#create-table-hook"
    for: "Build reusable React table infrastructure with createTableHook, useAppTable, createAppColumnHelper, shared features/defaults, component registries, AppTable/AppCell/AppHeader wrappers, and typed context hooks. Load for recurring application table conventions, scoped contexts, HMR cycles, or table prop drilling."
  - id: "@tanstack/react-table#getting-started"
    run: "npx @tanstack/intent@latest load @tanstack/react-table#getting-started"
    for: "Create and render a TanStack React Table v9 table with useTable, tableFeatures, stable data and columns, row/header models, and table.FlexRender. Load for a first React table, headless rendering, or when v8 useReactTable examples are producing the wrong setup."
  - id: "@tanstack/react-table#migrate-v8-to-v9"
    run: "npx @tanstack/intent@latest load @tanstack/react-table#migrate-v8-to-v9"
    for: "Perform a complete @tanstack/react-table v8-to-v9 migration: hook and feature architecture, row-model slots, React state and subscriptions, rendering, composable tables, type helpers, and every shared API rename and semantic change. Use for migration plans, implementation, or audits. Treat useLegacyTable only as a deprecated temporary bridge."
  - id: "@tanstack/react-table#table-state"
    run: "npx @tanstack/intent@latest load @tanstack/react-table#table-state"
    for: "Read, select, subscribe to, and control React Table v9 state with useTable selectors, table.state, table.Subscribe, table.atoms, table.store, and external TanStack Store atoms. Load for controlled state, render performance, or React Compiler builder-method subscription problems."
  - id: "@tanstack/react-table#with-tanstack-query"
    run: "npx @tanstack/intent@latest load @tanstack/react-table#with-tanstack-query"
    for: "Compose React Table v9 with TanStack Query for server filtering, sorting, pagination, and infinite data. Load for query-key table state, manual* processing boundaries, server rowCount, keepPreviousData, or avoiding duplicated query-result state."
  - id: "@tanstack/react-table#with-tanstack-virtual"
    run: "npx @tanstack/intent@latest load @tanstack/react-table#with-tanstack-virtual"
    for: "Virtualize final React Table row or column models with TanStack Virtual. Load for useVirtualizer counts, scroll elements, stable keys, data-index measurement, dynamic heights, sticky headers/columns, grid/flex geometry, or infinite fetching; Virtual is renderer composition, not a Table feature."
  - id: "@tanstack/table-core#aggregation"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#aggregation"
    for: "Aggregate TanStack Table columns independently of grouping, including grand totals, caller-selected row totals, multiple keyed aggregations, custom context-based definitions, grouped merges, manual values, and worker constraints."
  - id: "@tanstack/table-core#api-not-found"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#api-not-found"
    for: "Diagnose missing TanStack Table v9 exports, options, state slices, and instance methods. Load before inventing an API when code sees a type error, undefined feature method, absent object key, adapter mismatch, or v8-shaped example."
  - id: "@tanstack/table-core#cell-selection"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#cell-selection"
    for: "Select, add, and subtract rectangular cell ranges with cellSelectionFeature: ordered include/exclude operations keyed by row and column id, modifier dragging, final positive bounds, selection edges, render-order resolution under pinning, and autoResetCellSelection. Load for spreadsheet-style selection, “select all except” behavior, unexpected range changes after sorting or reordering, drag performance, or copy-to-clipboard."
  - id: "@tanstack/table-core#cell-spanning"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#cell-spanning"
    for: "Merge adjacent body cells with cellSpanningFeature: value-based rowSpan opt-in per column via spanRows, per-row colSpan via spanColumns, and the covered-cell convention where a span of 0 means skip the cell. Load for merged data grids, spans that disappear after sorting or paginating, ragged table rows, or a cell that unexpectedly merges down the whole tbody."
  - id: "@tanstack/table-core#client-vs-server"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#client-vs-server"
    for: "Choose client or server ownership for filtering, grouping, sorting, expanding, and pagination in TanStack Table v9. Load for manual* flags, mixed pipelines, server counts, or deciding which dataset each row-model stage receives."
  - id: "@tanstack/table-core#column-faceting"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#column-faceting"
    for: "Build faceted filter UIs with columnFacetingFeature, facetedRowModel, facetedUniqueValues, and facetedMinMaxValues. Load for facet counts, numeric ranges, own-filter exclusion, or server-page facet completeness."
  - id: "@tanstack/table-core#column-filtering"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#column-filtering"
    for: "Filter columns with columnFilteringFeature, filteredRowModel, filterFns, filterMeta, nested-row direction, and manualFiltering. Load for accessor compatibility, controlled filter updaters, fuzzy metadata, or client/server ownership."
  - id: "@tanstack/table-core#column-ordering"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#column-ordering"
    for: "Control TanStack Table v9 leaf columnOrder with stable IDs while accounting for pinning regions, visibility, and groupedColumnMode precedence. Load for drag-and-drop columns or rendered order that differs from state."
  - id: "@tanstack/table-core#column-pinning"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#column-pinning"
    for: "Pin columns into logical start, center, and end regions with columnPinningFeature and renderer-owned sticky CSS. Load for RTL offsets, z-index, backgrounds, overflow, widths, gaps, or overlaps."
  - id: "@tanstack/table-core#column-resizing"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#column-resizing"
    for: "Wire columnResizingFeature, header.getResizeHandler, resize mode and direction, pointer or touch events, and performant CSS-variable updates. Load when resize state changes but widths do not, or large tables resize slowly."
  - id: "@tanstack/table-core#column-sizing"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#column-sizing"
    for: "Use columnSizingFeature numeric size, minSize, maxSize, getSize, getStart, getAfter, and total-size APIs in table, grid, or flex CSS. Load for auto or percentage misconceptions and sizing/pinning layout mismatch."
  - id: "@tanstack/table-core#column-visibility"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#column-visibility"
    for: "Hide columns with columnVisibilityFeature while rendering visibility-aware header, column, and cell collections. Load when hidden columns remain in the DOM, false-versus-absent state is confused, or enableHiding is misunderstood."
  - id: "@tanstack/table-core#core"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#core"
    for: "Use TanStack Table v9 as a headless data-grid state and row-processing engine. Load for first-table architecture, stable data and columns, row numbering with getDisplayIndex, semantic rendering, framework adapter choice, or deciding what Table owns versus the renderer."
  - id: "@tanstack/table-core#custom-features"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#custom-features"
    for: "Author a TanStack Table v9 feature plugin across every FeatureMap and API installation surface: state, options, column definitions, table, column, row, cell, header, row-model functions/caches, defaults, prototypes, and table/row/column instance data lifecycles. Load for initTableInstanceData, resetTableInstanceData, constructTableAPIs, or reusable behavior not covered by built-ins, meta, or option composition."
  - id: "@tanstack/table-core#expanding"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#expanding"
    for: "Expand hierarchical subrows or custom detail panels with rowExpandingFeature, expandedRowModel, getSubRows, getRowCanExpand, manualExpanding, and paginateExpandedRows. Load when expansion state changes but no UI appears."
  - id: "@tanstack/table-core#global-filtering"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#global-filtering"
    for: "Apply globalFilter across eligible columns with globalFilteringFeature, columnFilteringFeature, filteredRowModel, globalFilterFn, and manual server filtering. Load when columns unexpectedly participate or a global filter changes state without changing rows."
  - id: "@tanstack/table-core#grouping"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#grouping"
    for: "Group rows with columnGroupingFeature, groupedRowModel, groupedColumnMode, and manualGrouping. Load for grouped or placeholder cells and grouping interactions with expansion or pagination."
  - id: "@tanstack/table-core#migrate-v8-to-v9"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#migrate-v8-to-v9"
    for: "Perform a complete TanStack Table v8-to-v9 migration audit: feature registration, row-model and function-registry slots, state/store changes, prototype methods, column pinning and resizing renames, sorting and selection semantics, removed internals, helpers, meta typing, and generic changes. Load this shared inventory before the installed framework adapter's migration skill."
  - id: "@tanstack/table-core#pagination"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#pagination"
    for: "Paginate with rowPaginationFeature and paginatedRowModel or manualPagination. Load for pageIndex/pageSize state, rowCount/pageCount, unknown next-page limits, already-paginated server data, or autoResetPageIndex surprises."
  - id: "@tanstack/table-core#row-pinning"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#row-pinning"
    for: "Pin stable row IDs into top, center, and bottom collections with rowPinningFeature and keepPinnedRows. Load for filtering/pagination visibility, explicit region rendering, or renderer-owned sticky CSS."
  - id: "@tanstack/table-core#row-selection"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#row-selection"
    for: "Maintain rowSelection ID state with stable getRowId, single, multi, subrow, and Shift-range rules, selected row models, handler anchors, and manual-pagination semantics. Load when implementing getToggleSelectedHandler, enableRowRangeSelection, selectChildren, deselectParents, or selected IDs that outlive loaded Row objects."
  - id: "@tanstack/table-core#sorting"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#sorting"
    for: "Sort with rowSortingFeature, sortedRowModel, sortFns, multi-sort and removal options, sortUndefined, and manualSorting. Load for comparator direction, incoming server order, or product-specific sorting cycles."
  - id: "@tanstack/table-core#table-features"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#table-features"
    for: "Register TanStack Table v9 tableFeatures, feature plugins, create*RowModel factories, and function registries in prerequisite order. Load when an option, state slice, or instance API is missing, or when choosing explicit features versus stockFeatures."
  - id: "@tanstack/table-core#typescript"
    run: "npx @tanstack/intent@latest load @tanstack/table-core#typescript"
    for: "Preserve TanStack Table v9 inference with createColumnHelper, columns(), tableOptions, tableFeatures, and metaHelper. Load for ColumnDef errors, reusable tables, typed meta, named registries, or unnecessary manual feature generics."
<!-- intent-skills:end -->

## TanStack Table routing

- При изменениях DataTable или TanStack Table сначала загрузите подходящие сгенерированные Intent mappings выше и сверяйтесь с установленными declarations из `node_modules`; не дублируйте TanStack API в репозиторных правилах.

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
- Runtime-конфигурация дизайн-системы принадлежит `DesignSystemProvider`; provider остаётся optional.
- Locale, runtime brand, theme mode и portal environment — runtime concerns provider-а.
- Canonical spacing, radius, typography, layers, control sizes и breakpoint values остаются tokens/contracts, а не provider props.
- Явный locale компонента переопределяет locale ближайшего provider-а; locale не определяет currency, application country или phone region.
- Brand/theme visuals проходят через scoped semantic CSS variables; компоненты не читают backend colors напрямую.
- Внутренние locale, theme/brand и portal contexts остаются разделёнными; provider не становится service locator.
- Вложенный provider наследует неуказанные runtime values и переопределяет только переданные.
- Breakpoint numbers не являются runtime-configurable API.
- `DesignSystemProvider` рендерит реальный scoped DOM root; он не Fragment-like.
- Provider root по умолчанию остаётся layout-neutral: без transform, contain, overflow clipping, positioning и размеров.
- Overlay внутри provider по умолчанию использует portal host внутри того же theme/brand scope.
- Consumer не передаёт `portalContainer` только ради сохранения brand/theme; это override/escape hatch.
- `portalContainer={undefined}` означает собственный host provider-а, `HTMLElement` — override, `null` — reset к `document.body`.
- Каждый вложенный `DesignSystemProvider` по умолчанию создаёт собственный scoped portal host.
- Явные `light`/`dark` режимы не подписываются на system color scheme; подписка принадлежит только `system`.
- Публичный `ThemeProvider` — advanced/local theme+brand scope; нормальный app root — `DesignSystemProvider`.
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
- Currency и locale — независимые концепции; не выводите одно из другого.
- Product-supported currencies берутся только из backend/product requirements, а не из географического списка.
- Запрещена архитектура `CIS → ru-RU`; locale остаётся независимой formatting configuration.
- Explicit `minority` имеет приоритет над default currency precision.
- Смена currency никогда не выполняет FX conversion.
- Shared locale foundation хранит только formatting context/helpers, не phone/currency domain logic.
- Future phone region/country независим от UI locale и принадлежит sibling `internal/phone`.
- `Amount`/`AmountInput` безопасно используют Intl для неизвестной registry валидной валюты и deterministic literal fallback для invalid code.

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
- `NumberInput` хранит semantic `number | null` отдельно от локализованной
  editing-строки и переиспользует общий `internal/numeric` adapter.
- `NumberInput` и `AmountInput` — sibling-компоненты; generic numeric control
  не зависит от amount-domain и не принимает monetary semantics.
- Min/max не блокируют временное редактирование `NumberInput`; границы
  применяются при commit/step по документированной политике.
- Все keyboard и button step-действия используют один decimal-safe engine;
  внутренние step helpers и публичный `NumberStepper` не экспортируются.
- `QuantityInput` принадлежит `retail-ui` и композирует sibling
  `IconButton − NumberInput − IconButton`; кнопки не являются adornments.
- Quantity actions используют canonical `sm`/32 px density, явные accessible
  labels, обычный tab order и отключаются при disabled/readOnly или на границе.
- Пустой `QuantityInput` допускается во время редактирования и на blur
  восстанавливает `min`, если он задан.
- Stepping `NumberInput` запрещено запускать через DOM `CustomEvent`; higher-level
  numeric compositions используют только поддерживаемые typed actions.
- `retail-ui` не импортирует private internals из `packages/ui/src/internal`.
- Controlled `NumberInput` обязан синхронно отражать локальный `onChange` в
  `value`; debounce допустим для persistence, но не для локального value.
- Нативный `name` numeric field сериализует локализованный видимый текст, пока
  продукт не использует отдельный canonical form adapter.
- `QuantityInput` policy `null → min` принадлежит retail/domain слою и не
  переносится в generic `NumberInput`.
- Не публикуйте `NumberStepper` без доказанного второго generic use case.
- `NumberInput` v1 использует semantic `number | null`; arbitrary-precision
  decimal library нельзя добавлять без проверки требований к самому semantic
  value.
- Decimal-safe stepping использует ограниченную integer-scaled арифметику с
  явными guard-проверками `Number.MAX_SAFE_INTEGER`.
- Native ref `NumberInput` и advanced composition API `actionsRef` являются
  разными контрактами; `actionsRef` не заменяет controlled state management.
- `retail-ui` использует только публичные capabilities `NumberInput`.
- Неподдерживаемый арифметический диапазон завершается детерминированным no-op
  и никогда не публикует молча повреждённое значение.
- Визуальные step controls используют те же capability rules, что и stepping
  evaluator; disabled-состояние `+/-` не расходится с реальной availability.
- Spinbutton ARIA отражает текущее semantic editing state и не публикует stale
  `aria-valuenow` для пустого или промежуточного значения.
- Внутренние precision/safe-range constants остаются implementation details,
  пока явно не повышены до публичного контракта.
- Пока semantic value остаётся JS `number | null`, arbitrary-precision decimal
  libraries не добавляются.
