# packages/explorer/src/client/panels/sources-facts.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: packages/explorer/src/client/panels/sources-facts.test.ts
- Generated At: 2026-10-08T17:03:51.654Z

## Authored
### Purpose
Holds `sources-facts.ts` to a seven-file graph whose inbound and outbound lists are derived from its edges as the generator derives them: the bundle's shape by archetype, directory and extension, the references between files and the generation span; the most-used and most-using rankings with their symbol counts and the limit; the files nothing references and the non-test files only tests reference; and the public symbols nothing or only tests name, by file, with a test file's own symbols and a symbol-less file left out.

### Notes
- Written with the module on 2026-10-08 ([the dead code sweep](../../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md)). Paths sort as `localeCompare` sorts them, so `assets/data.json` precedes `README.md`; the first draft expected ASCII order and the test caught it.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`sources-facts.sourcesFacts`](./sources-facts.ts.mdmd.md#symbol-sourcesfacts-function)
- [`sources-facts.symbolCount`](./sources-facts.ts.mdmd.md#symbol-symbolcount)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
