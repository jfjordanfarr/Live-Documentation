# packages/shared/src/contracts/scip.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/scip.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-scip-ts
- Generated At: 2025-12-11T02:38:01.552Z

## Authored
### Purpose
Provides TypeScript shapes for SCIP indices so the ingestion pipeline can parse Sourcegraph snapshots—added alongside the LSIF/SCIP feed integration in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-04-option-b-kickoff--lsifscip-ingestion-lines-1181-1950](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-04-option-b-kickoff--lsifscip-ingestion-lines-1181-1950).

### Notes
`scipParser.ts` and the feed format detector depend on these enums/records; refer to [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-05-integration-harness--workspace-index-overhaul-lines-1951-2800](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-05-integration-harness--workspace-index-overhaul-lines-1951-2800) for the parser fixes that keep this contract aligned with ingest reality.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.552Z","inputHash":"e50248c0ce243485"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SCIPIndex` {#symbol-scipindex}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L8)

##### `SCIPIndex` — Summary
TypeScript interfaces for SCIP (SCIP Code Intelligence Protocol) data structures.
SCIP is a language-agnostic protocol for indexing code and representing code intelligence data.

Spec: https://github.com/sourcegraph/scip

#### `SCIPMetadata` {#symbol-scipmetadata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L13)

#### `SCIPToolInfo` {#symbol-sciptoolinfo}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L20)

#### `SCIPDocument` {#symbol-scipdocument}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L26)

#### `SCIPOccurrence` {#symbol-scipoccurrence}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L33)

#### `SCIPSymbolInformation` {#symbol-scipsymbolinformation}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L42)

#### `SCIPRelationship` {#symbol-sciprelationship}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L51)

#### `SCIPDiagnostic` {#symbol-scipdiagnostic}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L59)

#### `SCIPSignature` {#symbol-scipsignature}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L67)

#### `SCIPSymbolRole` {#symbol-scipsymbolrole}
- Type: enum
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L76)

##### `SCIPSymbolRole` — Summary
SCIP symbol roles (bitflags)

#### `SCIPSymbolKind` {#symbol-scipsymbolkind}
- Type: enum
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L90)

##### `SCIPSymbolKind` — Summary
SCIP symbol kinds

#### `ParsedSCIPIndex` {#symbol-parsedscipindex}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/scip.ts#L125)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
