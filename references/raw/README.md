# Raw references

Place immutable/read-only snapshots or checkouts here when reproducible local access is useful.

Recommended:

- `raw/core-ds/` — checkout/sparse checkout of relevant Core DS packages.
- `raw/mp-ui-kit/` — unpacked original MP UI KIT source.

Raw references are not imported by production code and are excluded from package builds.

For Core DS, prefer a pinned commit rather than tracking `master` indefinitely. Record the commit SHA in this README or the registry when vendoring a snapshot.
