# tests/integration/programs/typescript/rosetta/src/models.ts

## Metadata
- Layer: 4
- Archetype: test
- Code Path: tests/integration/programs/typescript/rosetta/src/models.ts
- Live Doc ID: LD-test-tests-integration-programs-typescript-rosetta-src-models-ts
- Generated At: 2026-09-27T18:53:08.693Z

## Authored
### Purpose
Data models for the TypeScript Rosetta Stone fixture. Defines Record and Report types with factory functions.

### Notes
See [2026-01-14.1.md](../../../../../../../../AI-Agent-Workspace/ChatHistory/2026/01/2026-01-14.1.md) for Rosetta Stone design. This module is imported by both main.ts and processor.ts, testing multi-consumer dependency detection.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-09-27T18:53:08.693Z","inputHash":"be64c871676f0036"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Record` {#symbol-record}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/typescript/rosetta/src/models.ts#L10)
- Extends: [`Entry`](./types.ts.mdmd.md#symbol-entry)

##### `Record` — Summary
A data record to be processed.

#### `Report` {#symbol-report}
- Type: interface
- Source: [source](../../../../../../../../tests/integration/programs/typescript/rosetta/src/models.ts#L16)

##### `Report` — Summary
Summary report produced by the processor.

#### `createRecord` {#symbol-createrecord}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/rosetta/src/models.ts#L24)

##### `createRecord` — Summary
Factory for creating records with sensible defaults.

#### `validateConfig` {#symbol-validateconfig}
- Type: function
- Source: [source](../../../../../../../../tests/integration/programs/typescript/rosetta/src/models.ts#L35)
- Parameters: `config`: [`ProcessorConfig`](./types.ts.mdmd.md#symbol-processorconfig)

##### `validateConfig` — Summary
Validates configuration is within acceptable bounds.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Entry`](./types.ts.mdmd.md#symbol-entry)
- [`types.ProcessorConfig`](./types.ts.mdmd.md#symbol-processorconfig)
- [`types.Status`](./types.ts.mdmd.md#symbol-status)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Targets -->
### Targets
_No targets documented yet_
<!-- LIVE-DOC:END Targets -->

<!-- LIVE-DOC:BEGIN Supporting Fixtures -->
### Supporting Fixtures
_No supporting fixtures documented yet_
<!-- LIVE-DOC:END Supporting Fixtures -->
