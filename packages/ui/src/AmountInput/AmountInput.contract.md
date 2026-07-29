# AmountInput contract

`AmountInput` is a specialized composition over `Input`, `FormControl` and
`FieldShell`.

- `value` and `defaultValue` are safe integers in minor units or `null`.
- Empty input emits `null`; zero emits `0`.
- `onChange(value, { inputValue })` separates the semantic amount from the
  formatted editing string.
- `minority`, currency precision and locale follow the `Amount` policy:
  explicit locale → shared locale boundary → deterministic `en-US`.
- `fractionDisplay="auto"` trims cosmetic trailing zeroes;
  `fractionDisplay="always"` pads them when the field is synchronized or
  blurred. Semantic precision always comes from `minority`.
- `allowNegative` defaults to `false`. Maskito rejects negative user editing
  when it is disabled; external values are never clamped by the component.
- `integerDigits` limits digits before the decimal separator for user editing.
  The default is `16`; semantic conversion still rejects values outside the
  JavaScript safe-integer range.
- The native control is `type="text"` with `inputMode="decimal"`.
- Currency symbol, separator and position come from `Intl` and are fixed
  Maskito prefix/postfix content inside the native input value. The caret and
  deletion boundary cannot enter or remove the affix.
- Generic `startAdornment`/`endAdornment` remain separate and available for
  actions such as a calculator or currency selector.
- The affix caret guard limits selection to the editable numeric segment.
  Ctrl/Cmd+A and copy therefore return the localized numeric value without the
  fixed currency affix. Parsing strips only the configured locale affix before
  converting to minor units.
- For prefix currencies the editing order is `prefix → sign → number`, keeping
  the currency guarded while the negative sign remains editable.
- `readOnly`, disabled, label, hint, error and ref semantics are inherited from
  `Input`.
- Changing locale reformats the same semantic value. Changing currency or
  minority reinterprets the same minor-unit integer; it does not convert money.

Maskito is internal. Its options and events are not public API. Future
`NumberInput`, `QuantityInput` and `PercentInput` may reuse the numeric adapter,
but are deliberately not exported here.
