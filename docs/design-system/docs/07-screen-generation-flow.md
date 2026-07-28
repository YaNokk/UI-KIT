# 07. Screen Generation Flow

## Principle

Не использовать flow:

```text
Prompt → JSX
```

Использовать:

```text
Requirement
 → UX intent
 → domain context
 → pattern
 → screen specification
 → component composition
 → implementation
 → validation
```

## Step 1. Requirement

Пример:

```text
Нужна страница заказов оператора.
Оператор быстро обрабатывает входящие заказы.
Нужны поиск, филиал, статус, дата, создание заказа и просмотр деталей.
```

## Step 2. User task

Формулируется основная задача:

```text
Find → inspect → act
```

или:

```text
Create → validate → submit
```

## Step 3. Select pattern

AI вызывает `suggest_pattern`.

Результат:

```text
EntityListPage
```

## Step 4. Screen specification

До JSX создается структурированное описание.

```json
{
  "pattern": "EntityListPage",
  "entity": "Order",
  "title": "Заказы",
  "filters": ["search", "branch", "status", "dateRange"],
  "primaryAction": "createOrder",
  "presentation": {
    "desktop": "table",
    "tablet": "table-reduced",
    "mobile": "entity-list"
  }
}
```

## Step 5. Information priority

Для каждого viewport:

```text
P1 — действие/информация без которой задача невозможна
P2 — полезна для скорости решения
P3 — secondary metadata
```

## Step 6. Component composition

AI выбирает только registry components/patterns.

```tsx
<EntityListPage
  header={<OrdersHeader />}
  filters={<OrdersFilters />}
  content={<OrdersList />}
/>
```

## Step 7. Exceptional design decision

Если существующих компонентов не хватает:

1. проверить, не является ли это новой композицией существующих primitives;
2. если повторяемо — создать pattern/composite;
3. если уникально — локальная implementation;
4. новый primitive — последний вариант.

## Step 8. Storybook

Новый public component/pattern получает stories:
- default;
- all states;
- long content;
- empty;
- error/loading при необходимости;
- light/dark;
- narrow/wide containers;
- interaction/a11y tests.

## Step 9. Screen validation

Проверить:
- light/dark;
- mobile/tablet/desktop;
- keyboard;
- zoom;
- long labels/names;
- empty/error/loading;
- permissions / absent actions;
- localization expansion, если она возможна.

## Step 10. Promote knowledge

Если новое решение удачное и повторяемое:

```text
screen solution
 → pattern
 → registry
 → Storybook docs
 → MCP context
```

Следующий AI-generated screen уже знает это решение.
