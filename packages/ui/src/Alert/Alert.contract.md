# Alert contract

`Alert` is a fluid, inline contextual-feedback primitive. It participates in normal layout, has no queue, portal, provider, timer, dismissal lifecycle, or local layer.

## API and semantics

- Variants are `success`, `error`, `warning`, `info`, and `neutral`.
- `title` and body `children` are independently optional.
- A standard semantic icon is selected by variant. `icon` replaces it; `icon={false}` removes the icon slot.
- Alert is an ordinary contextual block by default and does not add `role="alert"` or `role="status"`. Consumers may provide live-region semantics through native HTML attributes when content is inserted dynamically.
- Native div attributes, `className`, data attributes, aria attributes, and refs are forwarded.

## Ownership

- Use Alert for inline page, form, card, Dialog, Drawer, or Modal context that must remain visible.
- Use Notification for transient operation feedback that is queued and rendered in the global toast layer.
- Field validation belongs to field components.
- Confirmation that requires a decision belongs to Dialog.
- Persistent server outage or product state belongs to Alert or a dedicated state component, never to the transient notification queue.

Alert and Notification share only the private feedback variant, icon, and semantic palette foundation. There is no public `FeedbackBase`, inline Notification mode, or toast Alert mode.
