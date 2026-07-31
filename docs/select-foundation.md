# Select Foundation

Архитектурный контракт Select Foundation v1: внутренняя коллекция,
навигация и selection-модель, общие для публичных `Select` и
`MultiSelect`.

Документ фиксирует решения из
`select-foundation-v1-implementation.md`. При конфликте приоритет у
текущей реализации и замороженных контрактов foundations
(FieldShell/FormControl, Floating Overlay, ModalRuntime, Responsive
Foundations).

## Состав

```text
internal/select
├ collection     — нормализация Option/Action/Group в плоские rows
├ typeahead      — locale-aware matching по textValue
├ useSelectState — открытие, active row, навигация, selection операции
├ SelectListboxView — listbox/option/group/status представление
└ SelectPanel    — responsive presentation (Popover / BottomSheet)

Select       — single selection
MultiSelect  — multiple selection + tags в trigger
```

## Решение A: remote selected display contract

Зафиксирован вариант из рекомендации плана (Candidate A):

```ts
// Select
value: Value | null;
selectedItem?: SelectOption<Value>;

// MultiSelect
value: Value[];
selectedItems?: SelectOption<Value>[];
```

Правила разрешения отображения:

1. Если выбранный option есть в текущей нормализованной коллекции —
   используется canonical item коллекции.
2. Иначе используется presentation cache `selectedItem`/`selectedItems`.
3. Если данных нет — DEV warning и детерминированный fallback на
   `String(value)`; UI никогда не остаётся молча пустым.

Cache никогда не перетирается текущей страницей options; удаление тегов
при смене страницы запрещено.

## Collection model

Три first-class сущности:

- `SelectOption` — `value`, `label`, обязательный `textValue`,
  `description`, `leading`, `trailing`, `disabled`.
- `SelectAction` — `id`, визуальные слоты, `onSelect()`; не option:
  без `aria-selected`, без влияния на selection, по умолчанию закрывает
  presentation.
- `SelectGroup` — `id`, `label`, один уровень, heading не
  selectable и не navigable.

Нормализация:

- входные items плющатся в стабильные rows (`option`/`action`/
  `group-header`);
- identity: option → `value`, action → `id`, group → `id`; индексы и
  порядок рендера identity не являются;
- DEV-валидация предупреждает о дубликатах value/id, пустых
  `textValue`, вложенных группах (вложенность игнорируется flatten);
- навигация работает по коллекции, а не по смонтированному DOM:
  `navigableRows` содержит только enabled Option и enabled Action.

## Selection semantics

Select (single):

- выбор option → `onChange(value)` → presentation закрывается;
- `clearable` → clear через `onChange(null)`; clear недоступен при
  `disabled`/`required`; clear не открывает Select.

MultiSelect (multi):

- toggle option → немедленный `onChange(values)`; presentation
  остаётся открытой;
- никакого draft/Apply/Cancel transaction model;
- clear all → `onChange([])`; tag remove удаляет значение и не
  открывает Select;
- Backspace на сфокусированном trigger удаляет последнее выбранное
  значение; отдельные Tab-стопы на тегах в v1 не делаются.

Action row: Enter/Space/pointer выполняет `onSelect` ровно один раз,
selection не меняется, presentation закрывается; дальнейший Dialog —
ответственность consumer.

## Keyboard и typeahead

- Закрытый trigger: Enter/Space/ArrowDown открывают; ArrowUp открывает и
  активирует последний navigable row.
- Открытый список: ArrowDown/ArrowUp/Home/End/Enter/Space, Escape
  закрывает, Tab закрывает и уходит по tab-order.
- Начальный active: выбранный enabled option, иначе первый enabled
  option; ведущий Action автоматически не подсвечивается, пока есть
  обычный option.
- Навигация пропускает group headings, disabled и status rows.
- Typeahead: не редактируемый, по обязательному `textValue`,
  case-insensitive, locale-aware (`localeCompare` sensitivity base),
  буфер сбрасывается по приватному таймауту, wrap-around включён;
  actions участвуют по `textValue`. Публичного search/query API в v1
  нет — это зона будущего Autocomplete.

## Data state model

Публичное дискриминированное состояние:

```ts
collectionState?: {
  status: "ready" | "loading" | "refreshing" | "loading-more" | "error";
  message?: ReactNode;
  onRetry?: () => void;
};
```

- `empty` выводится из `ready` + отсутствия options;
- initial loading — status row со Spinner, без fake options;
- refreshing — выбранное значение и существующие rows сохраняются, progress
  отображается компактно в trigger и panel;
- loading-more — существующие rows остаются интерактивными, loader в
  конце списка;
- empty/error status rows не navigable; action rows остаются доступными;
- collection error отделён от field validation error
  (FormControl `error`); retry — callback consumer-а, DS не владеет
  fetch/cache/debounce/abort.

## Presentation

- regular → private floating surface без собственного ARIA role (и без
  `role="dialog"`); единственный `role="listbox"` принадлежит listbox
  внутри surface. Width policy: inline-size = trigger width,
  max-inline-size ограничена доступной шириной floating middleware;
  публичный контракт `matchTriggerWidth` не меняется.
- compact (generated `mediaQueries.belowMd`, Responsive Foundations) →
  BottomSheet/ModalRuntime; single закрывает по выбору, multi остаётся
  открытым и использует footer Done только для закрытия.
- Одна модель состояния для обеих presentations. Смена presentation
  на лету → закрыть текущую, не переоткрывать, selection сохранить
  (как responsive Tooltip).
- Никаких публичных `presentation`/`breakpoint`/`isMobile` props и
  raw breakpoint literals.

## Virtualization

- Движок — `virtua` (приватно; типы virtua не попадают в публичные
  declarations).
- Приватный порог активации (500 rows); маленькие коллекции рендерятся
  напрямую.
- Navigation/selection ссылаются на identity rows; active row
  прокручивается в видимую область через `VListHandle.scrollToIndex`.
- Поддерживаются variable-height rich rows, group headers, action rows,
  disabled rows.
- a11y: после открытия focus переходит на listbox; его
  `aria-activedescendant` указывает только на смонтированный active Option.
  Для Action этот атрибут отсутствует, потому что Action не option;
  keyboard-navigation остаётся collection-driven. При виртуализации id active
  row публикуется только после подтверждения монтирования через наблюдение за DOM,
  а не после фиксированного `requestAnimationFrame`.

## MultiSelect trigger tags

- Одна визуальная строка, height bounded; теги не переносятся.
- При `labelView="inner"` размеры `sm`/`md` показывают локализованный текстовый
  summary и не запускают chip measurement/ResizeObserver; `lg` сохраняет chips.
- Видимые теги вычисляются по доступной ширине (ResizeObserver),
  резервируется место под `+N`; при экстремально узкой ширине
  допускается только `+N`.
- Никакого публичного `maxTags`.
- Tag remove — private compact button с accessible name `Remove {item}`, клик не
  открывает Select (stopPropagation).
- ArrowLeft/ArrowRight выбирают активный тег; Delete/Backspace удаляют его,
  Backspace без активного тега удаляет последний. Remove controls исключены из
  обычного Tab order.
- Trigger связан с локализованным visually-hidden summary выбранных значений.

## A11y model

- list: один `role="listbox"`; multi: `aria-multiselectable="true"`.
- option: `role="option"` + `aria-selected`; direct-rendered groups:
  `role="group"` с `aria-labelledby` на heading. В virtualized mode headers
  остаются contextual flattened rows: это versioned degradation, которую
  повторно проверяем при обновлении `virtua`.
- Action — отдельный sibling `role="button"`, а не интерактивный потомок
  listbox: это исключает запрещённое смешивание button внутри listbox.
  Он не входит в option keyboard order, не получает `aria-selected` и не
  является value. Tab перемещает focus между Search, Action и listbox.
- Trigger: button semantics, `aria-haspopup="listbox"`,
  `aria-expanded`, `aria-controls`; active descendant принадлежит listbox.
- Status rows: `role="status"` для loading/empty, `role="alert"` для error;
  retry — отдельная кнопка, не вложенная в listbox.

## Локализация

Строки по умолчанию резолвятся через `useResolvedLocale` (ru/kk/en)
тем же механизмом, что Tooltip sheet labels; компонент не хардкодит
продуктовую локаль. `clearLabel`, `emptyMessage` и `loadingMessage`
допускают локальный override; произвольное сообщение/error/retry передаётся
через `collectionState`.

## Search v1.1

- `searchable` добавляет Search внутри Popover и BottomSheet; закрытый trigger
  остаётся не редактируемым.
- Uncontrolled query фильтрует только options по `Option.textValue`; пустые
  группы скрываются, Action остаётся видимым.
- `searchProps.value` вместе с `searchProps.onChange` включает external mode:
  consumer передаёт подготовленные items, DS не фильтрует их повторно и не
  владеет debounce/fetch/cache/abort.
- При открытии focus получает Search. ArrowDown переводит focus в listbox,
  Enter выбирает active option, Escape закрывает presentation.
- Query сбрасывается после single selection, после каждого multi toggle и при
  любом закрытии. В controlled mode сброс запрашивается через `onChange("")`.
- `No options` и `No results` — разные локализованные состояния.

## Form serialization

Single Select использует один hidden input. MultiSelect создаёт отдельный hidden
input с одинаковым `name` для каждого значения; comma-join не используется.

## Что не входит в v1.1

Autocomplete, creatable tags, remote fetch/pagination API, filter
Apply/Cancel, nested groups, menu semantics, DatePicker, editable search
в trigger/Autocomplete, object values, публичные renderer-props, публичные
virtualization knobs.

## Browser freeze baseline

Перед public API freeze проверяются в настоящем браузере: точная ширина Popover,
виртуализация и mounted `aria-activedescendant`, единый scroll owner в
BottomSheet, tag overflow на узких ширинах, click/keyboard tag remove,
наружное закрытие и Escape в Dialog. Эта матрица повторяется при bump
`@floating-ui/react`, `virtua`, Modal/BottomSheet или Responsive Foundations.
