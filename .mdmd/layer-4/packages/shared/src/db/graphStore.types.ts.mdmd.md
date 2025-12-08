# packages/shared/src/db/graphStore.types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/db/graphStore.types.ts
- Live Doc ID: LD-implementation-packages-shared-src-db-graphstore-types-ts
- Generated At: 2025-12-08T19:22:39.380Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T19:22:39.380Z","inputHash":"2e8f87c637318007"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ArtifactRow` {#symbol-artifactrow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L10)

##### `ArtifactRow` — Summary
Row shape for artifacts table.

#### `LinkRow` {#symbol-linkrow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L24)

##### `LinkRow` — Summary
Row shape for links table.

#### `LlmEdgeProvenanceRow` {#symbol-llmedgeprovenancerow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L37)

##### `LlmEdgeProvenanceRow` — Summary
Row shape for llm_edge_provenance table.

#### `DiagnosticRow` {#symbol-diagnosticrow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L58)

##### `DiagnosticRow` — Summary
Row shape for diagnostics table.

#### `DriftHistoryRow` {#symbol-drifthistoryrow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L76)

##### `DriftHistoryRow` — Summary
Row shape for drift_history table.

#### `DriftHistoryCountRow` {#symbol-drifthistorycountrow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L93)

##### `DriftHistoryCountRow` — Summary
Row shape for drift history count aggregation.

#### `DriftHistoryAckRow` {#symbol-drifthistoryackrow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L101)

##### `DriftHistoryAckRow` — Summary
Row shape for last acknowledgement query.

#### `LinkedArtifactRow` {#symbol-linkedartifactrow}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L109)

##### `LinkedArtifactRow` — Summary
Row shape for linked artifact queries (join result).

#### `DriftHistorySummary` {#symbol-drifthistorysummary}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L128)

##### `DriftHistorySummary` — Summary
Summary of drift history for a change event.

#### `UpdateDiagnosticStatusOptions` {#symbol-updatediagnosticstatusoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L138)

##### `UpdateDiagnosticStatusOptions` — Summary
Options for updating diagnostic status.

#### `FindDiagnosticByChangeEventOptions` {#symbol-finddiagnosticbychangeeventoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L148)

##### `FindDiagnosticByChangeEventOptions` — Summary
Options for finding diagnostic by change event.

#### `ListDriftHistoryOptions` {#symbol-listdrifthistoryoptions}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/db/graphStore.types.ts#L157)

##### `ListDriftHistoryOptions` — Summary
Options for listing drift history.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.DiagnosticStatus`](../domain/artifacts.ts.mdmd.md#symbol-diagnosticstatus)
- [`artifacts.DriftHistoryStatus`](../domain/artifacts.ts.mdmd.md#symbol-drifthistorystatus)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
<!-- LIVE-DOC:END Dependencies -->
