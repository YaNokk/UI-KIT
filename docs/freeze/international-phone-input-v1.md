# InternationalPhoneInput v1 candidate

Status: **candidate — not frozen**

The implementation and focused verification exist, but this document must not
be promoted to a freeze until exact-SHA CI completes all repository gates,
including browser Storybook, package/consumer and tree-shaking checks.

## Candidate contract

- Public value is `+` plus digits or an empty string; formatted editing text is
  internal and available in change metadata.
- The component uses one `FormControl` + `FieldShell` with a private country
  trigger, native `type=tel` input and clear action.
- Browser autofill uses the native `type="tel"` and `autocomplete="tel"`
  contract. Consumers provide the stable form-specific `name`; the canonical
  All Countries story demonstrates `name="phone"` inside an autocomplete-enabled
  form so address-manager autofill can recognize the control.
- Country metadata comes from `libphonenumber-js/min`, is localized from the
  Design System locale boundary and can be restricted by an allowlist.
- Maskito owns editing formatting; the private adapter owns normalization,
  detection, validity metadata and country replacement.
- Desktop/tablet use the existing matching-width Popover foundation; compact
  viewports use the existing BottomSheet foundation.
- Locale, country/phone region, currency and runtime brand remain independent.
- The shared locale resolver defaults to `ru-RU`; an explicit component locale
  or `DesignSystemProvider` locale still overrides it. Country labels, search
  and empty/clear messages therefore use Russian when no locale is supplied.
- `SelectPanel` owns one explicit trigger toggle for both popover and sheet:
  repeated activation follows open → close → open, while Escape and outside
  press remain dismiss paths. The shared browser fixture covers Select and
  MultiSelect, and the phone fixture covers CountryPicker.
- A single effective country drives the flag, calling code, strict Maskito
  mask, display formatting and emitted country metadata.
- During ordinary editing the selected calling code is a protected prefix.
  Strict Maskito supplies its caret guard and prefix-restoration behavior;
  React normalization is a consistency boundary rather than the primary
  protection mechanism.
- Ordinary input and national paste retain the selected country. An
  international paste beginning with `+` may detect another allowed country
  and atomically update its canonical value, display formatting and metadata.
- With controlled `country`, a detected international paste calls
  `onCountryChange`; the parent must synchronously round-trip that country prop.
  The controlled Storybook harness demonstrates this flag/mask update.
- Clearing preserves the protected calling-code prefix by default and places
  the caret after it. `preserveCountryCallingCode={false}` emits an empty value
  without discarding the selected country.
- Omitting `countries` exposes the complete `libphonenumber-js` country set,
  ordered by localized display name with ISO2 as a deterministic tie-breaker.
  Supplying `countries` is an explicit allowlist and never changes locale.
- The complete country collection crosses the shared flat-list virtualization
  threshold and uses the existing `virtua` Select path in both Popover and
  BottomSheet. Search reduces the collection before row rendering and matches
  localized name, ISO2 and calling code.
- Opening the virtualized country picker makes the selected country the active
  row and uses the existing virtual scroll API to mount it in the visible
  window. Tests search before querying any other offscreen country; logical
  collection completeness is never inferred from the mounted DOM window.
- The shared Select/MultiSelect flat-list threshold remains 500 and preserves
  its historical strict `>` boundary: 500 rows are not virtualized and 501 are.
  CountryPicker alone passes a private threshold of 200 to
  `SelectListboxView`; no public virtualization prop was added. Grouped lists
  remain non-virtualized.
- Shared Select/MultiSelect trigger-toggle coverage lives in the dedicated
  `SharedFloatingTriggerBrowserRegression` fixture. Both
  `select-multiselect:verify` and `international-phone-input:verify` reuse the
  focused `floating-trigger:verify` gate, while phone-specific stories run only
  in the phone gate.
- Flags are private generated 3:2 SVG sprite assets sourced from
  `country-flag-icons@1.6.20`. The source project is
  `gitlab.com/catamphetamine/country-flag-icons`, licensed under MIT
  (Copyright 2020 @catamphetamine). The source dependency is generation-only;
  the runtime uses one packaged asset, no remote requests, Unicode emoji or
  injected SVG strings. Unknown codes render a decorative globe fallback.
- The published `@mypoint/ui` package contains the sprite at a stable private
  asset path. Consumer bundlers may fingerprint that asset in application
  builds; the fingerprint is not part of the component API.
- A static registry integrity test proves every country returned by
  `libphonenumber-js` has exactly one valid ISO2 flag symbol. The registry is
  internal and has no package export. The measured React registry added
  214,910 B raw / 48,526 B gzip consumer JS; the sprite reduces the JS delta to
  1,912 B raw / 896 B gzip and emits one 159,764 B raw / 43,886 B gzip asset.
  Full evidence and methodology are recorded in
  `docs/reports/international-phone-input-flag-bundle-size.md`.

## Pending freeze gates

Exact-SHA workflow run `30762461323` for implementation SHA
`921eb5f3f119188d404491535fa2db9427baeab1` completed with failure in
`select-multiselect:verify`; downstream Storybook and package gates were
skipped. Job `91535338241` therefore does not authorize freeze. Detailed local
visual, artifact and workflow evidence is recorded in
`docs/reports/international-phone-input-final-verification.md`.

Run the repository's full CI matrix at one commit SHA. In particular, the
candidate includes focused real-browser stories for shared trigger toggling,
prefix protection, caret boundaries, full-list virtualization, responsive
country parity, SVG flag geometry, localized search and country-switching paste,
but still requires exact-SHA CI evidence for those stories plus autofill,
320 px layout, Popover width, BottomSheet parity, forced
colors, reduced motion and RTL. Package build, pack, clean-consumer and
tree-shaking checks must pass from that same SHA before changing status.

No `LegacyPhoneInputAdapter` is included in this repository because there is
no application package or legacy PhoneInput contract here to adapt. That
adapter belongs beside the concrete application consumer and must not be added
to `@mypoint/ui`.
