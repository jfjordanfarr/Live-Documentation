# packages/explorer/src/client/views/localView/symbol-highlight.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/views/localView/symbol-highlight.ts
- Generated At: 2026-11-06T20:08:42.140Z

## Authored
### Purpose
Pure functions for computing symbol hover/pin highlighting in the Local Map. Determines which symbols, edges, and nodes should be visually emphasized when a user hovers or pins a symbol.

### Notes
Extracted from controller.ts during Dev Day 50 (12/19). The `computeSymbolHighlight()` function is pure computation; `applySymbolHighlight()` handles DOM mutations. This separation enables comprehensive unit testing.

Since the far bands' second milestone (2026-11-06) a reference's emphasis also falls on the overview band's gathered wire that holds it (`.connection-path.gathered` between the same two files), so that a gathered wire is emphasized when any of its references would be.

Since 2026-11-19 ([Turn 23 of the November 18 record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#turn-23)) a row's hover also keeps a pair line of an opened directory that carries one of its links. The owner opened PaymentService and PaymentService/Data in the estate sample, showed the cards' rows, pointed at a row and found that its wires did not stay lit. In Flow every wire between two cards of an opened directory is a pair line, an edge between the two files' hubs that names no symbol, and the hover matched edges by their symbols, so it kept no line, and since a row's hover fades every wire it does not keep and outranks a card's hover, it faded the whole picture. That was so from the trial's first commit (787673ef, 2026-11-12) and became what every opened directory showed when Flow became the default (0fab0846, 2026-11-13); a picture of pinned files, whose wires are references, was never affected. A pair line now carries the symbols of the links it stands for (`standsFor`, from `pairLines` in [directory-flow.ts](directory-flow.ts.mdmd.md)), and an edge is the row's when one of its links is; the rows at both ends of those links are kept with it.

The same day `connectionsHighlight` and `lightConnections` were added for a returning connection's laces and a card's foot on its returns, which keep whole connections, both their cards and the rows of their links, and fade every other card too (`connections-lit`), since a lace says nothing of its far card.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SymbolHighlightResult` {#symbol-symbolhighlightresult}
- Type: interface
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/symbol-highlight.ts#L17)

##### `SymbolHighlightResult` — Summary
Describes the result of computing related symbols from a hover.

#### `computeSymbolHighlight` {#symbol-computesymbolhighlight}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/symbol-highlight.ts#L52)
- Returns: [`SymbolHighlightResult`](#symbol-symbolhighlightresult)
- Parameters: `subgraph`: [`LocalSubgraph`](./types.ts.mdmd.md#symbol-localsubgraph); `options`: [`LocalViewOptions`](./types.ts.mdmd.md#symbol-localviewoptions)

##### `computeSymbolHighlight` — Summary
Computes which symbols, edges, and nodes should be highlighted
when a symbol is hovered or pinned.

This is a pure function that performs all the computation without
touching the DOM, making it testable.

#### `applySymbolHighlight` {#symbol-applysymbolhighlight}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/symbol-highlight.ts#L165)
- Parameters: `highlight`: [`SymbolHighlightResult`](#symbol-symbolhighlightresult)

##### `applySymbolHighlight` — Summary
Applies the computed highlight result to the DOM.
This is the side-effectful part of symbol highlighting.

#### `clearSymbolHighlightDOM` {#symbol-clearsymbolhighlightdom}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/symbol-highlight.ts#L239)

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

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
