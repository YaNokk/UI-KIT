# Select selection semantics

Select and MultiSelect resolve selection visuals exclusively through the
runtime semantic token graph. A selected row uses `background.selected` and
the soft-action foreground; selected hover and active states use the matching
soft-action state roles. The checked MultiSelect indicator uses the primary
action background and foreground. Disabled presentation always wins over
brand selection presentation.

MultiSelect chips use the same soft-action foreground/background family plus
the semantic accent border. Their remove action is local to the chip, keeps
the chip foreground through `currentColor`, and never opens the listbox.

`block` is the shared field-layout capability: it makes the FormControl root
fill its containing block. Without it, width remains owned by normal layout or
the consumer `className`. The overlay matches the resolved trigger width.

Chip overflow is derived from the rendered tokenized chip, remove action,
overflow badge, and flex gap. The measurement layer must not duplicate their
geometry with numeric constants. Visual order always follows `value` order;
the complete localized selection summary remains exposed to assistive
technology even when visible chips overflow or the small inner-label variant
uses a compact count.

The checkbox marker and selected chip remain private foundations in v1. Their
DOM and token contracts are deliberately isolated in SelectListbox and
MultiSelect styles so they can be extracted later only after a second generic
use case and Storybook review prove a public API.
