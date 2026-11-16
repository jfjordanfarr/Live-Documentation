# tests/integration/live-docs/tidepool.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/tidepool.test.ts
- Generated At: 2026-11-16T20:15:12.588Z

## Authored
### Purpose
Holds [the tidepool sample](../../../../../tests/integration/programs/typescript/tidepool/README.md) to the make-up it exists for: each directory's mix of implementation, tests and assets as the generator reads them, every asset but one connected to the page or stylesheet that uses it, and both kinds of link between source files and documents.

### Notes
- Written on 2026-11-16 with the sample ([Turn 1 of the November 16 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-16.1.record.md#turn-1)). The sample was made because neither this repository nor the estate shows every kind of file in one directory, and the owner asked to see "what a directory with many different types of files looks like (documentation, assets, tests, implementations)" before judging colour by kind ([Turn 11 of the November 15 session](../../../../../AI-Agent-Workspace/ChatHistory/2026/11/2026-11-15.1.record.md#turn-11)). If the sample's files or the generator's reading of kinds change, the pictures drawn from it change meaning, and this test says so first.
- `tests/snapshot.png` is expected to stand unconnected: its test reads it with `readFileSync`, and the generator records a use of an asset only from an HTML attribute or a CSS `url()`. That is a gap of the adapters stated here, not hidden: when code that names an asset is recorded, this expectation changes with it.
- The sample commits the authored blocks of five Live Docs so that their links to documents exist; the estate commits none.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`fixture.copyFixture`](../../../scripts/oracle/fixture.ts.mdmd.md#symbol-copyfixture)
- `vitest` - `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
