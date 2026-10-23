# tests/e2e/force-graph-identity.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-identity.spec.ts
- Generated At: 2026-10-23T22:17:30.283Z

## Authored
### Purpose
Keep the 3D Local Map’s readable file and directory identities, neighbourhood framing and explicit Fit recovery usable in the built Explorer.

### Notes
Created after the October 23 root playtest. Main-repository and estate arrivals are checked against actual rendered sphere bounds; Portal is followed between layouts and through inspection. Text audits check collisions, clipping, reading size and direct viewport bounds, avoiding IntersectionObserver’s fractional rounding of a fully visible rectangle. Fit must recover the visible neighbourhood without changing the exploration. An unselected root must frame the estate without inventing pins. A compositor-pixel check catches an idle canvas cleared despite correct scene geometry; the draw count also confirms that an unchanged picture releases WebGL work.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`design-audit.overlapsAmong`](./design-audit.ts.mdmd.md#symbol-overlapsamong)
- [`design-audit.textBoxes`](./design-audit.ts.mdmd.md#symbol-textboxes)
- [`design-audit.truncations`](./design-audit.ts.mdmd.md#symbol-truncations)
- [`force-graph-observation.engineActivity`](./force-graph-observation.ts.mdmd.md#symbol-engineactivity)
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedLinks`](./force-graph-observation.ts.mdmd.md#symbol-renderedlinks)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`search-bar.currentSnapshot`](./search-bar.ts.mdmd.md#symbol-currentsnapshot)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
