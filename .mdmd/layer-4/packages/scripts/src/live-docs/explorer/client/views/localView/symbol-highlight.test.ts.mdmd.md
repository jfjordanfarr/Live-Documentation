# packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.test.ts
- Live Doc ID: LD-test-packages-scripts-src-live-docs-explorer-client-views-localview-symbol-highlight-test-ts
- Generated At: 2026-02-03T21:55:36.822Z

## Authored
### Purpose
Unit tests for symbol highlight computation. Covers edge-symbol matching, `__internals__` handling, collapse mode detection, and node-wide exporter identification (barrel files, assets).

### Notes
Created during Dev Day 50 (12/19). Tests `computeSymbolHighlight()` with various subgraph configurations to ensure correct related symbol/edge/node set computation without DOM involvement.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.822Z","inputHash":"2cb1f5038d6f854b"}]} -->
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
#### Vitest Unit Tests
- packages/scripts/src/live-docs/explorer/client: [types.ts](../../types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views: [symbolAnchors.ts](../symbolAnchors.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/client/views/localView: [state.ts](./state.ts.mdmd.md), [symbol-highlight.ts](./symbol-highlight.ts.mdmd.md), [types.ts](./types.ts.mdmd.md)
- packages/scripts/src/live-docs/explorer/shared: [types.ts](../../../shared/types.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
