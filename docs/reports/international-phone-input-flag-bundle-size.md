# InternationalPhoneInput flag bundle size

Measured from the production `@mypoint/ui` build with
`country-flag-icons@1.6.20`. The source package is MIT licensed and is used only
by `npm run flags:generate`; it is not a runtime dependency of `@mypoint/ui`.

## Method

`npm run flag-bundle:measure` mounts `InternationalPhoneInput` in the clean
consumer fixture and builds it twice: once with flags and once with the private
`CountryFlag` module replaced by a no-op. It records raw, gzip and Brotli sizes,
the packed UI tarball delta and emitted SVG assets. The machine-readable result
is written to `.artifacts/flag-measure/report.json`.

## Before optimization

The first measured implementation statically imported every React flag
component:

| Measurement | Raw | Gzip | Brotli |
| --- | ---: | ---: | ---: |
| Consumer JS with flags | 701,814 B | 195,012 B | 165,155 B |
| Consumer JS without flags | 486,904 B | 146,486 B | 125,341 B |
| React registry JS delta | 214,910 B | 48,526 B | 39,814 B |

The `@mypoint/ui` tarball was 318,691 B versus a 313,013 B no-flag baseline,
a 5,678 B delta. No separate flag assets were emitted because the consumer had
to load and parse the complete React component registry.

## Final sprite implementation

| Measurement | Raw | Gzip | Brotli |
| --- | ---: | ---: | ---: |
| `InternationalPhoneInput.js` direct chunk | 13,675 B | 3,449 B | 3,033 B |
| Consumer JS with flags | 488,816 B | 147,382 B | 125,749 B |
| Consumer JS without flags | 486,904 B | 146,486 B | 125,341 B |
| Sprite implementation JS delta | 1,912 B | 896 B | 408 B |
| Emitted `country-flags.sprite-*.svg` | 159,764 B | 43,886 B | 37,424 B |

The final `@mypoint/ui` tarball is 361,346 B. Its no-flag baseline is
313,179 B, so the complete private flag implementation adds 48,167 B to the
tarball. The consumer receives one fingerprinted SVG asset; there are no
per-country chunks or remote requests.

## Decision

The React registry cost was excessive because it added 214,910 B of JavaScript
and 245 React SVG component modules to a consumer that imports one phone input.
It was replaced with one generated, private 3:2 SVG sprite and a small static
ISO2 set. This reduces the JavaScript delta by 212,998 B raw and 47,630 B gzip,
keeps the graphics independently cacheable, and preserves deterministic asset
rendering.

The registry and sprite remain private and have no package export. Package
verification requires the emitted sprite, rejects a runtime
`country-flag-icons` dependency, and verifies that `CountryFlag` references the
asset. Unit integrity coverage checks that every `libphonenumber-js` country
has exactly one matching sprite symbol. Unknown country codes keep the
decorative globe fallback.
