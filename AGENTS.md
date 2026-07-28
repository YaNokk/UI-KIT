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

## Добавление токена

Перед добавлением объясните отсутствующую semantic role, невозможность использовать существующий токен, слой, поведение light/dark, связь с brand и responsive.

