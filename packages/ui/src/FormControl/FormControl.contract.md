# FormControl contract

FormControl owns the label, required marker, hint, error and stable ID
relationships around a form control. Its render child receives the native
attributes that must be applied to the actual interactive element.

`labelView="outer"` is the default established by the local MP Input reference.
For `inner`, the same semantic label node is supplied to FieldShell for floating
placement. An error makes the control invalid, replaces the hint, and becomes
the described message. Caller-provided `aria-describedby` IDs are preserved.
FormControl does not own borders, height, value, validation logic or
form-library state.
