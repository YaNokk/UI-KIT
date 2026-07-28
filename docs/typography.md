# Typography

The source of truth is the DTCG token layer:

```text
font.* + lineHeight.*
        ↓
typography.caption/body*/heading*/pageTitle
        ↓
CSS variables + Tailwind utilities + Text/Heading
```

Canonical CSS:

```css
.meta {
  font: var(--ds-typography-body-sm);
  color: var(--ds-text-secondary);
}
```

Canonical Tailwind:

```tsx
<div className="typo-body-sm text-text-secondary">Дополнительная информация</div>
```

React primitives are optional:

```tsx
<Text as="p" variant="bodySm" tone="secondary">
  Дополнительная информация
</Text>

<Heading level={2} variant="page">
  Визуально крупный h2
</Heading>
```

Typography roles do not contain color or margins. Atomic components do not
change typography by viewport.
