# tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts
- Live Doc ID: LD-implementation-tests-integration-benchmarks-fixtures-typescript-rosetta-src-models-ts
- Generated At: 2026-01-14T22:47:33.858Z

## Authored
### Purpose
Data models for the TypeScript Rosetta Stone fixture. Defines Record and Report types with factory functions.

### Notes
See [2026-01-14.1.md](../../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md) for Rosetta Stone design. This module is imported by both main.ts and processor.ts, testing multi-consumer dependency detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T22:47:33.858Z","inputHash":"2370515c9019a83a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: interface
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts#L10)
- Extends: [`Entry`](../../../java/rosetta/src/com/rosetta/types/Entry.java.mdmd.md#symbol-entry-class)

##### `Record` — Summary
A data record to be processed.

#### `Report` {#symbol-report}
- Type: interface
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts#L16)

##### `Report` — Summary
Summary report produced by the processor.

#### `createRecord` {#symbol-createrecord}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts#L24)

##### `createRecord` — Summary
Factory for creating records with sensible defaults.

#### `validateConfig` {#symbol-validateconfig}
- Type: function
- Source: [source](../../../../../../../../../tests/integration/benchmarks/fixtures/typescript/rosetta/src/models.ts#L35)
- Parameters: `config`: [`ProcessorConfig`](../../../java/rosetta/src/com/rosetta/types/ProcessorConfig.java.mdmd.md#symbol-processorconfig-class)

##### `validateConfig` — Summary
Validates configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Entry`](./types.ts.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](./types.ts.mdmd.md#symbol-processorconfig)
- [`types.Status`](./types.ts.mdmd.md#symbol-status)
<!-- LIVE-DOC:END Dependencies -->
