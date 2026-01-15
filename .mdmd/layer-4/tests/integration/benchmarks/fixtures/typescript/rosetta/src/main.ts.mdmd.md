# tests/integration/benchmarks/fixtures/typescript/rosetta/src/main.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/rosetta/src/main.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-rosetta-src-main-ts
- Generated At: 2026-01-14T22:47:33.857Z

## Authored
### Purpose
Entry point for the TypeScript Rosetta Stone fixture. Demonstrates runtime imports from processor and models modules.

### Notes
Part of the cross-language Rosetta Stone benchmark suite; see [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md). Mirrors the structure of main modules in Python, Java, C#, Rust, C, and Ruby fixtures.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T22:47:33.857Z","inputHash":"7d3c42715e272508"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/main.ts#L17)

##### `main` — Summary
Executes the Rosetta data pipeline.

##### `main` — Parameters
- `seed`: Starting seed value for generating records

##### `main` — Returns
Formatted summary of the processing results
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`models.Report`](./models.ts.mdmd.md#symbol-report)
- [`models.createRecord`](./models.ts.mdmd.md#symbol-createrecord)
- [`processor.run`](./processor.ts.mdmd.md#symbol-run)
- [`processor.summarize`](./processor.ts.mdmd.md#symbol-summarize)
<!-- LIVE-DOC:END Dependencies -->
