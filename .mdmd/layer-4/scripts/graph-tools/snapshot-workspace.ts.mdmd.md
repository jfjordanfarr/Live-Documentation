# scripts/graph-tools/snapshot-workspace.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/graph-tools/snapshot-workspace.ts
- Live Doc ID: LD-implementation-scripts-graph-tools-snapshot-workspace-ts
- Generated At: 2025-12-15T00:38:07.427Z

## Authored
### Purpose
Materialises a deterministic workspace graph snapshot by rebuilding the SQLite cache and emitting `workspace.snapshot.json`, giving the graph tooling a reproducible baseline for audits and benchmarks as introduced with the graph snapshot CLI rollout on 2025-10-24 ([chat log](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1210-L1233)).

### Notes
- Authored 2025-10-24 while landing `npm run graph:snapshot`; the script added SQLite rebuild handling, timestamp/workspace flags, and lives alongside the documented `workspaceGraphSnapshot` workflow ([implementation notes](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1210-L1233)).
- Expanded 2025-10-30 to ingest relationship-rule providers so snapshots capture `documents`/`implements` edges sourced from `relationshipRuleProvider.ts`, keeping coverage audits aligned with the live server ([relationship rules upgrade](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-30.md#L5414-L5450)).
- Refactored 2025-11-04 to expose a reusable `snapshotWorkspace` helper and quiet mode; `audit-doc-coverage.ts` now invokes it automatically before audits to avoid stale caches ([self-refresh change](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L2434-L2455)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:07.427Z","inputHash":"4ef6541da8b04838"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DEFAULT_DB` {#symbol-default_db}
- Type: const
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L72)

#### `DEFAULT_OUTPUT` {#symbol-default_output}
- Type: const
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L73)

#### `SnapshotWorkspaceOptions` {#symbol-snapshotworkspaceoptions}
- Type: interface
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L75)

#### `SnapshotWorkspaceResult` {#symbol-snapshotworkspaceresult}
- Type: interface
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L84)

#### `parseArgs` {#symbol-parseargs}
- Type: function
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L92)
- Returns: `ParsedArgs`

#### `writeDatabaseWithRecovery` {#symbol-writedatabasewithrecovery}
- Type: function
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L320)
- Parameters: `snapshot`: [`ExternalSnapshot`](../../packages/shared/src/knowledge/knowledgeGraphBridge.ts.mdmd.md#symbol-externalsnapshot); `options`: `WriteDatabaseOptions`

#### `snapshotWorkspace` {#symbol-snapshotworkspace}
- Type: function
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L372)
- Parameters: `options`: [`SnapshotWorkspaceOptions`](#symbol-snapshotworkspaceoptions)

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../scripts/graph-tools/snapshot-workspace.ts#L484)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:child_process` - `spawn`
- `node:fs` - `promises`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `fileURLToPath`
- [`workspaceIndexProvider.createWorkspaceIndexProvider`](../../packages/server/src/features/knowledge/workspaceIndexProvider.ts.mdmd.md#symbol-createworkspaceindexprovider)
- [`index.ExternalArtifact`](../../packages/shared/src/index.ts.mdmd.md#symbol-externalartifact)
- [`index.ExternalLink`](../../packages/shared/src/index.ts.mdmd.md#symbol-externallink)
- [`index.ExternalSnapshot`](../../packages/shared/src/index.ts.mdmd.md#symbol-externalsnapshot)
- [`index.GraphStore`](../../packages/shared/src/index.ts.mdmd.md#symbol-graphstore)
- [`index.KnowledgeArtifact`](../../packages/shared/src/index.ts.mdmd.md#symbol-knowledgeartifact)
- [`index.KnowledgeGraphBridge`](../../packages/shared/src/index.ts.mdmd.md#symbol-knowledgegraphbridge)
- [`index.LinkInferenceOrchestrator`](../../packages/shared/src/index.ts.mdmd.md#symbol-linkinferenceorchestrator)
- [`index.LinkRelationship`](../../packages/shared/src/index.ts.mdmd.md#symbol-linkrelationship)
- [`index.createRelationshipRuleProvider`](../../packages/shared/src/index.ts.mdmd.md#symbol-createrelationshipruleprovider)
<!-- LIVE-DOC:END Dependencies -->
