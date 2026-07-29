# 04. Responsive Architecture

## Goal

Поддержка:
- mobile;
- tablet;
- desktop;
- portrait/landscape там, где это влияет на UX.

Responsive — это не уменьшение desktop UI.

## Three adaptation levels

### 1. Atomic component

Button/Input/Badge обычно не знают устройство.

Они имеют controlled API:

```tsx
<Button size="md" />
<Input size="md" />
```

### 2. Composite component

`PageHeader`, `FilterBar`, `Toolbar`, `FormLayout`, `CardGrid` могут перестраиваться по доступному размеру контейнера.

Для reusable-компонентов предпочтительны container queries.

### 3. Screen pattern

На уровне pattern допустимо менять информационное представление.

Например:

```text
Desktop: data table
Tablet: reduced columns + details drawer
Mobile: entity cards/list rows
```

Это не должно решаться только `overflow-x: auto`.

## Breakpoints

Канонический source of truth и generated CSS/TypeScript/Tailwind consumers
описаны в `../../responsive-foundation.md`. Значения ниже — продуктовая
интерпретация scale, а не отдельная конфигурация.

Начальный viewport set:

```text
sm   640
md   768
lg   1024
xl   1280
2xl  1536
```

Они являются стартом, а не законом. Breakpoint появляется из точки, где layout перестает работать.

## Device strategy

### Mobile `< 768`
- одна основная колонка;
- primary action доступен без горизонтального скролла;
- фильтры часто уходят в sheet/drawer;
- tables преобразуются в compact entity representation;
- secondary metadata сокращается/переносится;
- sticky bottom actions допустимы для task flows.

### Tablet `768–1023`
- 1–2 колонки;
- sidebar может быть collapsed/overlay;
- часть table columns скрывается;
- details могут открываться в drawer;
- toolbar допускает overflow menu.

### Desktop `>=1024`
- полная информационная плотность;
- sidebar/navigation;
- data tables;
- multi-column details/forms там, где это улучшает скорость работы.

## Viewport queries vs container queries

Viewport breakpoints использовать для app shell и крупных screen layouts.

Container queries использовать для reusable-компонентов, которые могут находиться в sidebar, modal, dashboard grid или full-width page.

Пример:

```tsx
<section className="@container">
  <div className="flex flex-col @lg:flex-row">
    ...
  </div>
</section>
```

## Responsive contract for every composite component

Документация должна отвечать:
- minimum usable width;
- behavior below threshold;
- wrap/stack/hide/overflow strategy;
- priority of content;
- touch behavior;
- whether representation changes completely.

## Table contract

Каждая таблица должна классифицировать columns:

```text
priority 1 → обязательно
priority 2 → желательно
priority 3 → desktop-only
```

И отдельно определить mobile projection:

```ts
mobile: {
  title: "number",
  subtitle: "customer",
  meta: ["createdAt", "branch"],
  value: "total",
  status: "status"
}
```

## Responsive testing matrix

Минимум для patterns/screens:
- 360×800;
- 390×844;
- 768×1024;
- 1024×768;
- 1280×800;
- 1440×900;
- 1920×1080.

Не требуется pixel-perfect под каждое разрешение. Проверяется устойчивость диапазонов.
