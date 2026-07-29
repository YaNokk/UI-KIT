# Shared formatting foundation

The UI formatting boundary is intentionally smaller than an i18n framework.
It resolves deterministic formatting configuration and caches native
`Intl.NumberFormat` instances. It does not own translations, time zones,
currency arithmetic, country metadata or domain masks.

## Independent dimensions

```text
locale
→ presentation language and separators

currency
→ monetary presentation identity

minority
→ semantic storage precision

region/country
→ domain context such as a phone calling plan
```

These values must not be derived from each other. `currency="KZT"` may be
formatted with `ru-RU`, `kk-KZ` or `en-US`. A future phone field may use UI
locale `ru-RU`, selected region `PL` and value `+48…`.

Locale resolution is:

```text
explicit component override
→ future shared application/DS formatting configuration
→ deterministic en-US library fallback
```

The resolver never reads `navigator.language` or the server environment during
render. No general provider exists in the repository yet; `ThemeProvider` owns
visual theme/brand and is not expanded into an unrelated formatting provider.

## Domain boundaries

```text
internal/locale
  locale resolution and native formatter cache

internal/amount
  currency, minority and money formatting semantics

future internal/phone
  calling codes, region metadata, parsing and phone mask adapter
```

Future `InternationalPhoneInput` may reuse application formatting configuration,
`FieldShell` and the low-level-engine → domain-adapter architecture. It must not
put phone metadata in `internal/locale`, reuse numeric-money parsing, or derive
the selected phone region directly from UI locale.

## Currency support

No backend or application currency allow-list currently exists in this
repository. Therefore the UI package does not invent a CIS support registry:

- valid currencies use `Intl.NumberFormat`;
- explicit `minority` overrides the currency precision;
- a well-formed Intl currency outside future product metadata remains safe;
- an invalid currency code is shown literally with a deterministic suffix
  fallback and is never replaced by another currency;
- changing currency changes formatting and interpretation only—it performs no
  exchange-rate conversion.

The CIS Storybook matrix is representative behavior coverage, not a declaration
of backend product support. A product-aware registry may be added only when an
authoritative backend/product contract is available.
