# FormControl behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/form-control`.

- Useful behavior: label, helper/error composition and distinct form states.
- Adopted: stable label/control association, helper/error IDs, required marker,
  disabled presentation and invalid coordination.
- Normalized: one responsive-independent contract using current typography and
  semantic tokens; no desktop/mobile implementation split.
- Added: caller `aria-describedby` merging and a render child that puts native
  attributes on the real interactive element.
- Dropped: reference themes, visual tokens and input geometry.
