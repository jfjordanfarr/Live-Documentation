# tests/integration/live-docs/board.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/board.test.ts
- Generated At: 2026-10-02T20:20:04.050Z

## Authored
### Purpose
The two real boards. The estate sample's board is joined to docs generated over a copy of the sample and must carry every remote hand-verified edge as a wire between the two things that hold its files, the declared tunnel as its one declared wire, the gateway's route among its doors, and the oracle's table as a door that carries the file publishing it. This repository's own board parses, lints clean, finds docs for every thing with a folder, and draws a source wire from the scripts to the engine.

### Notes
- The estate's half generates its docs with the oracle's fixture globs into a temporary copy, so the sample is never written to; the repository's half reads the committed mirror, so it holds only after `live-docs:generate`, which the gate runs first.
- Written on 2026-09-28 with the grammar ([Turn 45](../../../../../AI-Agent-Workspace/ChatHistory/2026/09/Summarized/2026-09-27.1.SUMMARIZED.md#turn-45)). The repository's board was questioned by the owner on 2026-10-02 as an estate that is "basically just its major directories", and stands until that fork is decided; the question is kept on [the board itself](../../../../layer-3/board.mdmd.md).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path` - `path`
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationConfigInput`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfiginput)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`board.lintBoard`](../../../packages/engine/src/live-docs/board.ts.mdmd.md#symbol-lintboard)
- [`board.parseBoard`](../../../packages/engine/src/live-docs/board.ts.mdmd.md#symbol-parseboard)
- [`boardGraph.deriveBoardGraph`](../../../packages/engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-deriveboardgraph)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`compare.fixtureGlobs`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-fixtureglobs)
- [`files.readHandVerifiedEdges`](../../../scripts/oracle/files.ts.mdmd.md#symbol-readhandverifiededges)
- [`fixture.copyFixture`](../../../scripts/oracle/fixture.ts.mdmd.md#symbol-copyfixture)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
