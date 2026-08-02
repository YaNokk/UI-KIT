# Choice Controls v1 verification

Status: local behavioral and package verification complete; CI verification pending; ready for visual calibration.

Visual freeze is not declared by this document. Durable freeze governance remains blocked until the workflow succeeds for the committed verification infrastructure and uploads its evidence artifact.

## Identity

| Field | Value |
| --- | --- |
| Implementation base SHA | `fbe8fdfb37c1c2d9d96f76054954953f1ead9b3e` |
| v1.5 infrastructure base SHA | `0ec9903b52546598187d1ca936a54f5ea73bb1f3` |
| Verification infrastructure commit SHA | pending; v1.5 changes are not committed yet |
| Verified runtime SHA | `0ec9903b52546598187d1ca936a54f5ea73bb1f3` |
| Workflow | `UI Tests` |
| Job | `storybook-browser` |
| Workflow run URL / run ID | pending |
| CI artifact name | pending run; configured as `choice-controls-storybook-${{ github.sha }}` |
| Artifact retention | 30 days |

The local report generator resolves `HEAD` before browser execution and again after both reports are written. The execution verifier rejects evidence whose `verifiedCommit` differs from the checkout `HEAD`.

## Evidence lifecycle

Runtime evidence is transient and ignored by Git:

```text
.artifacts/choice-controls-storybook-report.json
.artifacts/choice-controls-storybook-summary.json
```

No current-HEAD summary is tracked. `npm run choice-controls:storybook:verify` regenerates both files, and the resulting files do not appear in `git status --short`.

The workflow uploads both paths with `actions/upload-artifact@v4`, `if: always()`, `if-no-files-found: error`, a SHA-qualified artifact name and 30-day retention. The upload step does not convert a failed execution check into success.

## Local verification result

The focused evidence was generated at `2026-08-02T01:40:02.577Z` by:

```text
npm run choice-controls:storybook:report
npm run choice-controls:storybook:execution-check
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
| `npm run test` | passed; 41 files, 349/349 tests |
| `npm run choice-controls:storybook:collection-check` | passed; 1 source file, 8 logical stories, 3 environments |
| `npm run choice-controls:storybook:report` | passed; raw and normalized evidence generated under `.artifacts` |
| `npm run choice-controls:storybook:execution-check` | passed; 24/24, 0 skipped, 0 failed |
| `npm run choice-controls:storybook:execution-test` | passed; 14/14 negative fixtures |
| `npm run test:storybook` | passed; 7 source files, 21 environment-file suites, 219/219 executions |
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

CI verification pending. No workflow run exists for the uncommitted v1.5 infrastructure, so this document does not claim CI success, artifact upload or formal durable freeze.

After the workflow runs, record its run ID/URL, commit SHA, status and uploaded artifact identity in the Identity section. Formal freeze governance requires the `UI Tests / storybook-browser` job to pass and `choice-controls-storybook-<commit SHA>` to be available.

## Known warnings and limitations

- `npm ci` reported deprecation warnings for `whatwg-encoding@3.1.1` and `glob@10.5.0`, plus one high-severity audit finding. These warnings did not fail installation and were not changed in this pass.
- Unit tests emit existing non-fatal jsdom capability warnings for `window.scrollTo`, canvas `getContext` and pseudo-element computed styles.
- Storybook reports unmatched story globs for `packages/patterns` and `prototypes`, ignored dependency-level `use client` directives, and chunks above 500 kB.
- The UI build reports existing empty `modal/index` and `system-color/index` chunks.
- Vitest JSON does not expose browser instance names. Environment names therefore come from the shared manifest imported by the actual Storybook config; the verifier proves one complete eight-story suite per configured environment count.
- Forced-colors automation does not replace manual review with representative Windows high-contrast themes and assistive technology.

## Declaration

Local behavioral verification complete.

Local package verification complete.

CI verification and runtime evidence upload pending.

Ready for visual calibration. Visual freeze is not declared.
