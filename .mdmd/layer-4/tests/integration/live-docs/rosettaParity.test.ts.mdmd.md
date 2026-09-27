# tests/integration/live-docs/rosettaParity.test.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/live-docs/rosettaParity.test.ts
- Live Doc ID: LD-test-tests-integration-live-docs-rosettaparity-test-ts
- Generated At: 2026-09-27T08:09:23.274Z

## Authored
### Purpose

Cross-language integration test that runs the full Live Documentation pipeline (`generateLiveDocs`) against the eight Rosetta fixtures (TypeScript, Java, C#, Python, Rust, Go, C, Ruby) and compares the generated markdown across languages, so a regression in any one adapter shows up as an outlier.

### Notes

- Runs in the Vitest `integration` project; the eight fixtures are generated once in `beforeAll`, then seven assertions read the results: error-free generation, file processing, canonical node role coverage, the leaf invariant (helpers has no outgoing production deps), the foundation invariant (types has no outgoing production deps), edge topology consensus (6 of 8 languages agree), and symbol name consensus (6 of 8 agree).
- Parses generated markdown to extract Dependencies and Public Symbols sections and classifies dependency targets into canonical roles. Namespace segments use exact matching (`classifyNamespaceSegment`) because substring matching once classified `ctype.h` as "types".
- Each fixture runs in an isolated temp directory. The test writes a diagnostic matrix (`AI-Agent-Workspace/tmp/rosetta-parity-matrix.md`) with per-language, per-assertion results.
- Parity is a smoke alarm, not a correctness measure; the compiler-backed oracle described in the architectural decisions is the measure. Created 2026-03-11; moved off the VS Code Electron harness 2026-09-27.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T08:09:23.274Z","inputHash":"df3194472216f869"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
_No public symbols detected_
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:assert`
- `node:fs/promises`
- `node:os`
- `node:path`
- [`generator.generateLiveDocs`](../../../packages/server/src/features/live-docs/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LIVE_DOCUMENTATION_FILE_EXTENSION`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-live_documentation_file_extension)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- `vitest` - `beforeAll`, `describe`, `it`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
#### Vitest Integration Tests
- packages/server/src/features/live-docs: [evidenceBridge.ts](../../../packages/server/src/features/live-docs/evidenceBridge.ts.mdmd.md), [generator.ts](../../../packages/server/src/features/live-docs/generator.ts.mdmd.md)
- packages/shared/src/config: [liveDocumentationConfig.ts](../../../packages/shared/src/config/liveDocumentationConfig.ts.mdmd.md)
- packages/shared/src/live-docs: [core.ts](../../../packages/shared/src/live-docs/core.ts.mdmd.md), [markdown.ts](../../../packages/shared/src/live-docs/markdown.ts.mdmd.md), [schema.ts](../../../packages/shared/src/live-docs/schema.ts.mdmd.md)
- packages/shared/src/tooling: [pathUtils.ts](../../../packages/shared/src/tooling/pathUtils.ts.mdmd.md)
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
