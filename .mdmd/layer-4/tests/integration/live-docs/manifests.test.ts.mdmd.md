# tests/integration/live-docs/manifests.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/manifests.test.ts
- Generated At: 2026-10-22T16:48:00.953Z

## Authored
### Purpose
The manifests of Rust, Python, Maven and Go as Live Docs, over the manifests fixture, discovered by the shipped default globs: the package each publishes, what each stands on linked or kept external, every manifest a tooling entry, and the Entry lines the manifests write on the files they start.

### Notes
- Written 2026-10-16 with the manifest adapters ([Turn 3 of the October 16 record](../../../../../AI-Agent-Workspace/ChatHistory/2026/10/2026-10-16.1.record.md#turn-3)). The expectations are a reading of the fixture's files, not a run of the generator; the fixture is copied to a temporary workspace before generating.
- The Rust binary lives at `src/main.rs` so that the Rust adapter, which knows crate roots only at their conventional paths, marks its `main`; the Go module's import of the replaced module stays external on `main.go`, since the Go adapter does not follow a `replace`.

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
- [`document.entryWords`](../../../packages/engine/src/live-docs/document.ts.mdmd.md#symbol-entrywords)
- [`graph.LiveDocGraph`](../../../packages/engine/src/live-docs/graph.ts.mdmd.md#symbol-livedocgraph) (type-only)
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `afterAll`, `beforeAll`, `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/architectural-decisions.mdmd.md`](../../../../layer-3/architectural-decisions.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
