# FormControl behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/form-control`.

- Useful behavior: label, helper/error composition and distinct form states.
- Adopted: stable label/control association, hint/error IDs, required marker,
  disabled presentation and invalid coordination.
- Normalized: one responsive-independent contract using current typography and
  semantic tokens; no desktop/mobile implementation split.
- Added: error-replaces-hint policy, caller `aria-describedby` merging and a render child that puts native
  attributes on the real interactive element.
- Dropped: reference themes, visual tokens and input geometry.

## v1.4 DOM/interaction audit

The local Core DS FormControl owns the outer field wrapper, visual inner label,
input wrapper and sibling addon columns. Its visual inner label is rendered
with `span`/`div` nodes rather than a native `<label>`, so that detail is not
adopted. Our FormControl keeps the stronger semantic `<label htmlFor>` contract
for both outer and inner placement.
