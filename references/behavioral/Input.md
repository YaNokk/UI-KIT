# Input behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/input`.

- Useful behavior: native prop/ref forwarding, controlled and uncontrolled
  values, helper/error states and generic leading/trailing content.
- Adopted: native input event signatures, outer/inner labels, hint/error messages, three sizes,
  disabled/readOnly/invalid and generic adornments.
- Normalized: current 32/40/48 control scale and semantic FieldShell geometry.
- Deferred: clear action; it is not required for the stable base contract.
- Dropped: numeric/amount, lock, responsive package split and reference styling.
- Base Input performs no value transformation, preserving IME and autofill.
- Native input fills the content box and owns normal clicks/caret behavior.
  Decorative adornments/gaps may request focus; interactive adornments are isolated.
