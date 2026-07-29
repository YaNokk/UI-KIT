# Input contract

Input composes FormControl, FieldShell and a native input. Native attributes,
events, controlled/uncontrolled value behavior and the ref are forwarded to
the input. Label, hint/error replacement and caller `aria-describedby` IDs are
wired without replacing browser input, autofill, selection or IME behavior.

The documented label default is `outer`. `inner` uses a real semantic floating
label: focus or non-empty text floats it, while an empty unfocused input rests
it and hides the placeholder. Input tracks focus/content and supplies generic
presentation state to FieldShell. The native input fills the full content box
and owns its inline padding, so ordinary clicks remain native. Shell focus
requests are limited to decorative/non-native zones and do not swallow caller
focus/change/blur handlers.

The value, placeholder and inner label share FieldShell's logical inline
geometry variables. Adornments participate in flex layout; no text measurement,
duplicated numeric padding or direction-specific positioning is used.

Input performs no masking, parsing, formatting or value transformation.
Password, amount, masked and date behavior remain specialized compositions.
