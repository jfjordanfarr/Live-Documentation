# packages/shared/src/contracts/lsif.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/lsif.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-lsif-ts
- Generated At: 2025-12-11T02:38:01.542Z

## Authored
### Purpose
Provides TypeScript typings for LSIF vertices, edges, and index metadata so the shared parser can hydrate code-intelligence feeds—created alongside the LSIF/SCIP ingestion work in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-04-option-b-kickoff--lsifscip-ingestion-lines-1181-1950](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-04-option-b-kickoff--lsifscip-ingestion-lines-1181-1950).

### Notes
The feed-format detector and `lsifParser.ts` rely on these labels staying in sync with the LSIF 0.6 spec; see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-05-integration-harness--workspace-index-overhaul-lines-1951-2800](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-05-integration-harness--workspace-index-overhaul-lines-1951-2800) for the follow-on parser hardening this contract supports.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.542Z","inputHash":"655840303067aa95"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LSIFVertexLabel` {#symbol-lsifvertexlabel}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L9)

##### `LSIFVertexLabel` — Summary
TypeScript interfaces for LSIF (Language Server Index Format) data structures.
LSIF is a graph-based index format for code intelligence that captures symbols,
definitions, references, and their relationships.

Spec: https://microsoft.github.io/language-server-protocol/specifications/lsif/0.6.0/specification/

#### `LSIFEdgeLabel` {#symbol-lsifedgelabel}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L20)

#### `LSIFElement` {#symbol-lsifelement}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L28)

#### `LSIFVertex` {#symbol-lsifvertex}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L34)
- Extends: [`LSIFElement`](#symbol-lsifelement)

#### `LSIFEdge` {#symbol-lsifedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L38)
- Extends: [`LSIFElement`](#symbol-lsifelement)

#### `LSIFMetaData` {#symbol-lsifmetadata}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L44)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFProject` {#symbol-lsifproject}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L55)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFDocument` {#symbol-lsifdocument}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L62)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFRange` {#symbol-lsifrange}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L69)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFResultSet` {#symbol-lsifresultset}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L90)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFDefinitionResult` {#symbol-lsifdefinitionresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L94)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFReferenceResult` {#symbol-lsifreferenceresult}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L98)
- Extends: [`LSIFVertex`](#symbol-lsifvertex)

#### `LSIFContainsEdge` {#symbol-lsifcontainsedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L102)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFItemEdge` {#symbol-lsifitemedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L107)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFNextEdge` {#symbol-lsifnextedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L113)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFDefinitionEdge` {#symbol-lsifdefinitionedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L117)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFReferencesEdge` {#symbol-lsifreferencesedge}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L121)
- Extends: [`LSIFEdge`](#symbol-lsifedge)

#### `LSIFEntry` {#symbol-lsifentry}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L128)
- Returns: [`LSIFMetaData`](#symbol-lsifmetadata), [`LSIFProject`](#symbol-lsifproject), [`LSIFDocument`](#symbol-lsifdocument), [`LSIFRange`](#symbol-lsifrange), [`LSIFResultSet`](#symbol-lsifresultset), [`LSIFDefinitionResult`](#symbol-lsifdefinitionresult), [`LSIFReferenceResult`](#symbol-lsifreferenceresult), [`LSIFContainsEdge`](#symbol-lsifcontainsedge), [`LSIFItemEdge`](#symbol-lsifitemedge), [`LSIFNextEdge`](#symbol-lsifnextedge), [`LSIFDefinitionEdge`](#symbol-lsifdefinitionedge), [`LSIFReferencesEdge`](#symbol-lsifreferencesedge), [`LSIFVertex`](#symbol-lsifvertex), [`LSIFEdge`](#symbol-lsifedge)

##### `LSIFEntry` — Summary
LSIF dump is a newline-delimited JSON stream where each line is a vertex or edge

#### `ParsedLSIFIndex` {#symbol-parsedlsifindex}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/lsif.ts#L143)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
