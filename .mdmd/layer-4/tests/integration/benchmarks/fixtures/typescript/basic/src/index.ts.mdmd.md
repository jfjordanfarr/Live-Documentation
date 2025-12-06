# tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-basic-src-index-ts
- Generated At: 2025-12-06T22:49:48.649Z

## Authored
### Purpose
Ground-truths the runtime entrypoint for the `ts-basic` benchmark so the analyzer must capture the `models` and `util` imports validated during the oracle remediation in [2025-11-03 summary](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Keeps the fixture focused on executable dependencies; type-only exports live in `types.ts` so false-positive edges are immediately visible in benchmark diffs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-06T22:49:48.649Z","inputHash":"1ee0e7b4f57c254a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts#L4)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models.createWidget`](./models.ts.mdmd.md#symbol-createwidget)
- [`util.formatWidget`](./util.ts.mdmd.md#symbol-formatwidget)
<!-- LIVE-DOC:END Dependencies -->
