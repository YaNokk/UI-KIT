# Notification contract

`NotificationProvider` is mounted once near the application root. `notify` is the public transient-feedback API; Sonner is an internal queue and lifecycle adapter and none of its props or types are public.

The standalone `Notification` visual accepts React nodes for composable title, description, and action content. Imperative `NotifyOptions` deliberately accepts strings for `title`, `description`, and `action.label`, so calls from services, thunks, API adapters, and legacy message migrations stay text-oriented and independent from React rendering concerns.

## Semantics

- Notification content is the only live-region owner: `success`, `warning`, `info`, and `neutral` use `role="status"`; `error` uses `role="alert"`. Sonner's host live region is set to `off` to prevent duplicate announcements while retaining the attribute that keeps the global host outside modal aria isolation.
- Showing a notification never moves focus. Action and close controls remain reachable by keyboard.
- A repeated `id` updates the existing notification instead of adding a duplicate.
- `persistent` notifications do not auto-dismiss. Otherwise the default duration is 4 seconds.
- `onDismiss` runs once after automatic or explicit dismissal.
- Updating an existing `id` replaces variant, content, duration, and the final `onDismiss` callback without dismissing the previous revision.
- A notification action invokes `onClick` and then dismisses the notification. Dismissal is scheduled in `finally`, so callback errors propagate without leaving a stale notification in the queue.
- A call without a mounted provider is ignored and emits a development warning; it is not retained in a hidden queue.

## Layout and layers

- Desktop notifications stack at the logical top/end edge; compact viewports use the top center and safe-area insets.
- The provider uses the shared portal scope and canonical `toast` layer, above modal content.
- Modal isolation keeps the Sonner live region exposed because it carries `aria-live`; the notification is not mounted inside a Dialog or Drawer focus scope.
- Status colors use existing semantic status aliases and remain independent of runtime brand. Neutral uses raised-surface aliases.
- Reduced motion removes queue transitions and progress animation without changing lifecycle or semantics.
- The visual progress timer uses intentional linear easing because it represents elapsed wall time. It pauses on hover and while the document is hidden, matching Sonner's auto-dismiss pauses. An `id` update remounts the visual revision so the progress duration restarts with the lifecycle timer.

## Ownership

Use Notification for transient feedback caused by an operation. `persistent=true` removes auto-dismiss and progress; the close control remains enabled by default. Setting `closeButton=false` without an action intentionally creates an application-managed notification that can only be removed with `notify.dismiss`.

Persistent contextual state belongs to Alert or a dedicated state component; field validation belongs to field components; confirmation that needs a decision belongs to Dialog. Notification is not a permanent outage banner or validation-message replacement.
