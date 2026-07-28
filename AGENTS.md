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
- Lucide — источник generic UI-иконок по умолчанию; перед custom icon ищите семантический эквивалент в Lucide.
- Используйте только статические named imports из `lucide-react`; запрещены namespace-import, глобальный string registry и re-export Lucide.
- Canonical line icons используют `currentColor`, `size.icon.*` и `icon.stroke.default`; размер, tone и a11y icon-slot задаёт владеющий им компонент.
- Production packages не импортируют SVG из `prototypes`; custom icons проходят admission и визуальный review в Storybook.
- Accessible name icon-only действия принадлежит интерактивному элементу, а не декоративному SVG.
- Icon package и Lucide imports обязаны сохранять ESM tree-shaking.
- Typography использует canonical `typography.*` roles, а не произвольные font values.
- Typography role и semantic text color остаются отдельными решениями.
- `Text`/`Heading` — optional ergonomic primitives; внутреннюю типографику primitive-компонент задаёт сам.
- Navigation использует anchor semantics, action — button semantics.
- `Link` и `LinkButton` разделяют visuals, но не DOM semantics; то же правило действует для `Button` и будущего `ButtonLink`.
- Не используйте `onClick` navigation, если подходит настоящий `href`; core `Link` остаётся router-agnostic.
- Typography primitives не добавляют layout margins.
- Generic Tailwind typography не используется, когда существует canonical `typo-*` role.
- `ButtonLink` — navigation с Button visuals и обязан переиспользовать внутренний Button visual contract без button-native props.
- `LinkButton` — action с Link visuals; не смешивайте его с `ButtonLink`.
- `IconButton` — отдельный action-only primitive, а не `Button iconOnly`; icon-only navigation в v1 не поддерживается.
- `IconButton` владеет размером и tone иконки; icon-only action требует accessible name.
- Не передавайте произвольные Lucide `size`/`color` в `IconButton`.
- Извлечение shared Button visuals обязано сохранять Button behavior и ESM tree-shaking.
- `Spinner` — единый progress visual; `Button` и `IconButton` не создают собственные spinner SVG.
- Внутри интерактивного owner `Spinner` декоративный: owner сохраняет accessible name, `aria-busy` и activation policy.
- Standalone `Spinner` без `label` декоративный, а с `label` предоставляет status semantics.
- Spinner sizes используют `size.icon.*`, tones — semantic icon tokens; только accent tone зависит от runtime brand.

## Добавление токена

Перед добавлением объясните отсутствующую semantic role, невозможность использовать существующий токен, слой, поведение light/dark, связь с brand и responsive.

## Package distribution

- Публикуемые пакеты никогда не экспортируют `src` или внутренние `dist`-пути.
- React и ReactDOM остаются external peer dependencies UI-пакета.
- Изменения public package сохраняют ESM и анализируемый tree-shakeable module graph.
- Опубликованный CSS работает без Tailwind-конфигурации consumer-проекта.
- Package-изменения требуют проверки `npm pack` и установки tarball в clean consumer fixture.
- Секреты и authenticated `.npmrc` запрещено коммитить; registry auth поступает только из CI/env.
- Новые deep imports запрещены без явного subpath в `exports`.
- Publish допускается только после validation, build, consumer и tree-shaking checks.
