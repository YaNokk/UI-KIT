# InternationalPhoneInput v1 final verification

## Identity

| Field | Evidence |
| --- | --- |
| Implementation SHA | `921eb5f3f119188d404491535fa2db9427baeab1` |
| Workflow | `UI Tests` |
| Run | `30762461323` / run number `32` |
| Run URL | `https://github.com/YaNokk/UI-KIT/actions/runs/30762461323` |
| Job | `storybook-browser`, ID `91535338241` |
| Job status | **Failure** |
| Failed required step | `select-multiselect:verify` |
| Artifact | `choice-controls-storybook-921eb5f3f119188d404491535fa2db9427baeab1`, ID `8837895845` |
| Artifact retention | 30 days, expires 2026-09-01 |

The exact-SHA run passed checkout, `npm ci`, token checks, typecheck, unit
tests, lint, motion, Playwright installation and Choice Controls verification.
It failed in the required Select/MultiSelect gate. Full Storybook, build, pack,
consumer and tree-shaking steps were consequently skipped. The workflow also
did not yet contain the dedicated `international-phone-input:verify` step.
Therefore this evidence cannot authorize a freeze.

## Local visual review

The current candidate was reviewed in a real Chromium browser against the
canonical Storybook stories at 100% zoom.

| Area | Status | Evidence |
| --- | --- | --- |
| sm / md / lg | Approved | `Sizes` |
| outer / inner label | Approved | `OuterLabel`, `InnerLabel` |
| empty / prefix / partial / complete | Approved | `FinalStateMatrix` |
| error / hint | Approved | `FinalStateMatrix` |
| disabled / readOnly | Approved | `Disabled`, `ReadOnly` |
| clear action and policies | Approved | `ClearPolicies` and browser regression |
| trigger hover / active / focus-visible | Approved | Popover trigger review |
| Popover / BottomSheet | Approved | focused browser regression stories |
| 320 px / long country names | Approved | `Narrow320`, `LongCountryNames` |
| all-country search | Approved | all-country Russian search regression |
| Russian / explicit English | Approved | `RuntimeLocales`, `ExplicitEnglishLocale` |
| light / dark / runtime brand | Approved | global modes and `RuntimeBrands` |
| RTL | Approved | `RTL` |
| forced colors | Blocked | requires successful browser CI environment |
| reduced motion | Blocked | requires successful browser CI environment |
| 125% zoom | Blocked | exact zoom evidence not captured |

## Flag review

| Area | Status | Evidence |
| --- | --- | --- |
| Trigger and option alignment | Approved | asset flag browser regressions |
| Fixed 3:2 ratio / clipping / scaling | Approved | geometry assertions |
| RU, PL, US, GB, JP, BR, ZA, NP, CH | Approved | `RepresentativeFlagAssets` |
| Unknown-country globe | Approved | `RepresentativeFlagAssets` fallback |

## Interaction review

The real-browser regression suite covers repeated trigger open/close/open,
protected Backspace/Delete/select-all replacement, caret boundaries,
international and national paste, country selection focus restoration and both
clear policies. These checks pass against the running Storybook candidate, but
must still pass inside one complete exact-SHA CI job before freeze.

## Freeze decision

**Blocked.** Keep `candidate — not frozen`. A subsequent implementation SHA
must complete the full required workflow without skipped downstream gates.
