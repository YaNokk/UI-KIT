# FormControl contract

FormControl owns the label, required marker, description, error and stable ID
relationships around a form control. Its render child receives the native
attributes that must be applied to the actual interactive element.

An error makes the control invalid by default. Caller-provided
`aria-describedby` IDs are merged with description and error IDs. FormControl
does not own borders, height, value, validation logic or form-library state.
