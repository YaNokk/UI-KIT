# Button contract

Статус: approved for first implementation iteration.

Источники:

- правила проекта из `docs/design-system`;
- `references/behavioral/Button.md`;
- `references/visual/Button.md`;
- текущие primitive, semantic и runtime-brand tokens.

Архитектура, accessibility-правила и токены проекта имеют приоритет над референсами. Этот документ определяет публичный контракт, но не является реализацией.

## Назначение

`Button` запускает пользовательское действие. Видимая подпись должна однозначно сообщать, что произойдёт после активации.

Типичные сценарии:

- основное действие в локальном контексте;
- действие средней важности;
- брендированное действие низкой/средней важности на мягкой accent-поверхности;
- необратимое или потенциально опасное действие;
- действие с декоративной иконкой до или после подписи; `startIcon` и
  `endIcon` всегда скрыты от assistive technology, а имя принадлежит подписи;
- длительное действие с защитой от повторного запуска;
- действие на всю ширину доступного контейнера.

В одном локальном контексте решения должна быть не более одной primary-кнопки. `danger` используется только для разрушительных или высокорисковых действий.

## Вне области ответственности

- Навигация и ссылки: для них нужен семантически корректный `Link`/`LinkButton`.
- Кнопка только с иконкой: относится к будущему `IconButton`.
- Дополнительная подпись или hint внутри кнопки.
- Выбор произвольного цвета, формы, радиуса или плотности.
- Inverted-режим, backdrop blur и platform-specific варианты.
- Автоматический выбор mobile/desktop реализации.
- `invalid` и `readOnly`: эти состояния не применимы к обычной кнопке.

## Публичный API

Контракт наследует стандартные атрибуты нативного `button`, включая form-атрибуты, обработчики событий, `aria-*`, `data-*`, `name`, `value` и `className`.

```ts
type ButtonVariant = "primary" | "secondary" | "soft" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "disabled" | "style" | "color"
  > {
  children: React.ReactNode;
  variant: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  fullWidth?: boolean;
}
```

Defaults:

```text
size      md
disabled  false
loading   false
fullWidth false
type      button
```

Ограничения API:

- `children` может содержать любой renderable React content, но результат обязан включать видимую текстовую подпись, которая формирует доступное имя или участвует в нём; icon-only usage запрещён.
- Тип `ReactNode` не гарантирует, что `startIcon` или `endIcon` действительно содержит иконку; это поведенческое ограничение контракта.
- `startIcon` и `endIcon` не могут содержать интерактивные дочерние элементы.
- `style`, произвольные цвета и визуальные props не входят в публичный API.
- `className` — поддерживаемый escape hatch для интеграции и внешнего layout. Разрешены margin, grid/flex placement, container-specific hooks и test selectors. Переопределение цветов, внутренних отступов, высоты, радиуса, типографики, геометрии и state styles запрещено политикой проекта и контролируется lint, review и tests, где это практически возможно; сам TypeScript API не может гарантировать это ограничение.
- `href`, `asChild`, произвольный `Component`, `shape`, `nowrap`, `hint`, `colors` и responsive props не поддерживаются.
- Компонент передаёт `ref` на `HTMLButtonElement`.

## Варианты

### `primary`

Главное действие текущего контекста. Использует runtime brand только через `action.primary.*` и focus semantics.

### `secondary`

Обычное действие средней важности. Использует нейтральную поверхность и границу, не зависит от runtime brand.

### `soft`

Брендированное действие ниже primary, но выразительнее neutral secondary. Использует mode-aware accent-soft surface и проверенный accent content; зависит от runtime brand только через `action.soft.*`.

### `danger`

Разрушительное или высокорисковое действие. Использует danger semantics, которые всегда независимы от runtime brand.

Не поддерживаются отдельные `ghost`, `outline`, `link`, `text`, `accent`, `transparent`, `inverted` и custom-color варианты. Tertiary, toolbar и icon-only сценарии должны быть подтверждены реальным pattern и могут принадлежать отдельным `IconButton`, `ToolbarButton` или другому компоненту.

## Размеры и геометрия

Используется только системная шкала control sizing:

| Size | Minimum height | Typography | Icon size | Horizontal padding | Gap |
|---|---:|---|---:|---:|---:|
| `sm` | `size.control.sm` — 32 px | `bodySm`, medium | `size.icon.sm` — 16 px | `space.3` — 12 px | `space.1` — 4 px |
| `md` | `size.control.md` — 40 px | `body`, medium | `size.icon.md` — 20 px | `space.4` — 16 px | `space.2` — 8 px |
| `lg` | `size.control.lg` — 48 px | `body`, medium | `size.icon.lg` — 24 px | `space.5` — 20 px | `space.2` — 8 px |

Общие правила:

- радиус всех размеров — `radius.lg` (8 px);
- высота является минимальной, а не жёсткой: при переносе локализованного текста кнопка может вырасти;
- без ограничения ширины подпись обычно остаётся в одну строку;
- текст не обрезается и не получает ellipsis;
- `fullWidth` занимает 100% ширины контейнера;
- минимальная ширина, pill-форма и отдельная responsive-геометрия не вводятся;
- тени и декоративные эффекты отсутствуют.

## Иконки

- Иконки располагаются до или после подписи и выравниваются вместе с контентом.
- Размер иконки определяется `size`, а не переданным произвольным значением.
- Иконка не сжимается при длинной подписи.
- Геометрией icon wrappers управляет Button.
- Иконки должны использовать `currentColor`, когда формат иконки это поддерживает.
- Generic UI-иконки выбираются из Lucide и импортируются статическими named imports.
- Consumer не передаёт Lucide `size`, `color` или `strokeWidth`: слот нормализует геометрию и tone.
- Обёртка иконки скрыта от accessibility tree, поскольку доступное имя задаётся текстом кнопки.
- Интерактивные элементы внутри icon slots запрещены.
- При `loading` обе иконки визуально скрываются вместе с подписью, но продолжают занимать место.

## Состояния и приоритет

Приоритет состояний:

```text
disabled → loading → active → hover → default
```

`focus-visible` может сочетаться с любым состоянием, в котором кнопка сохраняет фокус.

### Default / hover / active

- Каждый вариант имеет различимые default, hover и active состояния.
- Hover применяется только на устройствах, действительно поддерживающих наведение.
- Active должен быть визуально отличим от hover.
- Переходы используют `motion.fast` и отключаются через системную reduced-motion политику.

### Disabled

- Используется нативное состояние `disabled`.
- Кнопка не фокусируется и не активируется мышью, клавиатурой или программным click.
- Состояние определяется не одной прозрачностью: меняются foreground/background/border semantics.
- Primary, secondary, soft и danger переходят на `control.backgroundDisabled`.
- Текст и иконки используют `text.disabled` и `icon.disabled`; secondary-граница использует `border.subtle`.
- `disabled` не изменяет размер и положение содержимого.

### Loading

- `loading` является контролируемым состоянием.
- Кнопка сохраняет текущий фокус, доступное имя и занимаемую ширину.
- Пользовательский `onClick` не вызывается; активация мышью, Enter и Space блокируется.
- Программный `button.click()` не вызывает пользовательское действие и не запускает form submit path.
- Повторная активация подавляется на всём протяжении loading.
- Устанавливаются `aria-busy="true"` и `aria-disabled="true"`; нативный `disabled` добавляется только при `disabled=true`.
- Подпись и иконки становятся визуально невидимыми, но остаются в layout; индикатор размещается по центру.
- Индикатор декоративный для accessibility tree: состояние сообщает `aria-busy`, а доступное имя не заменяется словом «Загрузка».
- Если `type="submit"`, loading предотвращает повторную отправку формы.
- Компонент не удерживает индикатор искусственные 500 мс: длительностью управляет владелец асинхронной операции.
- При одновременных `disabled` и `loading` применяется нативное disabled-поведение, при этом `aria-busy` остаётся истинным.

## Нативная семантика и события

- Корневой элемент всегда `button`.
- `type="button"` используется по умолчанию; `submit` и `reset` передаются явно.
- Enter и Space работают через нативную семантику.
- В обычном состоянии стандартные события передаются без изменения.
- При `loading` события активации подавляются до вызова пользовательского обработчика.
- Программный фокус и forwarded ref сохраняют стандартное поведение `HTMLButtonElement`.
- Навигацию нельзя имитировать через `onClick`; для неё используется отдельный ссылочный компонент.

## Focus и accessibility

- Базовый уровень — WCAG 2.2 AA.
- Индикатор применяется только через `focus-visible`.
- Ring использует `focus.ring`, `focus.ringOffset` и `focus.ringWidth`; цвет проходит проверку во всех режимах и brand stress cases.
- Видимая текстовая подпись обязательна и формирует доступное имя.
- Иконки не являются единственным носителем смысла.
- Состояние loading передаётся не только визуальным индикатором.
- Контраст проверяется отдельно для light/dark и всех вариантов.
- Минимальный `sm` target 32 px превышает WCAG AA minimum 24 px; в mobile task flows patterns должны предпочитать `md` или `lg`.
- При zoom/reflow подпись может переноситься; полное значение остаётся доступным.
- Анимации не должны быть необходимы для понимания состояния и уважают reduced motion.

## Responsive behavior

- Button не знает viewport, orientation или тип устройства.
- API и геометрия выбранного `size` одинаковы на mobile, tablet и desktop.
- Автоматических breakpoint/client props нет.
- Размер и `fullWidth` выбирает вызывающий layout или pattern.
- Для узких контейнеров разрешён перенос подписи и рост высоты.
- В mobile primary task flows рекомендуется `lg`; это правило pattern, а не автоматическое поведение Button.

## Brand boundaries

Brand-dependent:

```text
action.primary.background
action.primary.backgroundHover
action.primary.backgroundActive
action.primary.foreground
action.soft.background
action.soft.backgroundHover
action.soft.backgroundActive
action.soft.foreground
focus.*
```

Brand-independent:

```text
action.danger.*
status.success.*
status.warning.*
neutral interactive surfaces
disabled semantics
page/surface backgrounds
base text
base borders
```

Primary и soft реагируют на runtime brand только через semantic aliases. Primary использует отдельную accessible action surface, не изменяя identity `brand.accent`. Danger остаётся красной danger-семантикой при любом brand accent, включая green, purple, yellow и near-black.

## Semantic token mapping

### Общие tokens

```text
size.control.sm/md/lg
size.icon.sm/md/lg
space.1/2/3/4/5
font.size.bodySm/body
font.weight.medium
lineHeight.bodySm/body
radius.lg
motion.fast
focus.ring
focus.ringOffset
focus.ringWidth
text.disabled
icon.disabled
control.backgroundDisabled
border.default
border.strong
border.subtle
```

### Variant tokens

```text
primary
  action.primary.background
  action.primary.backgroundHover
  action.primary.backgroundActive
  action.primary.foreground

secondary
  action.secondary.background         → neutral interactive default
  action.secondary.backgroundHover    → neutral interactive hover
  action.secondary.backgroundActive   → neutral interactive active
  action.secondary.foreground

soft
  action.soft.background
  action.soft.backgroundHover
  action.soft.backgroundActive
  action.soft.foreground

danger
  action.danger.background
  action.danger.backgroundHover
  action.danger.backgroundActive
  action.danger.foreground
```

Disabled использует общие neutral control/text/icon/border semantics и не создаёт brand-specific disabled variants. Loading сохраняет colors текущего варианта.

## Принятые token decisions

Для первой реализации приняты следующие переиспользуемые семантические концепции.

```text
neutral interactive surface family
  background.interactive
  background.interactiveHover
  background.interactiveActive

action.secondary.background
action.secondary.backgroundHover
action.secondary.backgroundActive

action.danger.backgroundActive

brand.accentContent
brand.accentSoftActive
brand.actionBackground
brand.actionBackgroundHover
brand.actionBackgroundActive
brand.actionForeground

action.soft.background
action.soft.backgroundHover
action.soft.backgroundActive
action.soft.foreground
```

### Neutral interactive surfaces

1. Отсутствующая концепция — переиспользуемые neutral default/hover/active поверхности для интерактивных элементов.
2. `background.surface`, `background.subtle` и `background.selected` описывают иерархию/выбор, но не формируют самостоятельный state contract; selected не равен pressed.
3. Минимальный переиспользуемый слой — semantic `background.interactive*`, не Button и не component tokens.
4. Light/dark получают независимые aliases с различимыми hover/active и проверенным контрастом.
5. Семейство полностью brand-independent.
6. Responsive-вариация не нужна.
7. Семейство пригодно для secondary actions и будущих нейтральных interactive surfaces. `action.secondary.*` сохраняет action-level API и alias этого семейства.

### Danger active

1. Отсутствующая роль — pressed-состояние danger action.
2. Hover не выражает более сильную обратную связь, а status surface не является интерактивным action state.
3. Правильный слой — существующее semantic-семейство `action.danger`.
4. Light/dark aliases проверяются независимо.
5. Token всегда brand-independent.
6. Responsive-вариация не нужна.
7. Роль применима ко всем danger actions, а не только к Button.

Новый component token для spinner не требуется: размеры индикатора выражаются существующими `size.icon.*`.

Brand action palette отделяет identity accent от primary action surface: resolver сначала сохраняет запрошенный foreground и подбирает доступную производную background-поверхность. Accent content проверяется одновременно против soft default/hover/active surfaces. Ни один из этих tokens не является Button-specific.

### Brand action palette

1. Отсутствующая роль — доступная заливка брендированного действия, которая не изменяет identity accent.
2. `brand.accent` обязан точно сохранять цвет бренда, поэтому он не может одновременно гарантировать контраст preferred foreground для любого runtime-ввода.
3. Минимальный слой — bounded runtime brand roles `brand.actionBackground*` и `brand.actionForeground`; semantic `action.primary.*` только ссылается на них.
4. Палитра проверяется в light/dark; геометрия и markup от mode не зависят.
5. Brand влияет на эти роли по определению, но не расширяет набор разрешённых semantic consumers.
6. Responsive-вариация не нужна.
7. Роли переиспользуемы всеми primary actions, а не только Button.

### Accent soft content and active surface

1. Отсутствующие роли — читаемый accent content на мягкой поверхности и отдельное pressed-состояние этой поверхности.
2. `brand.onAccent` рассчитан для identity accent, а `accentSoftHover` не выражает pressed state; существующие роли семантически неприменимы.
3. Минимальный слой — bounded runtime roles `brand.accentContent` и `brand.accentSoftActive`; `action.soft.*` предоставляет action-level aliases.
4. Все три soft-поверхности выводятся отдельно для light/dark, а content проверяется против каждой.
5. Роли brand-dependent, поскольку сохраняют accent identity в низкой визуальной иерархии.
6. Responsive-вариация не нужна.
7. Роли пригодны для branded soft actions и других явно разрешённых accent-soft interactions.

## Storybook coverage

Canonical stories:

```text
Variants
Sizes
WithStartIcon
WithEndIcon
WithBothIcons
Loading
Disabled
LongLabel
FullWidth
Submit
NarrowContainer
```

Environment matrix задаётся globals/decorators/toolbars, а не дублирующими stories:

```text
theme     light / dark
brand     blue / green / purple / yellow / near-black
viewport  mobile / tablet / desktop
container narrow / wide
```

Hover, active и focus-visible проверяются через interaction/pseudo-state tooling, где это практически возможно. Постоянные stories не создаются для полного декартова произведения variant × state × theme × brand × viewport.

`Loading` покрывает состояния без иконок, со start/end icon и с обеими иконками через controls/examples внутри одного канонического сценария.

## Обязательные tests

### Native semantics

- корень — нативный `button`;
- `variant` обязателен;
- default `type="button"`;
- explicit `submit` и `reset` работают;
- ref и native form/`aria-*`/`data-*` attributes передаются.

### Activation

- mouse click, Enter и Space активируют действие ровно один раз;
- disabled предотвращает активацию;
- loading предотвращает mouse/keyboard activation и submit;
- программный `.click()` при loading не вызывает пользовательское действие и form submit.

### Loading transition

Для сценария `idle → activate → loading=true → loading=false` проверить:

- действие срабатывает один раз;
- focus и accessible name сохраняются;
- ширина не меняется, spinner/content transition не сдвигает layout;
- повторная активация и повторный submit отсутствуют;
- после завершения loading кнопка снова интерактивна.

### Accessibility

- присутствует видимая текстовая подпись;
- декоративные иконки не дублируют accessible name;
- focus-visible различим, pointer focus не получает лишний ring;
- `aria-busy` и `aria-disabled` корректны при loading;
- axe/Storybook a11y checks проходят.

### Visual/system

- все sizes используют системную геометрию;
- отсутствуют raw colors и arbitrary spacing/radius values;
- danger не зависит от brand, primary и soft корректно реагируют на runtime brand;
- light/dark работают без markup branching;
- yellow и near-black stress cases остаются usable;
- reduced motion соблюдается;
- длинный/localized text не обрезается.

## Критерии приёмки контракта

- Финальный API не содержит визуальных escape-hatch props.
- `ghost` отсутствует в Button v1; `soft` добавлен как подтверждённая branded hierarchy, а `variant` обязателен.
- Icon slots используют честный тип `ReactNode` и контролируемые Button wrappers.
- Button не смешивает action и navigation semantics.
- Loading подавляет click, keyboard, programmatic click и form submission без потери focus/name/layout.
- Loading visual использует canonical decorative `Spinner`; Button остаётся
  владельцем accessible name, busy state и activation policy.
- Все варианты выражаются approved semantic/foundation tokens.
- Danger не зависит от runtime brand.
- Primary использует derived accessible action palette, не мутируя `brand.accent`; soft использует проверенные accent-soft/content semantics.
- Light/dark и brand не ветвят markup или geometry.
- Responsive behavior остаётся на уровне layout/pattern.
- Neutral active-state определён на переиспользуемом surface layer; danger active остаётся action semantic.
- `className` документирован как policy-controlled escape hatch.
- Canonical stories отделены от environment matrix.
- Ни один Button-specific visual token не вводится без отдельного admission decision.
