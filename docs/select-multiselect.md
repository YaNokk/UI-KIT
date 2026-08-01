# Select and MultiSelect v1.6.2

Popover triggers are owned by Floating UI `useClick`: a closed trigger opens
and the same open trigger closes exactly once. No second manual click toggle is
attached in popover presentation. BottomSheet retains its presentation-local
manual trigger behavior. While the modal sheet is open, its trigger remains
behind the modal/inert boundary; closing with Escape or selecting an option
restores focus to the trigger. Outside-pointer dismissal applies to the popover
presentation and leaves focus on the external target.

The same open/close and focus-restoration contract is verified for controlled
and uncontrolled Select state. Disabled Select/MultiSelect never open;
read-only controls remain focusable but do not open or mutate their value.

Popover focus containment is the union of the current reference trigger and
the floating surface. Focus movement between either node stays internal;
focus moving to a real external element closes the panel. Realm checks use the
surface owner document's `Node` and `Element` constructors.

The visual trigger and interaction trigger are the same control. Value,
placeholder, leading presentation, loading status and chevron belong to one
button and one Floating UI `useClick` owner. Chevron and spinner are decorative
and non-focusable; neither owns an `onClick`. `FieldShell` never synthesizes a
Select activation. Clear and chip-remove buttons are independent controls;
their field boundary is excluded from outside-dismiss so clearing/removing
while open does not toggle or dismiss the popup.

Select DOM anatomy:

```text
FieldShell
├ content
│  └ button[data-select-trigger] (Floating UI reference)
│     ├ value / placeholder / leading
│     └ status
│        ├ Spinner[data-select-spinner]
│        └ Chevron[data-select-chevron]
└ endAdornment (only when clear is present)
   └ IconButton[data-select-clear]
```

MultiSelect DOM anatomy:

```text
FieldShell
├ content
│  └ multiControl
│     ├ button[data-multiselect-trigger] (activation layer/reference)
│     │  └ status / chevron
│     └ presentation layer
│        ├ placeholder / summary
│        └ chips
│           └ button[data-field-chip-remove]
└ endAdornment (only when clear is present)
   └ IconButton[data-multiselect-clear]
```

The MultiSelect presentation layer is pointer-transparent except for remove
buttons. Therefore placeholder, summary, chip body and neutral field space
resolve to the single activation layer without nesting interactive elements.

For each size, Input value, Select placeholder/value and MultiSelect
placeholder/summary use the same `fieldValueText*` typography role. Native
Input uses the private typography class only so caret and selection geometry
stay browser-native; Select/MultiSelect wrapped text additionally uses the
matching private optical class. MultiSelect chips and their `+N` overflow use
the separate `compactChipText` role.
