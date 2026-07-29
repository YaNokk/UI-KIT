# Amount contract

`Amount` displays a monetary value and performs no financial arithmetic.

- `value` is a JavaScript safe integer in minor units.
- `minority` is a decimal scale (`1`, `10`, `100`, `1000`, …). Explicit
  `minority` wins; otherwise the currency precision from `Intl.NumberFormat`
  wins; without currency the fallback is `100`.
- Locale resolution is explicit override → shared application/DS locale
  boundary → deterministic `en-US` fallback. No environment locale is read
  during render, so SSR and hydration use the same fallback.
- `showPlus` affects positive values only. `trimTrailingZeros` is visual and
  does not alter the semantic value.
- `size` remains a convenience typography preset. Component styles live in the
  components layer, so canonical `typo-*` utilities supplied through
  `className` override the preset.
- Root color and typography inherit cleanly. `minorTone="secondary"` is the
  only part-specific tone API.
- Changing currency or minority reinterprets the same integer value under the
  new presentation configuration. It does not perform currency conversion.

Core DS behavior adopted: minor units, sign handling and separate amount parts.
Adapted: currency metadata is provided by `Intl` and styling uses local semantic
contracts. Rejected: Alfa-specific weight, transparency, raw style and addon
props.

The former global `emphasis` prop was removed before API freeze: it represented
generic font weight rather than monetary semantics. Use a canonical typography
utility such as `typo-body-strong` or `typo-heading-lg`.
