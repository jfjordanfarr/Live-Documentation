# packages/explorer/src/client/panels/sources-facts.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/panels/sources-facts.test.ts
- Generated At: 2026-10-30T16:26:05.663Z

## Authored
### Purpose
Holds `sources-facts.ts` to a seven-file graph, its references handed in as the client hands them, from `explorerGraphOf`'s stats (since 2026-10-30), so that the panel's count of the graph's seven edges is the projection's, whose inbound and outbound lists are derived from its edges as the generator derives them: the bundle's shape by archetype, directory and extension, the references between files and the generation span; the most-used and most-using rankings with their symbol counts and the limit; the files nothing references and the non-test files only tests reference; and the public symbols nothing or only tests name, by file, with a test file's own symbols and a symbol-less file left out.

### Notes
- Written with the module on 2026-10-08 ([the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md)). Paths sort as `localeCompare` sorts them; the first draft expected ASCII order, `README.md` before `assets/data.json`, and the test caught it.
- The graph's readme became a deploy script on 2026-10-22 ([Turn 8 of the October 21 session](../../../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-21.1.record.md#turn-8)), since a readme no longer gets a doc: no reader handles the script, so the walks list it as not read rather than unreachable.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sources-facts.SourcesFactsOptions`](./sources-facts.ts.mdmd.md#symbol-sourcesfactsoptions)
- [`sources-facts.sourcesFacts`](./sources-facts.ts.mdmd.md#symbol-sourcesfacts-function)
- [`sources-facts.symbolCount`](./sources-facts.ts.mdmd.md#symbol-symbolcount)
- [`graph.explorerGraphOf`](../../shared/graph.ts.mdmd.md#symbol-explorergraphof)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
