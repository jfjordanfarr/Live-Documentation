# packages/explorer/src/client/search/graph-search.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/search/graph-search.test.ts
- Generated At: 2026-10-14T21:04:58.785Z

## Authored
### Purpose

Vitest over the pure search: the directories derived from the files, the words split, files grouped by directory with the name scoring above a symbol match, the cap of five symbols with the rest counted and the expansion listing them all, a directory offered by its own name, a path-only match, the file limit keeping the best scores, and the flat rows in reading order with the fold in its place.

### Notes

- Written with the module on 2026-10-14 ([Turn 6](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-14.1.record.md#turn-6)); the fixture is four files whose symbols are chosen so that one word matches seven of them, which is what the cap and the fold need to be told apart.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`graph-search.SearchIndex`](./graph-search.ts.mdmd.md#symbol-searchindex)
- [`graph-search.destinationScope`](./graph-search.ts.mdmd.md#symbol-destinationscope)
- [`graph-search.directoriesOf`](./graph-search.ts.mdmd.md#symbol-directoriesof)
- [`graph-search.directoryOf`](./graph-search.ts.mdmd.md#symbol-directoryof)
- [`graph-search.reachWords`](./graph-search.ts.mdmd.md#symbol-reachwords)
- [`graph-search.searchGraph`](./graph-search.ts.mdmd.md#symbol-searchgraph)
- [`graph-search.searchIndexOf`](./graph-search.ts.mdmd.md#symbol-searchindexof)
- [`graph-search.searchRows`](./graph-search.ts.mdmd.md#symbol-searchrows)
- [`graph-search.termsOf`](./graph-search.ts.mdmd.md#symbol-termsof)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
