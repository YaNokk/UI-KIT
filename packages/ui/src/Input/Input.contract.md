# Input contract

Input composes FormControl, FieldShell and a native input. Native attributes,
events, controlled/uncontrolled value behavior and the ref are forwarded to
the input. Label, hint/error replacement and caller `aria-describedby` IDs are
wired without replacing browser input, autofill, selection or IME behavior.

The documented label default is `outer`. `inner` uses a real semantic floating
label: focus or non-empty text floats it, while an empty unfocused input rests
it and hides the placeholder. Input tracks focus/content and supplies generic
presentation state to FieldShell. The native input fills the full content box
and owns its inline padding, so ordinary clicks, caret placement and selection
remain native. Outer and inner labels are real `<label htmlFor>` nodes and focus
the input through browser behavior. Focus requests are emitted only by
decorative adornment columns and do not swallow caller focus/change/blur
handlers.

The value, placeholder and inner label share FieldShell's logical inline
geometry variables. Adornments participate in flex layout; no text measurement,
duplicated numeric padding or direction-specific positioning is used.
Floated value and placeholder block padding also resolve from FieldShell's
shared variables, so Input and PasswordInput use the same vertical baseline
without reducing the full native hit area.

Editable input, semantic labels and decorative text-field adornments use the
text cursor. Read-only stays text/selectable; disabled uses the canonical
disabled cursor. Interactive adornments retain their owner component cursor.

Input performs no masking, parsing, formatting or value transformation.
Password, amount, masked and date behavior remain specialized compositions.
