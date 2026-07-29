# Designer + Codex workflow

## Модель работы

Дизайнер работает с Codex в том же монорепозитории и остаётся синхронизирован с
канонической дизайн-системой. Основная write zone — `prototypes/**`.

Разрешённая по умолчанию область:

```text
prototypes/**
prototype stories
fixtures и mock data
prototype-local layout
feature README
```

Без отдельной DS-задачи ограничены:

```text
packages/tokens
packages/ui
public APIs и package exports
runtime brand resolver
build configuration
```

Архитектурное направление:

```text
tokens → ui → patterns → retail-ui → apps / prototypes
```

`apps/**` и `packages/**` не зависят от `prototypes/**`. Prototype использует
public exports `ui`, `patterns`, `retail-ui`, `icons`, когда соответствующие
пакеты существуют.

## Git workflow

В репозитории remote default branch — `master`. Codex всегда начинает с
`git status`, не сбрасывает локальную работу автоматически и не переключает
ветку при грязной рабочей директории без согласования.

Для чистой рабочей директории:

```bash
git switch master
git pull --ff-only
git switch -c design/<task>
```

Одна задача — одна ветка с префиксом `design/`, `prototype/` или `ux/`.

Во время работы используется единая стратегия rebase:

```bash
git fetch origin
git rebase origin/master
```

Не смешивайте merge и rebase случайно. Не делайте force push без явного
запроса. При конфликте новый канонический DS behavior имеет приоритет, а
prototype адаптируется; deprecated behavior не восстанавливается ради старого
prototype.

### Reusable Codex sync prompt

```text
Проверь состояние git.

Если рабочая директория чистая:
1. git fetch origin;
2. проверь текущую ветку;
3. перебазируй текущую design/prototype/ux ветку на origin/master;
4. не делай force push без явного запроса;
5. если есть конфликт — остановись, покажи конфликтующие файлы и объясни, что изменилось.
```

## Prototype organization

Первый уровень — продукт, второй — feature:

```text
prototypes/cashier/checkout/
prototypes/cashier/payments/
prototypes/backoffice/products/
prototypes/backoffice/orders/
```

Внутри feature при необходимости используются `screens/`, `components/`,
`fixtures/`, `stories/`. Простые prototypes не обязаны иметь все папки.

Applied component называется по domain responsibility: `Receipt`,
`OrderSummary`, `PaymentMethodPicker`, `CustomerCard`, `ProductSearch`,
`ShiftSummary`. Не используйте визуальные или временные имена `BigCard`,
`BlueBox`, `LeftPanel`, `CustomSelect`, `NewInput`.

## Discovery через Storybook/MCP

Перед созданием primitive-like control Codex:

1. инспектирует public exports;
2. инспектирует contracts и Storybook stories;
3. обращается к Storybook MCP, если endpoint доступен;
4. подтверждает отсутствие канонического эквивалента.

MCP — dev-only discovery/review layer. Он не становится source of truth,
runtime dependency или причиной добавлять public props/exports. Подключение и
проверка endpoint описаны в [storybook-mcp.md](./storybook-mcp.md).

Storybook taxonomy:

```text
Foundations/...
Components/...
Patterns/...
Retail/<Domain>/<Component>
Prototypes/Cashier/...
Prototypes/Backoffice/...
```

- `Components` — generic canonical DS;
- `Patterns` — reusable UX compositions;
- `Retail` — production domain components;
- `Prototypes` — experimental product design.

Prototype stories никогда не размещаются под `Components`.

## Prototype exploration

В `prototypes/**` временно допустимы hardcoded layout values и Tailwind
arbitrary layout values (`grid-cols-[1fr_auto]`, `gap-[18px]`). Исключение не
распространяется на production, произвольные цвета/радиусы при наличии токена
или brand/status semantics. Tailwind остаётся authoring/layout engine, а не
source of truth.

Не предполагайте, что `primary = blue`. Используйте semantic action/accent
tokens. По возможности проверяйте default и alternate accent, light и dark.
Status colors от runtime brand не зависят.

Существенная композиция покрывает применимые состояния:

```text
default, empty, loading, error, long content, narrow/mobile, desktop
```

При необходимости: `disabled`, `selected`, `many items`, `keyboard focus`.
Cashier рассматривается на touch/tablet/compact desktop/narrow viewport;
Backoffice — desktop/tablet/narrow desktop.

## Missing DS capability

Не создавайте fake canonical primitive. Временный placeholder называется явно:
`PrototypeTag` или `TagMock`, помечается prototype-only, а feature README
содержит:

```text
Missing DS capability: Tag
```

Потребность в новом API `Input`, variant `Button`, token или `Select` выносится
в отдельную DS-задачу. В `prototypes/shared` запрещено создавать параллельные
Button/Input/Select/Dialog/Modal библиотеки при наличии канонических аналогов.

## Commits и PR

Хорошие commit messages:

```text
prototype: add cashier checkout layout
prototype: explore mobile payment flow
design: refine receipt hierarchy
design: add backoffice product editor states
```

Promotion commits называют слой:

```text
retail-ui: add Receipt component
patterns: add filter toolbar pattern
```

Избегайте `fix`, `changes`, `final2`. Prototype PR объясняет:

- что исследуется и какой flow;
- состояния и responsive coverage;
- prototype-only решения;
- missing DS capabilities;
- кандидатов на promotion.

Не смешивайте несвязанный DS refactor с prototype PR.

### Pre-push Codex review

```text
Проверь diff этой ветки.

Убедись, что:
- production packages и apps не импортируют prototypes;
- существующие DS primitives не продублированы;
- нет случайных изменений packages/ui/packages/tokens;
- нет hardcoded brand colors, если есть semantic token;
- prototype stories работают;
- typecheck/lint проходят;
- README отмечает prototype-only решения и missing DS capabilities.

После этого покажи summary.
```

## Cashier Payment: end-to-end

1. Codex показывает `git status`.
2. При чистом дереве синхронизирует `master`.
3. Создаёт `prototype/cashier-payment`.
4. Проверяет public Button/Input exports и payment stories через
   Storybook/MCP.
5. Работает в `prototypes/cashier/payments/`.
6. Переиспользует канонические компоненты.
7. Добавляет relevant states и responsive stories.
8. Записывает missing DS capabilities и promotion candidates.
9. Перед PR делает rebase на `origin/master`.
10. Проверяет diff и готовит PR с prototype context.
