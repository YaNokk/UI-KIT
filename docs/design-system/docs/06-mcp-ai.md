# 06. MCP and AI Integration

## Goal

AI should operate inside the design-system contract rather than infer the system from arbitrary source files.

It needs access to:
1. existing components and API;
2. stories and supported states;
3. patterns;
4. semantic tokens;
5. runtime brand rules;
6. domain/product context;
7. responsive rules;
8. accessibility constraints;
9. behavioral references;
10. visual references.

## MCP is not required on day one

Use three stages.

### Stage A — repository context

For iteration 0 and the first components, use:
- repository docs;
- `AGENTS.md`;
- local reference folders;
- tests/stories;
- ordinary Codex repository access.

This is enough to build the initial system.

### Stage B — Storybook MCP

Connect Storybook MCP after components/stories exist.

It gives the agent structured access to real component documentation/stories and can participate in story/test workflows. It should become the first lookup for "what components/props already exist?".

Current Storybook setup is documented as:

```bash
npm create storybook@latest
npx storybook add @storybook/addon-mcp
```

With the dev server running, the default endpoint is typically:

```text
http://localhost:6006/mcp
```

Storybook currently recommends configuring an agent with:

```bash
npx mcp-add --type http --url "http://localhost:6006/mcp" --scope project
```

Use the actual port when different.

Storybook's AI/MCP capabilities are currently preview functionality for React. Keep this integration replaceable and do not make token generation/source-of-truth dependent on MCP.

### Stage C — custom Design System MCP

Build a custom server only when registry/pattern/domain/reference knowledge becomes large enough that plain repository navigation is noisy.

MCP is an interface over existing sources of truth, not another database to manually keep synchronized.

## Storybook MCP role

Use for:
- discover actual components/docs;
- inspect public props and usage examples;
- inspect states represented in stories;
- generate/update stories;
- run Storybook-related component/interaction/a11y checks when configured.

Do not use Storybook alone to encode full product/domain UX rules.

## Custom Design System MCP role

Suggested tools:

```text
list_components()
get_component(name)
search_components(query)

list_patterns()
get_pattern(name)
suggest_pattern(requirements)

get_token(path)
list_semantic_tokens(category)
validate_token_proposal(proposal)

get_brand_rules()
get_responsive_rules(pattern)

get_domain_entity(name)
get_domain_rules(area)

get_screen_example(name)
search_screen_examples(query)

get_behavior_reference(component)
get_visual_reference(patternOrComponent)

validate_screen(spec)
validate_component_usage(files)
```

## Reference separation

Do not merge behavioral and visual references into one ambiguous knowledge source.

```text
Core DS
behavior/API/use cases
       ↓
behavior reference

MP UI KIT
visual hierarchy/density/pattern direction
       ↓
visual reference

OUR TOKENS + CONTRACTS + PATTERNS
       ↓
source of truth
```

## Agent source priority

```text
1. Existing public implementation/registry
2. Our component/pattern contracts
3. Our token/theme/brand/responsive/a11y rules
4. Product/domain rules
5. Extracted MP UI KIT visual reference
6. Extracted Core DS behavioral reference
7. Raw external reference source
8. General model knowledge
```

Higher priority always wins.

## Agent contract

Before creating reusable UI the agent must:
1. check whether a component/pattern already exists;
2. inspect its Storybook/docs if available;
3. determine product intent;
4. inspect only the relevant reference material;
5. map visual decisions to existing semantic tokens;
6. define responsive/mobile/tablet/desktop behavior for composites;
7. respect light/dark and runtime brand boundaries;
8. add stories/tests;
9. justify any new token/primitive explicitly.

## AGENTS.md

Store durable rules in repository instructions rather than repeating them in every prompt. A starter template exists in `examples/AGENTS.md`.

A key instruction should be:

```text
When Storybook MCP is available, query it before inventing or assuming component props.
```

Also explicitly mark `references/raw` as read-only/reference-only.

## Context budget

Do not feed Codex entire external repositories for every task.

Use task-scoped context:

```text
Button task
→ our Button contract/rules
→ Core DS Button reference
→ MP UI KIT Button/toolbar visual reference
```

Raw repositories can exist locally, but the agent should inspect only relevant packages/files.

## Validation loop

```text
requirement
 ↓
our contracts + MCP/reference retrieval
 ↓
contract/spec
 ↓
implementation
 ↓
Storybook + interaction/a11y tests
 ↓
brand/mode/responsive matrix
 ↓
visual review
 ↓
fix
 ↓
registry/docs update
```

## Security / scope

Do not place secrets, credentials or private operational data into design-system MCP knowledge. Reference repositories should be read-only and their licenses/provenance documented.

## Knowledge-source rule

MCP is a query layer, not a source of truth.

Prefer generated Storybook manifests for component facts that are derivable from TypeScript/stories. Do not manually mirror the same props/variants in a custom `components.json`.

Keep authored registries only for knowledge that is not naturally owned by Storybook, for example patterns, domain semantics, visual/behavioral references and canonical screen examples.

Design MCP tools for progressive retrieval: return a compact summary first, and expose detailed API/docs/reference calls separately. A tool that returns the entire design system defeats the purpose of MCP context retrieval.

See `14-context-and-knowledge-architecture.md`.
