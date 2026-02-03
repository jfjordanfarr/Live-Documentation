# packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-views-localview-symbol-highlight-ts
- Generated At: 2026-02-03T21:55:36.845Z

## Authored
### Purpose
Pure functions for computing symbol hover/pin highlighting in the Local Map. Determines which symbols, edges, and nodes should be visually emphasized when a user hovers or pins a symbol.

### Notes
Extracted from controller.ts during Dev Day 50 (12/19). The `computeSymbolHighlight()` function is pure computation; `applySymbolHighlight()` handles DOM mutations. This separation enables comprehensive unit testing.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:36.845Z","inputHash":"19dd0d09951490f7"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolHighlightResult` {#symbol-symbolhighlightresult}
- Type: interface
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts#L17)

##### `SymbolHighlightResult` — Summary
Describes the result of computing related symbols from a hover.

#### `computeSymbolHighlight` {#symbol-computesymbolhighlight}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts#L52)
- Returns: [`SymbolHighlightResult`](#symbol-symbolhighlightresult)
- Parameters: `subgraph`: [`LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph); `options`: [`LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions)

##### `computeSymbolHighlight` — Summary
Computes which symbols, edges, and nodes should be highlighted
when a symbol is hovered or pinned.

This is a pure function that performs all the computation without
touching the DOM, making it testable.

#### `applySymbolHighlight` {#symbol-applysymbolhighlight}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts#L172)
- Parameters: `highlight`: [`SymbolHighlightResult`](#symbol-symbolhighlightresult)

##### `applySymbolHighlight` — Summary
Applies the computed highlight result to the DOM.
This is the side-effectful part of symbol highlighting.

#### `clearSymbolHighlightDOM` {#symbol-clearsymbolhighlightdom}
- Type: function
- Source: [source](../../../../../../../../../../packages/scripts/src/live-docs/explorer/client/views/localView/symbol-highlight.ts#L243)

##### `clearSymbolHighlightDOM` — Summary
Clears all symbol highlighting from the DOM.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph) (type-only)
- [`types.LocalSubgraphLink`](./types.ts.mdmd.md#symbol-localsubgraphlink) (type-only)
- [`types.LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions) (type-only)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [symbol-highlight.test.ts](./symbol-highlight.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
