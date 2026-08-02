# Textarea v1 candidate

Status: **candidate — not frozen**

## Candidate contract

- Public exports are `Textarea` and `@mypoint/ui/textarea`.
- The editor remains a native `<textarea>` and preserves native selection,
  spelling, form submission, `name`, `form`, `required`, `disabled`,
  `readOnly`, `maxLength` and ref behavior.
- `FormControl` owns label, hint, error, required and description semantics.
- The existing `FieldShell` provides the semantic border, radius, states and
  focus ring. Textarea supplies a private multiline wrapper class; frozen
  single-line FieldShell geometry is unchanged.
- Sizes are `sm`, `md` and `lg`, with default native row counts 3, 4 and 5.
- Supported resize policies are `none` and `vertical`. Autosize forces resize
  to none internally.
- `autoSize` measures the native editor directly, respects normalized
  `minRows`/`maxRows`, recalculates for controlled value and width changes, and
  switches to internal vertical scrolling at the maximum.
- Inner labels remain at the top, float for focus/content and reserve text
  padding so label, placeholder and content do not overlap.
- `showCount` presents the current UTF-16 string length and optional
  `maxLength`. It is supporting description, does not replace native maxlength
  behavior and does not create validation errors.
- Uncontrolled presentation state follows native form reset semantics:
  `form.reset()` restores the textarea's current native `defaultValue`, then
  synchronizes the counter, inner-label state and autosize measurement.
  Controlled Textarea remains owned by its `value` prop.
- Horizontal/both-axis resize, rich text, markdown, mentions, toolbars,
  validation timing and arbitrary public pixel heights are excluded.

## Responsive behavior

Textarea fills its available inline size, wraps content natively and remains
usable at 320 px. It does not introduce viewport breakpoints. Vertical growth
comes from native rows, user resize or bounded autosize.

## Verification

Unit coverage verifies native attributes/events/ref, controlled and
uncontrolled editing, row defaults, resize policies, disabled/readOnly,
inner-label state, hint/error/count descriptions, bounded autosize, caret
preservation during measurement and accessibility.

Focused real-browser stories verify native DOM, focus/error ownership,
multiline inner-label geometry, autosize growth and maximum, controlled
external recalculation, resize-only caret preservation, narrow wrapping,
stable counter geometry, vertical resize and RTL. Forced-colors evidence is a
separate story run only by `vitest.textarea-forced-colors.config.ts`; its sole
Chromium instance sets `forcedColors: "active"` and the story hard-fails unless
the matching media query is active. It is not inferred from RTL or a
conditional smoke assertion. Package checks require the subpath; consumer and
tree-shaking fixtures exercise it independently.

Freeze remains blocked until `textarea:verify` and the complete repository
workflow pass on one exact commit SHA. This decision is independent from the
InternationalPhoneInput candidate and cannot authorize its freeze.
