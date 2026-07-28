# Stack/layer behavioral extraction

Source: local Core DS snapshot in `references/raw/core-ds/stack`.

The reference confirms the value of named stacking levels, but a public React
Stack component is unnecessary. This repository keeps layering in canonical
DTCG `zIndex` tokens. Components use semantic levels and never copy the
reference package architecture or arbitrary numeric z-index values.
