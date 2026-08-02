# Select selection semantics

Select and MultiSelect resolve selection visuals exclusively through the
runtime semantic token graph. A selected row uses `background.selected` and
the soft-action foreground; selected hover and active states use the matching
soft-action state roles. MultiSelect reuses the private frozen checkbox-kind
`ChoiceIndicator`; its checked visual therefore uses the primary action
background and foreground, while its visual-only DOM remains `aria-hidden`
inside the owning `role="option"`. Disabled presentation always wins over
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

The option indicator depends on the private Choice Control foundation and does
not own selection, input semantics, focus or events. MultiSelect maps `sm` to
the frozen 20 px indicator and `md`/`lg` to the frozen 24 px indicator. The
selected chip remains a private MultiSelect foundation; neither primitive is
promoted to a public API by this integration.
