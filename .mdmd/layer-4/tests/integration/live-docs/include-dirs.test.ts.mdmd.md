# tests/integration/live-docs/include-dirs.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/include-dirs.test.ts
- Generated At: 2026-10-16T00:58:48.597Z

## Authored
### Purpose
The C and C++ adapter's include rule held to the compiler: over the include-directories fixture, every quoted include the generated docs resolve is the file scip-clang resolved under `-I include -I src -I .`, no other, the decoys nothing includes stay unreferenced, and a system include stays external.

### Notes
- Written 2026-10-16 after the measurement that chose the rule ([the probe](../../../../../AI-Agent-Workspace/Probes/2026-10-16/include-rules/README.md); [Turn 10 of the October 15 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-15.1.record.md#turn-10)). The compiler's resolutions are the edges of the fixture's `expected/compiler-edges.json` whose symbol is the included file's own; `npm run oracle:index` rewrites them after a change to the fixture. The fixture is copied to a temporary workspace with the shipped defaults and `expected/**` excluded, so the expectation file is never documented as part of the program.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:os` - `os`
- `node:path` - `path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graph.LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
