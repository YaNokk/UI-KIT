# Amount contract

`Amount` displays a monetary value and performs no financial arithmetic.

- `value` is a JavaScript safe integer in minor units.
- `minority` is a decimal scale (`1`, `10`, `100`, `1000`, …). Explicit
  `minority` wins; otherwise the currency precision from `Intl.NumberFormat`
  wins; without currency the fallback is `100`.
- `locale` defaults to `ru-RU`. It controls separators, grouping, currency
  symbol and placement.
- `showPlus` affects positive values only. `trimTrailingZeros` is visual and
  does not alter the semantic value.
- Size, emphasis and minor tone map only to canonical typography and semantic
  text tokens.
- Changing currency or minority reinterprets the same integer value under the
  new presentation configuration. It does not perform currency conversion.

Core DS behavior adopted: minor units, sign handling and separate amount parts.
Adapted: currency metadata is provided by `Intl` and styling uses local semantic
contracts. Rejected: Alfa-specific weight, transparency, raw style and addon
props.
