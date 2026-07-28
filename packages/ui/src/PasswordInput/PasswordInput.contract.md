# PasswordInput contract

PasswordInput reuses Input and changes only the native `type` plus a trailing
visibility action. Visibility supports controlled and uncontrolled usage and
never duplicates the value. The native input ref, autocomplete attributes and
password-manager-compatible DOM remain intact.

The Eye/EyeOff icon is decorative inside a native IconButton. The action has
localized show/hide labels, stays in logical Tab order and uses native Enter
and Space activation.
