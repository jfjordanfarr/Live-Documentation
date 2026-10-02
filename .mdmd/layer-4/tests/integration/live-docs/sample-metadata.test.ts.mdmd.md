# tests/integration/live-docs/sample-metadata.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/sample-metadata.test.ts
- Generated At: 2026-10-02T20:25:05.006Z

## Authored
### Purpose
Verifies the generated graph of a sample catalog, its nested compiler-result JSON and the source files those documents name.

### Notes
Runs the real generator and graph reader over a temporary workspace. Asserts independent expected file roles and exact catalog/compiler-to-source references, including a named test file.

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
- [`graphFiles.readLiveDocGraph`](../../../packages/engine/src/live-docs/graphFiles.ts.mdmd.md#symbol-readlivedocgraph)
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- `vitest` - `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
