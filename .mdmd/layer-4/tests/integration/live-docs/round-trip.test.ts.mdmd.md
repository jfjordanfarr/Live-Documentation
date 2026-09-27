# tests/integration/live-docs/round-trip.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/round-trip.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-round-trip-test-ts
- Generated At: 2026-09-27T22:11:42.440Z

## Authored
### Purpose
The property behind "markdown is a lightweight AST": every committed Live Doc of this repository, and every doc the generator writes for the sample programs, parses and renders back to the same bytes.

### Notes
- Added 2026-09-27 with the grammar. A failure names the doc and the line the parser refused, so a generator change that writes something the grammar does not describe is caught before it is committed.
- The sample programs are copied to a temporary workspace before generation, as the oracle does, so no fixture is ever written to.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T22:11:42.440Z","inputHash":"9888c528246ec98f"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs`
- `node:os`
- `node:path` - `path`
- [`generator.generateLiveDocs`](../../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`document.parseLiveDoc`](../../../packages/shared/src/live-docs/document.ts.mdmd.md#symbol-parselivedoc)
- [`document.renderLiveDoc`](../../../packages/shared/src/live-docs/document.ts.mdmd.md#symbol-renderlivedoc)
- `vitest` - `describe`, `expect`, `it`
<!-- LIVE-DOC:END Dependencies -->
