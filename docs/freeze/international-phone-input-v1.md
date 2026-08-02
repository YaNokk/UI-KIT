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
- Country metadata comes from `libphonenumber-js/min`, is localized from the
  Design System locale boundary and can be restricted by an allowlist.
- Maskito owns editing formatting; the private adapter owns normalization,
  detection, validity metadata and country replacement.
- Desktop/tablet use the existing matching-width Popover foundation; compact
  viewports use the existing BottomSheet foundation.
- Locale, country/phone region, currency and runtime brand remain independent.

## Pending freeze gates

Run the repository's full CI matrix at one commit SHA. In particular, the
candidate still requires browser validation for real typing, paste/autofill,
caret restoration, 320 px layout, Popover width, BottomSheet parity, forced
colors, reduced motion and RTL. Package build, pack, clean-consumer and
tree-shaking checks must pass from that same SHA before changing status.

No `LegacyPhoneInputAdapter` is included in this repository because there is
no application package or legacy PhoneInput contract here to adapt. That
adapter belongs beside the concrete application consumer and must not be added
to `@mypoint/ui`.
