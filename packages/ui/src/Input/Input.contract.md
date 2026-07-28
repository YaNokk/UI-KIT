# Input contract

Input composes FormControl, FieldShell and a native input. Native attributes,
events, controlled/uncontrolled value behavior and the ref are forwarded to
the input. Label, description, error and caller `aria-describedby` IDs are
wired without replacing browser input, autofill, selection or IME behavior.

Input performs no masking, parsing, formatting or value transformation.
Password, amount, masked and date behavior remain specialized compositions.
