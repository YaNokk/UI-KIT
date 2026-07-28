# 08. Quality and Governance

## Accessibility baseline

Минимальный target: WCAG 2.2 AA как инженерный ориентир, если продуктовые/регуляторные требования не задают иное.

Обязательные правила:
- keyboard navigation;
- visible `focus-visible`;
- semantic HTML;
- labels and accessible names;
- error message связан с field;
- состояние не передается только цветом;
- contrast проверяется отдельно для light/dark;
- reduced motion;
- usable zoom/reflow;
- достаточные interaction targets, особенно mobile/tablet.

Автоматическая проверка не заменяет ручное тестирование.

## Story requirements

Каждый public component должен иметь:
- Default;
- Disabled;
- Focus/keyboard scenario при необходимости;
- Edge content;
- Light/Dark;
- Responsive/container stories для composite components;
- Error/Loading/Empty где применимо.

## Test pyramid

```text
unit/token validation
        ↓
component interaction tests
        ↓
Storybook a11y
        ↓
visual regression
        ↓
Playwright critical flows
        ↓
manual device review
```

## Token validation

CI должен запрещать:
- broken aliases;
- duplicate semantic role names;
- invalid token types;
- generated files out of sync;
- при возможности — forbidden arbitrary values в design-system коде.

## Visual regression

Минимум snapshot/screenshots для:
- core components;
- patterns;
- representative screens;
- light/dark;
- key viewport widths.

Не обязательно screenshot каждого состояния каждого экрана, если component/pattern coverage уже достаточный.

## Lint rules worth adding

Со временем:
- no direct imports from third-party UI libraries in feature code;
- no arbitrary hex colors outside tokens;
- no arbitrary z-index;
- restricted arbitrary spacing/radius;
- require Storybook story for public component;
- import boundaries between app/domain/patterns/ui/tokens.

## Design-system change process

Для нового component/token/pattern в PR описать:
- problem;
- existing alternatives considered;
- intended scope;
- API;
- responsive behavior;
- light/dark behavior;
- accessibility behavior;
- examples.

## Versioning

Если дизайн-система используется несколькими приложениями:
- semantic versioning;
- changesets;
- migration notes для breaking changes.

Если пока одно приложение в monorepo — можно начать без публикации пакета, но сохранять public API boundaries.

## Governance without designer

Решения проверяются по приоритету:
1. task completion;
2. consistency;
3. accessibility;
4. information hierarchy;
5. responsive behavior;
6. visual polish.

Не вводить новый визуальный паттерн только потому, что он выглядит интереснее.

## AI enforcement guardrails

Do not rely on `AGENTS.md` or prompts as the only protection against design-system drift.

CI should progressively enforce:
- no raw color literals in reusable UI outside approved token/theme generation files;
- no arbitrary Tailwind colors in `packages/ui`;
- restricted arbitrary spacing/radius/z-index where system tokens exist;
- no direct imports from third-party UI libraries in product feature code;
- package/import boundaries;
- Storybook story requirement for public components;
- keyboard/focus coverage for interactive components where applicable;
- DTCG schema/alias validation;
- reproducibility/freshness of generated manifests and indexes.

Generated metadata is disposable build output. CI should regenerate or compare it rather than treating it as an independent manually edited source of truth.
