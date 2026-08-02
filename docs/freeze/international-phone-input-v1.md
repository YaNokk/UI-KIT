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
- Flags are private typed 3:2 React SVG assets from
  `country-flag-icons@1.6.20`. The source project is
  `gitlab.com/catamphetamine/country-flag-icons`, licensed under MIT
  (Copyright 2020 @catamphetamine). The runtime uses no remote requests,
  Unicode emoji or injected SVG strings; unknown codes render a decorative
  globe fallback.
- A static registry integrity test proves every country returned by
  `libphonenumber-js` has exactly one valid ISO2 flag entry. The registry is
  internal and has no package export.

## Pending freeze gates

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
