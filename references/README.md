# Reference Library

This directory contains external reference material for the code-first design system.

References are advisory. They are not source of truth for architecture, tokens, styling, package structure, or implementation.

## Priority

1. Existing project implementation, when modifying an existing component.
2. Our component contract.
3. Our design-system architecture, tokens, themes, responsive rules, accessibility rules, and brand rules.
4. Product patterns and domain rules.
5. Extracted visual references.
6. Extracted behavioral references.
7. Raw external reference sources.

When creating a new component with no existing implementation, items 2–4 take precedence, then references.

## Reference roles

### Core DS

Primary role: behavioral/API reference.

Use it to study:
- use cases;
- public API ideas;
- state model;
- native semantics;
- responsive behavior;
- accessibility expectations;
- edge cases.

Do not inherit automatically:
- Alfa-specific styling;
- colors/tokens;
- package architecture;
- desktop/mobile implementation split;
- CSS class names;
- branding behavior.

### MP UI KIT

Primary role: visual/product reference.

Use it to study:
- visual density;
- hierarchy;
- control proportions;
- surface relationships;
- interaction appearance;
- table/filter/form composition;
- icon treatment;
- use of accent and soft-accent states.

Do not inherit:
- MUI/Emotion/Radix/shadcn/Tailwind mixture;
- duplicated component layers;
- hardcoded colors or dimensions;
- application architecture;
- generated Figma implementation structure.

## Workflow

Raw source -> extracted reference -> our component contract -> implementation -> Storybook/tests.

Do not implement a component directly from raw references when an extracted reference exists.
