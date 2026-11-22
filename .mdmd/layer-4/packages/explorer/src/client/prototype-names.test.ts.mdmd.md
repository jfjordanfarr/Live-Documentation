# `packages/explorer/src/client/prototype-names.test.ts`

## Metadata
- Layer: 4
- Archetype: test
- Code Path: `packages/explorer/src/client/prototype-names.test.ts`
- Generated At: 2026-11-22T06:36:02.826Z

## Authored
### Purpose
Holds the Explorer's lookups of a file by its path to files named as the members every plain JavaScript object inherits (`__proto__`, `constructor`, `toString`, `hasOwnProperty`). It generates a folder holding them and a JSON file naming each, parses the index as the page does, into plain objects, and asks four lookups of it: the graph the page carries (each file a node, each named file its edge's target, with its doc), the reader's links, the sources' facts and the world map's count of a piece's symbols. A name every object has and no file does (`valueOf`) must be no file.

### Notes
- Written on 2026-11-22 at root's ask, the fixture of `tests/integration/live-docs/prototype-names.test.ts` generated here. Before the mend two of the four lookups threw on `valueOf`, taking a plain object's member for a file (the reader's links reading its `find`, the world map its `length`); the other two passed, since every path their edges and walk hand them is a file's, and go through the same function so that a path is looked up one way. Each lookup now goes through the engine's one way to ask a graph for a path, `fileAt` in `packages/engine/src/live-docs/graph.ts`.
- `client/views/localView/card-reading.ts` keeps its own lookups, left to the builder whose files they are.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`Board`](../../../engine/src/live-docs/board.ts.mdmd.md#symbol-board) (type-only)
- [`boardGraph.deriveBoardGraph`](../../../engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-deriveboardgraph)
- [`graph.LiveDocGraph`](../../../engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`sources-facts.sourcesFacts`](./panels/sources-facts.ts.mdmd.md#symbol-sourcesfacts-function)
- [`reader-links.fileInspection`](./reader-links.ts.mdmd.md#symbol-fileinspection)
- [`model.buildWorldModel`](./views/worldMap/model.ts.mdmd.md#symbol-buildworldmodel)
- [`graph.explorerGraphOf`](../shared/graph.ts.mdmd.md#symbol-explorergraphof)
- [`generator.generateLiveDocs`](../../../generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
