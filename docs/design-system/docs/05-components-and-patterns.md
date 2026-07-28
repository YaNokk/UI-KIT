# 05. Components, Patterns and Registry

## Component philosophy

Публичный API должен ограничивать дизайн-решения.

Хорошо:

```tsx
<Button variant="primary" size="md" />
```

Плохо:

```tsx
<Button color="#0080ff" radius={7} padding={13} />
```

## Component levels

### Foundations
Color, type, spacing, sizing, motion.

### Primitives
Button, Input, Textarea, Checkbox, Radio, Select, Badge, IconButton.

### Overlays
Dialog, Drawer, Popover, Tooltip, Menu.

### Data display
Table, List, Pagination, EmptyState, Skeleton, Alert.

### Layout
Stack, Inline, Grid, Page, Section, Divider.

### Patterns
PageHeader, FilterBar, FormSection, EntityListPage, EntityDetailsPage, EntityFormPage, SettingsPage.

## Mandatory states

Interactive controls документируют по крайней мере:
- default;
- hover;
- active;
- focus-visible;
- disabled;
- loading, если применимо;
- invalid/error, если применимо;
- readOnly, если применимо.

## Component registry

AI должен читать machine-readable registry.

Пример:

```json
{
  "Button": {
    "category": "action",
    "description": "Triggers a user action",
    "props": {
      "variant": ["primary", "secondary", "danger", "ghost"],
      "size": ["sm", "md", "lg"]
    },
    "rules": [
      "One primary action per local decision context",
      "Do not use danger for non-destructive actions"
    ]
  }
}
```

Registry не заменяет TypeScript types. Он объясняет назначение и UX constraints.

## Pattern registry

Пример:

```json
{
  "EntityListPage": {
    "useWhen": "User manages or browses a collection of entities",
    "slots": ["header", "filters", "content", "pagination"],
    "responsive": {
      "desktop": "table",
      "mobile": "entity-list"
    }
  }
}
```

## When to create a component

Компонент появляется, если:
- паттерн повторяется;
- повторение имеет общий behavior/semantics;
- API можно описать без domain leakage;
- abstraction уменьшает вариативность, а не скрывает уникальный экран.

Не создавать `Card` только потому, что несколько блоков имеют border/background.

## Escape hatch

Допускается редкая локальная верстка Tailwind utilities, если:
- это уникальная композиция;
- используются только разрешённые theme tokens;
- нет arbitrary colors/sizing без причины;
- после повторного использования решение рассматривается на перенос в pattern/component.
