# 01. Stack

## Цель

Стек должен позволять одному frontend-разработчику развивать UI без постоянного участия дизайнера, сохраняя консистентность и предоставляя AI формализованный контекст.

## Recommended stack

### Runtime

- React
- TypeScript, strict mode
- Vite для библиотеки/Storybook и приложений, если инфраструктура проекта это допускает

### Styling

- Tailwind CSS v4 как styling engine
- CSS custom properties как runtime theme layer
- CSS `@container` / Tailwind container queries для адаптивности reusable-компонентов

Tailwind не является source of truth дизайн-системы. Он потребляет разрешённые tokens и предоставляет utilities для реализации.

Запрещённый стиль в product UI:

```tsx
<div className="rounded-[13px] bg-[#f6f7f9] px-[18px]" />
```

Предпочтительно:

```tsx
<div className="bg-surface rounded-container px-4" />
```

### Tokens

Source of truth: JSON в формате, совместимом с Design Tokens Community Group (DTCG).

Слои:

```text
primitive
  ↓
semantic
  ↓
component (только при необходимости)
```

Из токенов генерируются:
- CSS variables;
- Tailwind theme variables;
- TypeScript typings/constants при необходимости;
- документация;
- потенциально Figma/Tokens Studio интеграция в будущем.

Инструмент трансформации можно выбрать после MVP. Варианты: Style Dictionary или небольшой собственный compiler. Сначала желательно не усложнять pipeline.

### Component primitives

Для accessibility-sensitive headless поведения рекомендуется использовать зрелые primitives вместо самостоятельной реализации сложной клавиатурной навигации.

Возможный набор:
- Radix Primitives для dialog/popover/menu/tabs/tooltip и т.п.;
- React Aria — альтернативный вариант, если команда выберет его как единый accessibility foundation.

Не смешивать несколько headless-систем без необходимости.

### Domain UI

Допустимо использовать специализированные библиотеки за внутренним API:
- TanStack Table для таблиц;
- react-hook-form для форм;
- schema validation через Zod;
- date library по стандарту проекта;
- icon set: одна выбранная библиотека, например Lucide.

Приложение не должно зависеть от API сторонней UI-библиотеки напрямую, если компонент является частью дизайн-системы.

Пример:

```tsx
import { Select } from "@mypoint/ui";
```

а не по всему приложению:

```tsx
import Select from "react-select";
import { Select } from "antd";
```

### Documentation and component development

Storybook:
- stories для каждого публичного компонента;
- состояния и edge cases;
- interaction tests;
- accessibility checks;
- visual regression через выбранный CI-сервис или Playwright screenshots;
- MCP integration для AI.

### Testing

- Vitest — unit/component logic;
- Testing Library — user-facing interactions;
- Storybook tests — component stories + interactions + a11y;
- Playwright — critical flows, responsive behavior и screenshots.

## Что сознательно не является source of truth

- Figma — может появиться позже, но без дизайнера не должна дублировать кодовую систему;
- Tailwind default palette — только стартовый материал;
- сторонняя UI library — implementation detail;
- AI output — всегда производная от registry/tokens/patterns.
