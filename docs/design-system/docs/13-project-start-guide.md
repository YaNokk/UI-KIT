# 13. Project Start Guide

## Do not start with Button immediately

The first implementation task should be an infrastructure slice. Button is iteration 1, not iteration 0.

Otherwise the first component will accidentally invent naming, theming and styling conventions that later components must undo.

## Iteration 0 — establish the system

Ask Codex to create only the design-system foundation.

Expected result:

```text
packages/
  tokens/
  ui/
  patterns/
  design-system-registry/

apps/
  storybook/ or root Storybook configuration

references/
  behavioral/
  visual/
```

Iteration 0 includes:
1. Tailwind/styling integration;
2. primitive tokens;
3. semantic tokens;
4. light/dark modes;
5. runtime brand seed and theme adapter;
6. generated CSS-variable bridge;
7. Storybook;
8. a Storybook theme/brand decorator;
9. empty component registry schema;
10. lint rules/conventions against arbitrary design values;
11. `AGENTS.md` with the source-priority rules.

Do not build a large component library yet.

## Token freeze for the first vertical slice

Before Button, define an initial bounded token vocabulary.

### Primitive

```text
color.neutral.*
color.brand seed only where useful for defaults
color.success.*
color.warning.*
color.danger.*

space.0/1/2/3/4/5/6/8/10/12/16
font.family.*
font.size.*
font.weight.*
lineHeight.*
radius.*
borderWidth.*
shadow.*
motion.*
zIndex.*
size.control.*
size.icon.*
```

### Semantic

```text
background.*
text.*
icon.*
border.*
control.*
action.*
status.*
navigation.*
focus.*
```

### Runtime brand

```text
brand.accent
brand.onAccent
brand.accent.hover
brand.accent.active
brand.accent.soft
brand.accent.softHover
brand.accent.softForeground
brand.accent.border
brand.accent.focus
```

Do not create component tokens before a component demonstrates a repeated need that cannot be expressed semantically.

## Token admission rule

An agent is not allowed to create a token just because a reference project contains a value.

For every proposed new token it must answer:
1. What semantic role is missing?
2. Why can no existing token express it?
3. Is this global, pattern-level, component-level or local?
4. Does it work in light/dark?
5. Does brand affect it? If yes, why?
6. Does it need mobile/tablet/desktop variation?

Arbitrary one-off values remain local only when genuinely unique. Repeated arbitrary values must trigger a design-system review rather than automatic token creation.

## Iteration 1 — Button

Provide Codex:
- this blueprint;
- the Core DS Button package/reference;
- MP UI KIT visual reference;
- our token/theme files created in iteration 0.

Ask it first to produce `Button.contract.md`, not code.

The contract should cover:
- purpose;
- variants;
- sizes;
- loading;
- disabled;
- start/end addon/icon behavior;
- full width/block behavior;
- native button/link semantics if supported;
- keyboard/focus behavior;
- a11y;
- responsive behavior;
- which semantic tokens are required.

Review the contract. Then implement Button.

Required stories:

```text
all variants
all sizes
loading
loading with icon
start/end icon
long text
disabled
focus-visible
full width
light + dark
several brand accents
narrow container / mobile
```

Button should not create arbitrary brand variants. Brand enters through action/focus semantic tokens.

## Iterations 2–N — component families, not random order

Recommended sequence:

```text
Button / IconButton
→ Text / Icon foundations if needed
→ FormControl + Input + Textarea
→ Checkbox / Radio / Switch
→ Select / Autocomplete
→ Tabs
→ Dialog / Drawer / Popover
→ Badge / status primitives
→ Table primitives + Pagination
→ Date/Calendar
→ domain composites
```

Build components needed by a real vertical slice. Do not attempt to port the entire Core DS catalog.

## First vertical slice

After a small foundation set, build one real screen/pattern, for example an entity list:

```text
Page
PageHeader
FilterBar
Button
Input
Select
DenseEntityTable
Pagination
```

This validates whether tokens and components work together. Only then stabilize v1 of foundations.

## Reference context workflow

Do not paste full external repositories into every prompt.

Prefer:

```text
our docs/contracts
      ↓
selected Core DS package
      ↓
selected MP UI KIT pattern/screenshot/source
```

For Button, provide Button-related reference only. For Select, provide Select-related reference only.

If repositories are available locally to Codex, give the paths and explicitly mark them read-only/reference-only.

## MCP timing

You do not need to build a custom MCP server before Button.

Recommended stages:

### Stage A — no custom MCP

Use repository files + `AGENTS.md`. Build tokens, Storybook and first components.

### Stage B — Storybook MCP

As soon as several components and stories exist, connect Storybook MCP. This lets Codex query the live component/docs knowledge and run Storybook-related tests instead of relying only on static prompt context.

### Stage C — custom Design System MCP

Create this only when registry/pattern/domain knowledge is large enough that file search becomes noisy. It should expose stable structured tools over data you already maintain; MCP must not become a second source of truth.

## Storybook MCP local setup

Current Storybook guidance:

```bash
npm create storybook@latest
npx storybook add @storybook/addon-mcp
```

With Storybook running, the addon exposes an MCP endpoint at approximately:

```text
http://localhost:6006/mcp
```

Then configure the agent using Storybook's recommended helper:

```bash
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

Use the actual Storybook port if different.

Add a project instruction that UI work must consult the Storybook MCP before inventing component props.

Storybook AI/MCP support is currently preview functionality; keep the integration replaceable and do not make token generation dependent on it.

## Codex environment

Codex should work in the repository/folder, not only receive a ZIP in a chat prompt.

Recommended:
1. unpack blueprint into `docs/design-system/` or copy its docs there;
2. clone/add external references under `references/raw/` or provide stable local paths;
3. add `AGENTS.md` at repository root;
4. run Storybook locally when MCP tools are needed;
5. let Codex execute tests/lint/Storybook checks in the working tree.

The ZIP is useful to bootstrap the repository, but repository files should become the persistent source of instructions.

## Prompt for iteration 0

```text
Read AGENTS.md and docs/design-system before changing code.

Create the design-system foundation described by the blueprint. Do not implement product components except the minimal internal fixtures needed to demonstrate tokens.

Requirements:
- React + TypeScript;
- Tailwind as styling engine, not source of truth;
- primitive → semantic token architecture;
- light/dark themes;
- runtime brand input accentColor + foregroundColor with safe derived accent states;
- mobile/tablet/desktop foundations;
- Storybook with theme/brand controls;
- registry skeleton;
- no arbitrary colors/spacing/radius/breakpoints in public component code;
- document all deviations.

Treat references/raw as read-only references and do not copy their architecture.
```

## Prompt for Button iteration

```text
Read AGENTS.md and the design-system blueprint first.

Implement our Button as the first public component.

Behavior reference: references/raw/core-ds/.../button
Visual direction: references/visual/mp-ui-kit and the relevant raw MP UI KIT examples.

Before coding:
1. analyze the behavioral reference;
2. write/update Button.contract.md;
3. map every visual decision to existing semantic tokens;
4. propose a new token only if the existing semantic vocabulary cannot express a real reusable role.

Core DS is behavioral/API reference only. MP UI KIT is visual reference only. Our tokens, architecture, branding, responsive and accessibility rules override both.

Implement stories/tests for variants, states, light/dark, several accents and narrow/wide containers.
```

## Knowledge architecture during startup

Do not introduce a hand-maintained component database during iteration 0.

Use:
- DTCG files for token facts;
- TypeScript for public component API;
- Storybook stories for supported states/examples;
- Storybook-generated manifests for AI-readable component metadata;
- authored registry files only for patterns/domain/reference knowledge that cannot be derived from code;
- Markdown for rationale, rules and contracts.

Recommended agent instruction hierarchy:

```text
/AGENTS.md
/packages/tokens/AGENTS.md
/packages/ui/AGENTS.md
/packages/patterns/AGENTS.md
```

Do not create per-component `AGENTS.md` files by default.

Before adding any local DB/vector store, first demonstrate that file lookup + Storybook MCP is insufficient. If an index is later needed, generate it from repository sources so it remains disposable.

Before the first production component, add basic automated guardrails against raw colors and unrestricted arbitrary values in reusable UI. Tighten the rules as the token vocabulary stabilizes.
