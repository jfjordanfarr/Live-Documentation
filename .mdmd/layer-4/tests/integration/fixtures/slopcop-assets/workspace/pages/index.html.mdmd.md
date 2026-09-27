# tests/integration/fixtures/slopcop-assets/workspace/pages/index.html

## Metadata
- Layer: 4
- Archetype: asset
- Code Path: tests/integration/fixtures/slopcop-assets/workspace/pages/index.html
- Generated At: 2026-09-27T23:21:33.325Z

## Authored
### Purpose
Fixture HTML page that exercises SlopCop asset validation by referencing both valid and intentionally missing resources.

### Notes
- Links to `styles/site.css` and a missing stylesheet so asset linting can assert both success and failure paths.
- Serves as the primary consumer for config-driven asset rules defined in `slopcop.config.json`.
- Update alongside configured asset expectations to keep lint behaviour deterministic.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`awesome`](../public/fonts/awesome.woff2.mdmd.md)
- [`banner-hash.123abc456def7890`](../public/images/banner-hash.123abc456def7890.png.mdmd.md)
- [`banner`](../public/images/banner.png.mdmd.md)
- [`banner@2x`](../public/images/banner@2x.png.mdmd.md)
- [`gallery`](../public/images/gallery.png.mdmd.md)
- [`missing`](../public/images/missing.png.mdmd.md)
- [`trailer`](../public/images/trailer.jpg.mdmd.md)
- [`missing`](../public/styles/missing.css.mdmd.md)
- [`intro`](../public/videos/intro.mp4.mdmd.md)
- [`site`](../styles/site.css.mdmd.md)
<!-- LIVE-DOC:END Dependencies -->
