# Select and MultiSelect v1.6

Popover triggers are owned by Floating UI `useClick`: a closed trigger opens
and the same open trigger closes exactly once. No second manual click toggle is
attached in popover presentation. BottomSheet retains its presentation-local
manual trigger behavior.

Popover focus containment is the union of the current reference trigger and
the floating surface. Focus movement between either node stays internal;
focus moving to a real external element closes the panel. Realm checks use the
surface owner document's `Node` and `Element` constructors.

For each size, Input value, Select placeholder/value and MultiSelect
placeholder/summary use the same `fieldValueText*` role. MultiSelect chips and
their `+N` overflow use the separate `compactChipText` role.

