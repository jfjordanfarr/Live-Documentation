# tests/e2e/world-map-handle.d.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/world-map-handle.d.ts
- Generated At: 2026-10-19T16:54:55.202Z

## Authored
### Purpose
Give browser tests one shared, source-derived type for the World Map's diagnostic handle on `window`.

### Notes
- The World Map controller owns the handle's actual shape. The browser specs exercise different portions of it, so this declaration prevents their separate local interfaces from conflicting during test-wide type checking.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`controller.WorldMapApi`](../../packages/explorer/src/client/views/worldMap/controller.ts.mdmd.md#symbol-worldmapapi) (type-only)
<!-- LIVE-DOC:END Dependencies -->
