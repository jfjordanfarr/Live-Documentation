# tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/basic/src/index.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-basic-src-index-ts
- Generated At: 2026-02-03T21:55:46.388Z

## Authored
### Purpose
Ground-truths the runtime entrypoint for the `ts-basic` benchmark so the analyzer must capture the `models` and `util` imports validated during the oracle remediation in [2025-11-03 summary](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-03.SUMMARIZED.md).

### Notes
- Keeps the fixture focused on executable dependencies; type-only exports live in `types.ts` so false-positive edges are immediately visible in benchmark diffs.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:46.388Z","inputHash":"7dad184010ff2824"}]} -->
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
