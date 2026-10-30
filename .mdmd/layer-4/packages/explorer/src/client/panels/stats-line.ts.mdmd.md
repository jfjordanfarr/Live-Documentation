# packages/explorer/src/client/panels/stats-line.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/panels/stats-line.ts
- Generated At: 2026-10-30T16:45:20.937Z

## Authored
### Purpose
Words the sidebar's line of counts: the files, the documented references between them and the dependency lines whose target the scan does not hold, with thousands separators. The client writes it from today's stats, or from the stats of the moment of the history the 3D picture shows.

### Notes
- Written on 2026-10-30 for the owner's decision of [Turn 3](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-30.1.record.md#turn-3): one number of references in the sidebar and in Knowledge Sources, the third count named for what it counts, and the line following the history's moment. Before, the line was written once at startup and printed the deduplicated links as references.
- A moment's stats carry no count of dependencies outside the scan, since the history's sequence keeps no dependency lines; the line then leaves that part out rather than print a zero it does not know.
- Kept by `stats-line.test.ts`; the line in the page by `tests/e2e/inventory-counts.spec.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `statsLineOf` {#symbol-statslineof}
- Type: function
- Source: [source](../../../../../../../packages/explorer/src/client/panels/stats-line.ts#L17)
- Parameters: `stats`: [`ExplorerGraphStats`](../../shared/types.ts.mdmd.md#symbol-explorergraphstats)

##### `statsLineOf` — Summary
The line for the stats, with thousands separators.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerGraphStats`](../../shared/types.ts.mdmd.md#symbol-explorergraphstats) (type-only)
<!-- LIVE-DOC:END Dependencies -->
