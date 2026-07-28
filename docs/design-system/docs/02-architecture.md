# 02. Architecture

## Layers

```text
Product / Domain
        ↓
Screen Patterns
        ↓
Composite Components
        ↓
UI Components
        ↓
Headless Primitives
        ↓
Semantic Tokens
        ↓
Primitive Tokens
```

Зависимости направлены вниз. Нижний слой ничего не знает о верхнем.

## Suggested monorepo

```text
apps/
  web/
  storybook/

packages/
  tokens/
    src/
      primitive/
      themes/
      semantic/
    generated/
      tokens.css
      tailwind.css
      tokens.ts

  ui/
    src/
      Button/
      Input/
      Select/
      Checkbox/
      Dialog/
      Drawer/
      Badge/
      ...

  patterns/
    src/
      Page/
      PageHeader/
      FilterBar/
      EntityList/
      EntityDetails/
      EntityForm/
      SettingsLayout/
      ...

  domain-ui/
    src/
      Money/
      OrderStatus/
      BranchSelect/
      ...

  design-system-registry/
    components.json
    patterns.json
    rules/
    examples/

  design-system-mcp/
    src/

  eslint-config/
```

Если проект не monorepo, логические слои всё равно сохраняются.

## Responsibility boundaries

### `tokens`

Знает только значения и semantic aliases. Не знает React.

### `ui`

Generic reusable UI:
- Button;
- Input;
- Select;
- Dialog;
- Table primitives;
- Badge;
- Tabs.

Не знает `Order`, `Receipt`, `Employee`.

### `patterns`

Композиционные UX-решения:
- EntityListPage;
- DetailsPage;
- FormPage;
- FilterBar;
- ResponsiveActionBar.

Patterns знают, как generic UI собирается в устойчивый UX.

### `domain-ui`

Разрешены понятия продукта:
- OrderStatusBadge;
- ReceiptNumber;
- BranchSelector.

### application

Feature/business logic, data fetching, permissions, routes.

## Public API

Потребитель должен использовать barrel/public exports:

```ts
import {
  Button,
  Input,
  Drawer,
  EntityListPage,
} from "@app/design-system";
```

Внутренние implementation imports запрещены.

## Dependency rule

```text
app → domain-ui → patterns → ui → tokens
```

Допускаются параллельные зависимости app → ui/patterns, но не наоборот.

## Source of truth

```text
Tokens → visual decisions
Registry → capabilities and constraints
Storybook → behavior/examples
Patterns → composition/UX
Domain docs → product semantics
Application → business behavior
```
