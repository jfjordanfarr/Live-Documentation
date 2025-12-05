# packages/server/src/telemetry/driftHistoryStore.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/telemetry/driftHistoryStore.ts
- Live Doc ID: LD-implementation-packages-server-src-telemetry-drifthistorystore-ts
- Generated At: 2025-12-05T04:16:19.154Z

## Authored
### Purpose
Provides the persistence layer for diagnostic drift events added during T059—see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-15-drift-history-implementation-phase-lines-1621-1850](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-15-drift-history-implementation-phase-lines-1621-1850)—recording emissions and acknowledgements into the shared graph store.

### Notes
The store is invoked by `acknowledgementService` and the drift history integrations delivered in the same tranche; directory fallback behaviour and metadata merging were tuned while stabilising integration tests in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-18-multi-path-lookup--green-tests-lines-2081-2180](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-18-multi-path-lookup--green-tests-lines-2081-2180), so align any future storage changes with those test expectations.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.154Z","inputHash":"be0e8364e9b42cb1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DriftHistoryStoreOptions` {#symbol-drifthistorystoreoptions}
- Type: interface
- Source: [source](../../../../../../packages/server/src/telemetry/driftHistoryStore.ts#L11)

#### `RecordDriftEmissionParams` {#symbol-recorddriftemissionparams}
- Type: type
- Source: [source](../../../../../../packages/server/src/telemetry/driftHistoryStore.ts#L26)
- Returns: `DriftHistoryBaseParams`

#### `RecordDriftAcknowledgementParams` {#symbol-recorddriftacknowledgementparams}
- Type: interface
- Source: [source](../../../../../../packages/server/src/telemetry/driftHistoryStore.ts#L28)
- Extends: `DriftHistoryBaseParams`

#### `DriftHistoryStore` {#symbol-drifthistorystore}
- Type: class
- Source: [source](../../../../../../packages/server/src/telemetry/driftHistoryStore.ts#L33)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `DiagnosticSeverity`, `DriftHistoryEntry`, `DriftHistorySummary`, `GraphStore`, `ListDriftHistoryOptions` (type-only)
- `node:crypto` - `randomUUID`
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [acknowledgementService.test.ts](../features/diagnostics/acknowledgementService.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
