# packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-localview-symbol-highlight-test-ts
- Generated At: 2025-12-19T21:19:50.829Z

## Authored
### Purpose
Unit tests for symbol highlight computation. Covers edge-symbol matching, `__internals__` handling, collapse mode detection, and node-wide exporter identification (barrel files, assets).

### Notes
Created during Dev Day 50 (12/19). Tests `computeSymbolHighlight()` with various subgraph configurations to ensure correct related symbol/edge/node set computation without DOM involvement.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.829Z","inputHash":"a22ec5858136c115"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`symbol-highlight.SymbolHighlightResult`](./symbol-highlight.ts.mdmd.md#symbol-symbolhighlightresult)
- [`symbol-highlight.computeSymbolHighlight`](./symbol-highlight.ts.mdmd.md#symbol-computesymbolhighlight)
- [`types.LocalEdge`](./types.ts.mdmd.md#symbol-localedge) (type-only)
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
- [`types.ExplorerNodePayload`](../../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
