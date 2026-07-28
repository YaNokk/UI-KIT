# Design System Blueprint

Code-first blueprint for a scalable React design system built with AI assistance but constrained by explicit tokens, component contracts, patterns and references.

## Goals

- one system for mobile / tablet / desktop;
- light / dark modes;
- bounded runtime white-label brand (`accentColor` + `foregroundColor`);
- MP UI KIT-like visual direction without inheriting its architecture;
- Core DS-like behavioral/API maturity without inheriting Alfa visual branding;
- AI generates UI from allowed components/patterns/tokens instead of inventing a local design system per screen;
- Storybook provides executable component knowledge and later MCP integration.

## Reference model

```text
Core DS
behavior / API / use cases
        +
MP UI KIT
visual direction / density / hierarchy
        +
OUR DESIGN SYSTEM
architecture / tokens / themes / brand / responsive / a11y
        ↓
implementation
```

Our design system always has priority over reference projects.

## Documents

1. `docs/01-stack.md` — stack and tool boundaries.
2. `docs/02-architecture.md` — layers, monorepo and dependency direction.
3. `docs/03-tokens-and-themes.md` — strict token taxonomy, light/dark and anti-chaos rules.
4. `docs/04-responsive.md` — mobile/tablet/desktop and component/pattern adaptation.
5. `docs/05-components-and-patterns.md` — component API, patterns and registry.
6. `docs/06-mcp-ai.md` — staged MCP integration and AI source priority.
7. `docs/07-screen-generation-flow.md` — screen/pattern generation flow.
8. `docs/08-quality-governance.md` — accessibility, testing and governance.
9. `docs/09-decisions-needed.md` — product decisions to resolve as the system matures.
10. `docs/10-runtime-brand-theming.md` — backend accent/foreground branding without system forks.
11. `docs/11-reference-component-strategy.md` — Core DS behavioral/API reference policy.
12. `docs/12-visual-reference-strategy.md` — MP UI KIT visual reference policy and token consequences.
13. `docs/13-project-start-guide.md` — exact Iteration 0 → Button → component families → vertical slice workflow and MCP setup.

Additional template:
- `examples/AGENTS.md` — starter Codex/agent project rules.

Cross-cutting contract:
- `../icons-and-assets.md` — Lucide, custom icon admission, assets, accessibility and packaging.

## Start here

Do not begin by asking Codex to reproduce the full library.

```text
Iteration 0
foundation: tokens + light/dark + brand + Storybook + registry + AGENTS.md
       ↓
Iteration 1
Button contract → implementation → stories/tests
       ↓
component families
       ↓
first real vertical slice
       ↓
stabilize tokens/patterns
       ↓
Storybook MCP
       ↓
custom Design System MCP only when needed
```

See `docs/13-project-start-guide.md` for concrete prompts.

## Fundamental rule

```text
requirements
    ↓
product/domain context
    ↓
pattern selection
    ↓
component contract
    ↓
semantic tokens + brand/mode
    ↓
React implementation
    ↓
Storybook/tests/visual review
```

AI output is never the source of truth. External references are never the source of truth. The repository contracts are.

## AI context architecture

See `docs/14-context-and-knowledge-architecture.md` for the final policy on Markdown vs generated manifests, Storybook MCP, authored registries, context retrieval, optional databases and CI guardrails. The default is repository-native structured sources; no local/vector database is required initially.
