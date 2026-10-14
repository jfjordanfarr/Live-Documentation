# tests/e2e/force-graph-focus.spec.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/e2e/force-graph-focus.spec.ts
- Generated At: 2026-10-14T02:49:23.268Z

## Authored
### Purpose
Exercises file focus in the rendered Force Graph through URLs, search, node clicks, filtering, resizing and return from Local Map.

### Notes
The canvas-center click verifies the actual sphere’s identity rather than only its HTML label. Manual-pan restoration is measured after the existing force simulation’s 15-second cooldown. The estate case also exercises reduced motion.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@playwright/test` - `Page`, `expect`, `test`
- [`force-graph-observation.observeGraph`](./force-graph-observation.ts.mdmd.md#symbol-observegraph)
- [`force-graph-observation.renderedNodes`](./force-graph-observation.ts.mdmd.md#symbol-renderednodes)
- [`still-picture.localRetainUrl`](./still-picture.ts.mdmd.md#symbol-localretainurl)
<!-- LIVE-DOC:END Dependencies -->
