# Prototype → production pipeline

Promotion — отдельная инженерная задача. Нельзя просто переместить файлы из
`prototypes/` в production package.

## Когда рассматривать promotion

Prototype component становится кандидатом, когда он повторяется, стабилен,
имеет понятную domain responsibility, используется в нескольких
flows/screens и достаточно зрел для определения контракта. Одного визуального
polish недостаточно.

## Классификация решений

Перед promotion классифицируйте каждое нестандартное значение или решение:

| Класс | Значение | Действие |
| --- | --- | --- |
| A | foundation token | Добавить/переиспользовать только через отдельное обоснованное token change |
| B | semantic token | Определить роль, light/dark aliases и связь с brand |
| C | local layout | Оставить локально, если решение не является reusable contract |
| D | missing reusable DS concept | Создать отдельную component/pattern DS-задачу |
| E | prototype-only | Не переносить в production |

Новый token требует объяснить отсутствующую semantic role, почему существующий
token не подходит, слой, light/dark behavior, связь с runtime brand и
responsive.

## Выбор слоя

```text
generic primitive
Button / Tag / Popover / Input
→ packages/ui

generic reusable UX composition
FilterToolbar / FormActions
→ packages/patterns

retail/POS domain component
Receipt / ProductPicker / PaymentSummary
→ packages/retail-ui

concrete screen/page
CheckoutScreen / ProductsPage
→ apps/*
```

`packages/ui` не принимает product/domain logic только потому, что она нужна
prototype. `patterns` не знает prototype source. Компонент `retail-ui` должен
быть нормализован и не иметь prototype dependency.

## Нормализация

Promotion требует:

1. заменить mocks и prototype-only primitives;
2. нормализовать arbitrary values через tokens или обоснованный local layout;
3. определить public API и semantics;
4. сохранить направление `tokens → ui → patterns → retail-ui → apps`;
5. добавить canonical stories, interaction/a11y tests и responsive contract;
6. проверить light/dark, runtime accent boundaries и status colors;
7. проверить public exports, package artifacts и tree-shaking.

Production package не экспортирует `src`, внутренние `dist` paths, prototype
source или prototype stories. Текущие `@mypoint/tokens` и `@mypoint/ui`
публикуют только `dist`; их build inputs ограничены собственным `src`.

## Gates

Prototype-only PR:

- lint;
- typecheck;
- Storybook checks/build, когда менялись stories;
- architecture/import-boundary review.

Promotion PR:

- все production tests и build gates;
- package build;
- `npm pack` validation;
- clean consumer fixture;
- tree-shaking checks.

Конкретный набор команд берётся из актуального `package.json` и CI. Storybook
может читать `prototypes/**`, но prototype source не становится package export.
