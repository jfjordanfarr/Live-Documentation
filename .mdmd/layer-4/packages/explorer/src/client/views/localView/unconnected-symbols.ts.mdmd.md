# `packages/explorer/src/client/views/localView/unconnected-symbols.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `packages/explorer/src/client/views/localView/unconnected-symbols.ts`
- Generated At: 2026-11-23T14:55:16.761Z

## Authored
### Purpose
Decides which symbols of a file no reference of the whole graph touches, and what a 2D card that draws every row does with such a row under Tuning → 2D Layout → Unconnected: draws it as before, draws it faded, or folds it into the card's "+N symbols".

### Notes
- Written 2026-11-23 for a trial on the owner's word that day, before the PowerShell sample's parse pinned whole, a card of 138 unwired rows: "can we make it so that, by default, the symbols which have no reference to anything else are not shown or dimmed or something? I'm looking at this powershell module here going 'holy moly'" ([the day's record](../../../../../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-23/2026-11-23.1.record.md)). Shown, the default, is the rule of 2026-10-03 (a file pinned whole keeps every row); the owner decides the default by eye.
- A symbol counts as touched by a link of the Explorer's graph that names it at either end, or by a reference within its own file as `buildSelfLoopEdges` finds them, the same references the card draws as laces. A file-level link (an import that names no symbol) touches no symbol. It is decided from the whole graph, not from the picture, so a row does not change kind with the pins or the display filters.
- `unconnectedRow` is the one rule of a row's treatment; `rowPresentation` in `branch-renderer.ts` calls it beside the compact card's own disclosure, so a folded row is a hidden row like any other and the count line, its press and the layout's measure of the card are the compact card's, not a second fold.
- The browser case `tests/e2e/unconnected-symbols.spec.ts` checks it against an oracle read from the engine's graph itself, not from this function.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `unconnectedSymbols` {#symbol-unconnectedsymbols}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/unconnected-symbols.ts#L27)
- Returns: `ReadonlyMap`

##### `unconnectedSymbols` — Summary
Each file's unconnected symbols, by the file's id, as their normalized names. A file whose every symbol is touched,
or that has none, is absent.

#### `UnconnectedRow (type)` {#symbol-unconnectedrow-type}
- Type: type
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/unconnected-symbols.ts#L56)

##### `UnconnectedRow (type)` — Summary
What one row of a card pinned whole is under the lever: drawn as today, drawn faded, or not drawn.

#### `unconnectedRow (function)` {#symbol-unconnectedrow-function}
- Type: function
- Source: [source](../../../../../../../../packages/explorer/src/client/views/localView/unconnected-symbols.ts#L63)
- Returns: [`UnconnectedRow`](#symbol-unconnectedrow-type)
- Parameters: `choice`: [`UnconnectedRows`](../../types.ts.mdmd.md#symbol-unconnectedrows)

##### `unconnectedRow (function)` — Summary
One row's treatment. Only an unconnected row of a card that draws every row is touched, and never one the person
asked for: a symbol pinned by name, the symbol the address or a search names, or a row whose evidence is open; nor
any row of a card whose folded rows the person has asked to see.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.UnconnectedRows`](../../types.ts.mdmd.md#symbol-unconnectedrows) (type-only)
- [`subgraph-builder.buildSelfLoopEdges`](./subgraph-builder.ts.mdmd.md#symbol-buildselfloopedges)
- [`symbolAnchors.normalizeSymbolIdentifier`](../symbolAnchors.ts.mdmd.md#symbol-normalizesymbolidentifier)
- [`types.ExplorerGraphPayload`](../../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
