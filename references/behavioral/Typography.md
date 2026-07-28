# Typography behavioral reference

Source: Core DS Typography package, reviewed for API and behavior only.

## Retained concepts

- A bounded set of named text roles is preferable to raw font values.
- Text may intentionally render as `span`, `div`, or `p`; this repository also
  admits `label` for form composition.
- Semantic element selection and visual role are separate decisions.
- Native attributes and refs should reach the rendered element.
- Edge content, alternate elements and truncation need explicit coverage.

## Rejected or normalized

- Core DS visual names, font values, color names and package architecture are
  not copied.
- Raw weight overrides are not exposed on `Text`; `bodyStrong` is the bounded
  stronger role.
- Automatic paragraph margins are rejected. Parent composition owns spacing.
- Skeleton behavior, monospace-number switches and multi-line row limits are
  outside Text Foundations v1.
- Core DS responsive/mobile title architecture is not inherited. Atomic
  typography does not switch by viewport.

## Local contract

Typography metrics live in semantic `typography.*` tokens. `Text` and `Heading`
are optional ergonomic React interfaces over the same roles. Text color is an
independent semantic choice.
