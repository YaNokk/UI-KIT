# Notification contract

`NotificationProvider` is mounted once near the application root. `notify` is the public transient-feedback API; Sonner is an internal queue and lifecycle adapter and none of its props or types are public.

## Semantics

- `success`, `warning`, `info`, and `neutral` are polite status messages. `error` is assertive.
- Showing a notification never moves focus. Action and close controls remain reachable by keyboard.
- A repeated `id` updates the existing notification instead of adding a duplicate.
- `persistent` notifications do not auto-dismiss. Otherwise the default duration is 4 seconds.
- `onDismiss` runs once after automatic or explicit dismissal.

## Layout and layers

- Desktop notifications stack at the logical top/end edge; compact viewports use the top center and safe-area insets.
- The provider uses the shared portal scope and canonical `toast` layer, above modal content.
- Modal isolation keeps the Sonner live region exposed because it carries `aria-live`; the notification is not mounted inside a Dialog or Drawer focus scope.
- Status colors use existing semantic status aliases and remain independent of runtime brand. Neutral uses raised-surface aliases.
- Reduced motion removes queue transitions and progress animation without changing lifecycle or semantics.

## Ownership

Use Notification for transient feedback caused by an operation. Persistent contextual state belongs to Alert/InlineMessage; field validation belongs to field components; confirmation that needs a decision belongs to Dialog.
