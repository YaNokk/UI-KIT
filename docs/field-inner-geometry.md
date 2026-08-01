# Field inner-label geometry v1.6

`FieldShell` owns the complete vertical geometry for inner-labelled controls.
Input, PasswordInput, Select and MultiSelect do not add component-specific
vertical offsets.

| Size | Height | Label top / line | Content top / bottom | Value line | Inline padding |
| --- | ---: | ---: | ---: | ---: | ---: |
| `sm` | 32px | 2px / 10px | 12px / 4px | 14px | 8px |
| `md` | 40px | 4px / 10px | 14px / 4px | 20px | 12px |
| `lg` | 48px | 4px / 12px | 16px / 8px | 22px | 16px |

The border-box equation is `border + content top + value line + content
bottom + border <= field height`. Every size has a non-zero bottom inset.
The compact 32px size uses an explicit compact caption line and value line;
there is no negative label/content gap.

Field values use `fieldValueTextSm`, `fieldValueTextMd` and
`fieldValueTextLg`. The large role is deliberately 16px. MultiSelect chips
and `+N` use `compactChipText` and are not field values.

Token admission: the missing reusable role was form field content, which could
not use Button `controlText*` without coupling form geometry to action labels.
The 14px and 22px line-height primitives exist only to make the fixed 32px and
48px border-box equations safe; existing 18px/24px lines do not fit those
explicit bands. Typography metrics are mode- and brand-independent, and are
not responsive: the public `FieldSize` selects them.

The label has stable caption typography and a stable floated top. Its resting
appearance is a per-size translate/scale from that origin. Floated, focused,
filled, invalid, disabled and read-only states do not alter layout metrics.
