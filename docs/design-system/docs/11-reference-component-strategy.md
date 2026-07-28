# 11. Behavioral Reference Strategy — Core DS

## Purpose

Core DS is a behavioral/API reference, not the implementation foundation and not the visual source of truth.

Use it to reduce the cost of rediscovering mature component use cases while keeping our architecture, styling, tokens, responsive model and branding independent.

## Extraction priority

When studying a Core DS package, inspect in this order:

```text
types / public API
→ stories/examples
→ docs
→ tests
→ implementation source
```

The goal is to understand the contract before implementation details.

## What may be reused as knowledge

- public API ideas;
- state model;
- controlled/uncontrolled behavior;
- composition model;
- keyboard behavior;
- accessibility expectations;
- loading/disabled behavior;
- icon/addon placement concepts;
- user cases and edge cases.

## What must not be inherited automatically

- CSS or class names;
- Alfa-specific tokens/branding;
- colors;
- spacing;
- typography;
- radii;
- shadows;
- breakpoints;
- package boundaries;
- dependency graph;
- legacy compatibility behavior that our product does not need.

## Required workflow per component

```text
reference source
      ↓
reference analysis
      ↓
our component contract
      ↓
implementation on our foundations
      ↓
Storybook stories/tests
      ↓
registry/MCP publication
```

Never use `copy package → replace CSS` as the default workflow.

## Reference contract

Before implementing a non-trivial component, create a short contract:

```text
Component: Button

Use cases
States
Sizes
Content model
Keyboard behavior
Accessibility
API worth preserving
API to normalize/drop
Implementation dependencies
Responsive considerations
```

The contract belongs to our repository and becomes the implementation specification. The external reference does not remain the specification.

## Dependency strategy

Simple components may be implemented directly.

Behavior-heavy components should prefer one selected headless foundation rather than copying complex internals:
- Dialog/Popover/Menu/Tabs/Tooltip etc. → selected headless primitives;
- positioning → Floating UI if required;
- complex accessibility/collection behavior → selected React Aria primitives if that foundation is chosen.

Do not mix several primitive systems for equivalent responsibilities without an explicit architecture decision.

## Reference source placement

Recommended:

```text
references/
  behavioral/
    core-ds/
      README.md
      extracted/
        button.md
        input.md
        ...
  raw/
    core-ds/        # optional local checkout/submodule; read-only reference
```

Raw reference source is lower-priority context than our extracted contracts.

## Codex priority

For any implementation task:

```text
1. Existing implementation in @mypoint/ui
2. Our component contract / registry
3. Our tokens/theme/responsive/a11y rules
4. Our patterns and product rules
5. Extracted Core DS behavioral reference
6. Raw Core DS source
7. General model knowledge
```

If a reference conflicts with our rules, our rules win.

## Licensing/provenance

Keep the reference origin documented. Before copying code verbatim, verify the repository/package license and preserve required notices. Prefer extracting behavior and writing an implementation against our contract rather than copying large source fragments.
