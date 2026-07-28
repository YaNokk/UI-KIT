# UI / Design System Agent Rules

Before UI work, read `docs/design-system/README.md` and relevant design-system documents.

## Source priority

1. Existing project implementation and public registry
2. Our component/pattern contracts
3. Our tokens/theme/responsive/accessibility rules
4. Our product/domain rules
5. MP UI KIT extracted visual reference
6. Core DS extracted behavioral/API reference
7. Raw reference source
8. General knowledge

Higher-priority sources override lower-priority sources.

## Hard rules

- Do not invent component props without checking the existing component contract/Storybook first.
- Do not use arbitrary colors, spacing, radii, shadows or breakpoints in reusable UI.
- Do not add a design token solely because an external reference contains a value.
- Use semantic tokens in components. Primitive color tokens are not component API.
- Runtime brand may affect only documented accent semantics.
- Success/warning/danger are independent from runtime brand.
- Light/dark are semantic theme aliases, not component branches.
- Do not copy MP UI KIT architecture or dependency choices.
- Do not copy Core DS visual branding/styles.
- External references are read-only unless a task explicitly says otherwise.
- Prefer existing primitives/components/patterns before adding new ones.
- Public reusable UI requires Storybook stories and appropriate interaction/a11y tests.
- Composite UI must define narrow/mobile, tablet and desktop behavior.

## Token proposal

Before adding a token, state:
- missing semantic role;
- why current tokens cannot represent it;
- scope: global / semantic / component / local;
- light/dark behavior;
- brand relationship;
- responsive relationship.

Do not add the token if this cannot be justified.

## Knowledge and retrieval

- Markdown contains policy/rationale, not duplicate machine facts.
- Component props/types are defined by TypeScript and current public implementation.
- Component states/examples are defined by Storybook stories.
- When available, use Storybook MCP for targeted component lookup instead of reading unrelated UI source.
- Do not create or manually update a component manifest that duplicates generated Storybook/type information.
- Custom registries may contain patterns, domain semantics, reference mappings and canonical screens.
- Do not introduce a local/vector database unless repository/MCP retrieval has demonstrably become inadequate.

## Enforceable consistency

Treat lint/test failures as architecture feedback. Do not bypass rules with arbitrary Tailwind values or raw color literals to match a reference screenshot.
