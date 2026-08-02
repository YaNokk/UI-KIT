# InternationalPhoneInput contract

`InternationalPhoneInput` stores an E.164-compatible `+` plus digits value or
an empty string. Locale-aware formatting is editing presentation only and is
reported through `PhoneValueChangeMeta.formattedValue`.

The field composes `FormControl` and one `FieldShell`. Its country trigger is a
private action in the start adornment; it is not a nested Select field. The
private picker reuses Select collection/navigation, matching-width Popover and
compact BottomSheet foundations. Country flags are decorative local emoji
assets and never add a second accessible name.

Value and country each support controlled and uncontrolled state. Country
resolution is: controlled country, detected country for a non-empty number,
internal country, explicit default, first allowed country, then `null`.
Controlled country is never changed by number detection. Locale and phone
region remain independent; the component never derives a country from locale
or runtime brand.

Changing country preserves national digits where possible. Paste accepts
international, national and formatted text; Russian domestic `8` is normalized
under RU. Clear retains the current calling code by default and can emit an
empty value with `preserveCountryCallingCode={false}`. Disabled and read-only
states block both picker and clear actions while preserving native input
semantics.

`isPossible` and `isValid` are metadata only. Required/error presentation,
validation timing and business acceptance belong to the application.

Responsive behavior:

- narrow/mobile: searchable BottomSheet using the canonical breakpoint;
- tablet/desktop: searchable Popover matching the complete FieldShell width;
- all surfaces: the same listbox state, selection behavior and focus return.
