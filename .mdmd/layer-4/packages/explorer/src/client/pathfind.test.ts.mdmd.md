# packages/explorer/src/client/pathfind.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/pathfind.test.ts
- Generated At: 2026-10-14T21:04:58.568Z

## Authored
### Purpose

Unit tests of the pathfinder's search over a four-file graph: the path is found only when the end depends on the start, the reverse is returned provider first when only the start depends on the end, neither is found for unconnected files, the hop limit is reported, a mutual dependency prefers the drawable direction, a start set leaves from whichever file reaches and an end set stops at the first file reached but never at a start itself, and the count of references against a path ignores files outside it.

### Notes

- The set cases were added on 2026-10-14 when the search took sets for a directory at either end ([Turn 6](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)).
- Written on [2026-10-01](../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-01.1.record.md#turn-10) with the direction rule; the graph is three files in a line plus one alone, which is enough to tell the two directions apart.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`pathfind.findPath`](./pathfind.ts.mdmd.md#symbol-findpath)
- [`pathfind.reachOf`](./pathfind.ts.mdmd.md#symbol-reachof)
- [`pathfind.referencesAgainstPath`](./pathfind.ts.mdmd.md#symbol-referencesagainstpath)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
