# Choice Controls v1 verification

Status: behavioral verification complete; ready for visual calibration.

Visual freeze is not declared by this document.

## Verification baseline

- Base commit: `fbe8fdfb37c1c2d9d96f76054954953f1ead9b3e`.
- Story file: `packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx`.
- Browser runner: Playwright Chromium through Vitest Storybook.
- Environments: ordinary Chromium, forced-colors Chromium and reduced-motion Chromium.

## Collection protection

`npm run choice-controls:storybook:collection-check` verifies that the story file occurs exactly once in:

- the Vite CSF transform allowlist;
- the CSF stories list;
- the Storybook browser include list.

The check also requires the `test` tag filter, the story-level `test` tag and all five corrective exports. A missing file, missing export or duplicate configuration entry fails the command.

## Focused Storybook execution

Command:

```text
npm run test:storybook -- packages/ui/src/internal/choice-control/ChoiceControlBrowserRegression.stories.tsx --reporter=verbose
```

Result:

| Metric | Result |
| --- | ---: |
| Source story files collected | 1 |
| Browser project-file collections | 3 |
| Logical stories collected | 8 |
| Story executions | 24 |
| Skipped | 0 |
| Failed | 0 |

Corrective story results:

| Story | Chromium | Forced colors | Reduced motion |
| --- | --- | --- | --- |
| `RadioDescriptionAssociation` | passed | passed | passed |
| `SwitchBrandForeground` | passed | passed | passed |
| `GroupInvalidOwnership` | passed | passed | passed |
| `StandaloneFormSubmission` | passed | passed | passed |
| `UncontrolledIndicatorStates` | passed | passed | passed |

Additional exports `NativeInteraction`, `GroupsAndForms` and `GeometryThemeAndMedia` were also collected and passed in all three environments.

## Full verification results

| Gate | Result |
| --- | --- |
| Choice Control collection check | passed; 5 required corrective exports found |
| Focused Choice Control unit tests | passed; 29/29 |
| Full unit tests | passed; 41 files, 349/349 |
| Focused Storybook browser tests | passed; 24/24 |
| Full Storybook browser tests | passed; 7 source files, 21 project-file collections, 73 logical stories, 219/219 executions |
| TypeScript typecheck | passed |
| Token and responsive checks | passed |
| ESLint | passed |
| Typography governance | passed |
| Motion governance | passed |
| `git diff --check` | passed |
| Storybook static build | skipped by project instruction not to run builds after tasks |
| Package/declaration/consumer/tree-shaking checks | skipped because these gates require built package artifacts or consumer builds |

The full unit run emits existing jsdom capability warnings for `window.scrollTo`, canvas and pseudo-element computed styles. They do not fail tests and are unrelated to Choice Controls.

## Forced-colors scope

Forced-colors verification ran in Playwright Chromium. It asserts the canonical `forced-color-adjust` contract, a non-zero track border, non-zero track/thumb geometry and containment of the thumb inside the track. Runtime RGB inequality is intentionally not asserted because system colors may normalize differently across browsers and operating systems.

This automated environment does not replace manual review with representative Windows high-contrast themes and assistive technology.

## Remaining work

- Perform visual calibration against the approved reference at representative desktop, tablet and mobile widths.
- Review light/dark and runtime-brand optical details before declaring visual freeze.
- Publish CI/GitHub status checks in the normal integration workflow.

Behavioral verification complete. Choice Controls are ready for visual calibration.
