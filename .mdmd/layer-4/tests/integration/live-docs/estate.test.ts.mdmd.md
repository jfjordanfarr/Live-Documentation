# tests/integration/live-docs/estate.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/estate.test.ts
- Generated At: 2026-10-09T20:42:20.715Z

## Authored
### Purpose
The estate sample scanned as seven things against the estate scanned once, which is [the probe of the World Map's first ticket](../../../../../AI-Agent-Workspace/Probes/2026-10-09/two-scans.md) kept as a test. Each thing's folder is scanned alone into a copy of the sample, the scans are read as the board names them and merged into the estate's graph, and the wires the board draws are compared with the one-scan build's wire by wire: the same wires, every hand-verified remote edge found in both or in neither, what each thing stands on the same, the same ghosts, and the wires to the shared contracts library carried by one project reference each where the one scan carried every use, the cost of carving where the facts are not whole, stated rather than hidden. A second case generates docs at the root and inside one thing and checks that the root scan alone is read and the inner one reported.

### Notes
- Written on 2026-10-09 with the build ([Turn 10 of the October 9 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-09.1.record.md#turn-10)). The one-scan build is the oracle because the owner's rule for a solution is to scan its root and carve it on the board; scanning each project alone is what a person does when the deployments differ, and this test says what that costs. The result-column edge from `PostPaymentRow.cs` to the procedure is missing in both builds, a gap of the adapters that the probe noticed and this test does not hide, since it compares the builds against each other and the hand-verified edges against both.

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
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`board.parseBoard`](../../../packages/engine/src/live-docs/board.ts.mdmd.md#symbol-parseboard)
- [`boardGraph.Wire`](../../../packages/engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-wire)
- [`boardGraph.deriveBoardGraph`](../../../packages/engine/src/live-docs/boardGraph.ts.mdmd.md#symbol-deriveboardgraph)
- [`graphFiles.readEstateGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readestategraph)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`compare.fixtureGlobs`](../../../scripts/oracle/compare.ts.mdmd.md#symbol-fixtureglobs)
- [`files.readHandVerifiedEdges`](../../../scripts/oracle/files.ts.mdmd.md#symbol-readhandverifiededges)
- [`fixture.copyFixture`](../../../scripts/oracle/fixture.ts.mdmd.md#symbol-copyfixture)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
