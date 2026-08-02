# Choice Controls v1 verification

Status: Choice Controls v1 verification complete; runtime evidence uploaded; visual freeze declared.

The complete `UI Tests / storybook-browser` job succeeded for the documentation baseline and runtime tree recorded below. This document is a later docs-only declaration; it does not alter the verified runtime implementation.

## Identity

| Field | Value |
| --- | --- |
| Visual implementation SHA | `9656c00d0c4c28311dc6e909d9ed6fb1a94c9266` |
| CI gate implementation SHA | `db9594111aa721bd983649c7f922b106652693a6` |
| Documentation baseline SHA | `0332741811d848153c096d868c708ddb56c6c6e0` |
| Verified CI commit SHA | `0332741811d848153c096d868c708ddb56c6c6e0` |
| Workflow | `UI Tests` |
| Job | `storybook-browser` |
| Job status | `success` |
| Workflow run ID | `30742854925` |
| Workflow run URL | `https://github.com/YaNokk/UI-KIT/actions/runs/30742854925` |
| Job URL | `https://github.com/YaNokk/UI-KIT/actions/runs/30742854925/job/91483261830` |
| CI artifact name | `choice-controls-storybook-0332741811d848153c096d868c708ddb56c6c6e0` |
| Artifact ID / upload status | `8831891949` / `success` |
| Artifact retention | 30 days |

The local report generator resolves `HEAD` before browser execution and again after both reports are written. The execution verifier rejects evidence whose `verifiedCommit` differs from the checkout `HEAD`.

## Evidence lifecycle

Runtime evidence is transient and ignored by Git:

```text
.artifacts/choice-controls-storybook-report.json
.artifacts/choice-controls-storybook-summary.json
```

No current-HEAD summary is tracked. `npm run choice-controls:verify` regenerates both files, validates runtime execution, runs negative verifier fixtures and captures real hover/active states; the generated evidence does not appear in `git status --short`.

The workflow uploads both paths with `actions/upload-artifact@v4`, `if: always()`, `if-no-files-found: error`, a SHA-qualified artifact name and 30-day retention. The upload step does not convert a failed execution check into success.

## Canonical local verification

Use one entry point for the canonical focused Choice Controls verification:

```text
npm run choice-controls:verify
```

The lower-level Storybook and state-capture scripts remain implementation details for diagnosis. CI uses the canonical command as a required step tied to `${{ github.sha }}`.

The full repository freeze gate is the focused verification plus full Storybook, build, package, consumer, tree-shaking and governance checks. `choice-controls:verify` is not described as the full repository gate.

## Local verification result

The focused evidence was generated at `2026-08-02T09:53:16.334Z` by:

```text
npm run choice-controls:verify
```

Evidence identity:

| Metric | Result |
| --- | ---: |
| Source story files | 1 |
| Logical stories | 8 |
| Environments | 3 |
| Executions | 24 |
| Skipped | 0 |
| Failed | 0 |

The environments were `chromium`, `chromium-forced-colors` and `chromium-reduced-motion`. All eight manifest exports executed once in each environment suite. The five corrective exports resolved to one actual runtime `storyId` each and passed three times each.

The manifest is shared by the Storybook config, collection check, report generator and execution verifier. The verifier also cross-checks the normalized counts, source path, logical export names, runtime IDs and statuses against the raw Vitest JSON report.

## Negative verifier coverage

`npm run choice-controls:storybook:execution-test` passed 14/14 fixture failure modes:

- missing summary or raw report;
- stale SHA and invalid timestamp;
- zero executions;
- missing, failed or skipped corrective story;
- wrong environment or logical-story count;
- duplicate, missing or ambiguous runtime story ID;
- incomplete corrective execution count.

## Full local gate matrix

| Command | Result |
| --- | --- |
| `npm ci` | passed; 511 packages installed, 518 audited |
| `npm run tokens:check` | passed |
| `npm run typecheck` | passed |
| `npm run test` | passed; 41 files, 351/351 tests |
| `npm run choice-controls:verify` | passed; 24/24 focused executions, 14/14 negative fixtures, 2/2 real Chromium state captures |
| `npm run test:storybook` | passed; 24 environment-file suites, 270/270 tests |
| `npm run build-storybook` | passed; output `storybook-static` |
| `npm run build` | passed; tokens, UI and retail UI built |
| `npm run pack:check` | passed; tokens, UI and retail UI tarballs verified |
| `npm run consumer:test` | passed; clean tarball consumer typecheck and production build |
| `npm run tree-shaking:test` | passed; static and dynamic entry isolation verified |
| `npm run lint` | passed |
| `npm run typography:check` | passed |
| `npm run motion:check` | passed |
| `git diff --check` | passed |

The package correction adds the five already-declared Choice Control subpath entries to the UI Vite build manifest. The tarball therefore contains the JavaScript targets already named by `packages/ui/package.json`: Checkbox, CheckboxGroup, Radio, RadioGroup and Switch. No public API was added or changed.

## CI verification result

GitHub Actions run `30742854925` checked out exact commit `0332741811d848153c096d868c708ddb56c6c6e0`. The `storybook-browser` job completed with conclusion `success` on 2026-08-02 at 10:02:52 UTC.

| CI gate | Result |
| --- | --- |
| Checkout identity | passed; exact verified SHA `0332741811d848153c096d868c708ddb56c6c6e0` |
| Unit tests | passed; 41 files, 351/351 tests |
| Canonical focused verification | passed; 24/24 executions, 0 skipped, 0 failed |
| Negative execution fixtures | passed; 14/14 |
| Real state capture | passed in `chromium-state-capture`; 2/2 tests |
| Runtime evidence upload | passed; artifact ID `8831891949`, 2006 bytes |
| Full Storybook | passed; 24 files, 270/270 tests |
| Storybook static build | passed |
| Package build | passed; tokens, UI and retail UI |
| Package verification | passed; all three tarballs verified |
| Consumer fixture | passed; typecheck and production build |
| Tree-shaking | passed; static/dynamic subpath isolation verified |
| Governance | tokens, typecheck, lint, typography and motion passed |
| Full job | `success` |

The artifact was uploaded as `choice-controls-storybook-0332741811d848153c096d868c708ddb56c6c6e0`, is retained for 30 days and expires on 2026-09-01 at 10:01:20 UTC. Artifact upload occurred before later package gates, and the final freeze relies on the successful full job, not on artifact presence alone.

## Known warnings and limitations

- `npm ci` reported deprecation warnings for `whatwg-encoding@3.1.1` and `glob@10.5.0`, plus one high-severity audit finding. These warnings did not fail installation and were not changed in this pass.
- Unit tests emit existing non-fatal jsdom capability warnings for `window.scrollTo`, canvas `getContext` and pseudo-element computed styles.
- Storybook reports unmatched story globs for `packages/patterns` and `prototypes`, ignored dependency-level `use client` directives, and chunks above 500 kB.
- The UI build reports existing empty `modal/index` and `system-color/index` chunks.
- GitHub Actions reports that Node.js 20-based action runtimes are deprecated and currently forced to Node.js 24; the workflow's project Node remains 22.23.1.
- Vitest JSON does not expose browser instance names. Environment names therefore come from the shared manifest imported by the actual Storybook config; the verifier proves one complete eight-story suite per configured environment count.
- Forced-colors automation does not replace manual review with representative Windows high-contrast themes and assistive technology.

## Declaration

Local behavioral verification complete.

Local state-capture verification complete.

Local package verification complete.

CI verification complete.

Runtime evidence uploaded.

Choice Controls v1 visual freeze declared.
