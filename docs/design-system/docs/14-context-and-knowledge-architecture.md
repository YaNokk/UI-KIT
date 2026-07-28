# 14. Context and Knowledge Architecture for AI

## Goal

Keep Codex context small, deterministic and aligned with the actual implementation as the design system grows.

Do not treat Markdown as a database. Use each format for the kind of knowledge it represents best.

## Knowledge layers

```text
Human/policy layer
  AGENTS.md + docs/*.md
  architecture, constraints, rationale, UX rules, brand rules

Machine-readable authored layer
  DTCG tokens
  pattern/domain/reference registries
  explicit contracts only where they add information not derivable from code

Implementation layer
  TypeScript public props
  component code
  stories/tests

Generated layer
  Storybook component/docs manifests
  generated CSS variables
  generated indexes

Query layer
  Storybook MCP
  later: custom Design System MCP

Reference layer
  Core DS behavioral references
  MP UI KIT visual references
  raw sources as last-resort read-only context
```

## Source of truth by concern

Do not manually duplicate facts across formats.

| Concern | Source of truth |
|---|---|
| global architecture and AI constraints | `AGENTS.md`, design-system docs |
| primitive/semantic tokens | DTCG token files |
| runtime brand behavior | token/theme implementation + brand contract docs |
| component public API | TypeScript types/exports |
| supported component examples/states | Storybook stories |
| reusable UX/pattern rules | authored pattern registry/docs |
| product/domain semantics | authored domain registry/docs |
| component AI manifests | generated from Storybook/types; never hand-maintained if derivable |
| visual direction | extracted MP UI KIT visual reference |
| behavior/API inspiration | extracted Core DS behavioral reference |

## Markdown policy

Markdown is appropriate for:
- rationale;
- architectural rules;
- allowed/prohibited decisions;
- UX guidance;
- reference interpretation;
- component contract notes that cannot be encoded in TypeScript/stories.

Markdown should not be the only source for facts already expressed by code, such as exact prop unions or existing story names.

Avoid large evergreen documents that the agent must read completely on every task. Prefer small topic documents and pointers from `AGENTS.md`.

## AGENTS.md hierarchy

Keep the root `AGENTS.md` short and durable.

Recommended hierarchy:

```text
/AGENTS.md
/packages/tokens/AGENTS.md
/packages/ui/AGENTS.md
/packages/patterns/AGENTS.md
```

Do not create an `AGENTS.md` for every component. Component-specific knowledge belongs in the component's types, stories, tests and optional contract/README.

## Generated manifests

Treat Storybook component/docs manifests as generated artifacts derived from TypeScript/stories/docs.

Do not create a second hand-maintained `components.json` containing the same props, variants or story information.

A custom registry is justified only for facts Storybook should not own, for example:

```text
patterns.json
  composition and intended usage of product patterns

domain-rules.json
  product/entity semantics

references.json
  relationship to Core DS and MP UI KIT references

screens.json
  canonical product screen examples
```

Generated artifacts must be reproducible and may be deleted/rebuilt without losing design-system knowledge.

## Retrieval strategy

Prefer deterministic retrieval over semantic/vector search while the system is structured.

Typical lookup:

```text
Need Button API
→ Storybook MCP / TypeScript

Need control colors
→ token registry

Need EntityListPage rules
→ pattern registry/docs

Need behavior inspiration
→ Core DS Button reference

Need visual direction
→ MP UI KIT Button/toolbar reference
```

A vector database is not required for a design system with tens or hundreds of well-structured components. Introduce semantic search only when a large unstructured knowledge corpus exists and fuzzy retrieval is genuinely needed.

If a database/index is ever introduced, it must be generated from repository sources and disposable. It must not become a new manually maintained source of truth.

## MCP response design

MCP tools should implement progressive retrieval.

Prefer:

```text
list_components()
get_component_summary(name)
get_component_api(name)
get_component_guidelines(name)
get_pattern(name)
list_tokens(category)
get_brand_rules()
get_visual_reference(name)
get_behavior_reference(name)
```

Avoid a tool that returns the entire design system or full raw source by default.

MCP improves context efficiency only if responses are compact and task-specific.

## Context priority for existing vs new components

### Modifying an existing component

```text
1. actual implementation/public API
2. generated manifest/stories/tests
3. our contracts/rules/tokens
4. product patterns/domain rules
5. extracted references
6. raw references
```

### Creating a new component

```text
1. our architecture/tokens/API conventions
2. related existing components/patterns
3. product/domain requirements
4. extracted behavioral reference
5. extracted visual reference
6. raw references
```

External reference architecture must never define our implementation by accident.

## AI guardrails are not only documentation

Documentation tells the agent what to do. CI/lint/tests must reject common violations.

Recommended enforceable rules:
- no raw HEX/RGB/HSL colors in reusable UI except approved token-generation code;
- no arbitrary Tailwind colors in `packages/ui`;
- restrict arbitrary spacing/radius/z-index when a system token exists;
- no direct third-party UI imports from product feature code;
- enforce package import boundaries;
- public components require stories;
- interactive components require focus/keyboard coverage where applicable;
- token schema and aliases must validate;
- generated manifests/indexes must be reproducible and up to date.

Do not rely on prompts alone to preserve architecture across hundreds of AI-generated changes.

## Recommended initial setup

For the first vertical slice, use:

```text
AGENTS.md
+ focused Markdown docs
+ DTCG token files
+ TypeScript public APIs
+ Storybook stories/tests
+ Storybook MCP when stories exist
+ CI/lint guardrails
```

Do not add SQLite/vector storage/custom MCP until repository navigation becomes a demonstrated problem.
