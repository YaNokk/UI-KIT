# AmountInput contract

`AmountInput` is a specialized composition over `Input`, `FormControl` and
`FieldShell`.

- `value` and `defaultValue` are safe integers in minor units or `null`.
- Empty input emits `null`; zero emits `0`.
- `onChange(value, { inputValue })` separates the semantic amount from the
  formatted editing string.
- `minority`, currency precision and locale follow the `Amount` policy.
- `fractionDisplay="auto"` trims cosmetic trailing zeroes;
  `fractionDisplay="always"` pads them when the field is synchronized or
  blurred. Semantic precision always comes from `minority`.
- `allowNegative` defaults to `false`. Maskito rejects negative user editing
  when it is disabled; external values are never clamped by the component.
- `integerDigits` limits digits before the decimal separator for user editing.
  The default is `16`; semantic conversion still rejects values outside the
  JavaScript safe-integer range.
- The native control is `type="text"` with `inputMode="decimal"`.
- Currency symbol and position come from `Intl` and use the existing decorative
  adornment path. `readOnly`, disabled, label, hint, error and ref semantics are
  inherited from `Input`.
- Changing locale reformats the same semantic value. Changing currency or
  minority reinterprets the same minor-unit integer; it does not convert money.

Maskito is internal. Its options and events are not public API. Future
`NumberInput`, `QuantityInput` and `PercentInput` may reuse the numeric adapter,
but are deliberately not exported here.
