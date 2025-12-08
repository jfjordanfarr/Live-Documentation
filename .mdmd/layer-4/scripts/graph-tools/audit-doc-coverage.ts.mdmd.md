# scripts/graph-tools/audit-doc-coverage.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: scripts/graph-tools/audit-doc-coverage.ts
- Live Doc ID: LD-implementation-scripts-graph-tools-audit-doc-coverage-ts
- Generated At: 2025-12-08T15:50:51.577Z

## Authored
### Purpose
Runs the graph coverage audit that compares code artifacts against Layer‑4 docs, emitting structured JSON and human summaries to spotlight undocumented code or doc-only files, first shipped with the maintainer tooling expansion on 2025-10-24 ([chat reference](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1078-L1097)).

### Notes
- Initial version (2025-10-24) introduced structured exit codes, package bucketing, and the `graph:audit` npm/VS Code wiring so teams could dogfood coverage gaps immediately ([launch log](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1078-L1097)).
- Same day follow-up grouped diagnostics by top-level folder and switched human output to relative paths to make remediation queues actionable ([ergonomics update](../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-24.md#L1702-L1714)).
- Refined 2025-11-04 to invoke `snapshotWorkspace` quietly before auditing, guaranteeing fresh caches during CI and local runs ([self-refresh integration](../../../../AI-Agent-Workspace/ChatHistory/2025/11/2025-11-04.md#L2434-L2455)).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-08T15:50:51.577Z","inputHash":"9daf5828efdeff08"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `parseArgs` {#symbol-parseargs}
- Type: function
- Source: [source](../../../../scripts/graph-tools/audit-doc-coverage.ts#L169)
- Returns: `ParsedArgs`

#### `auditCoverage` {#symbol-auditcoverage}
- Type: function
- Source: [source](../../../../scripts/graph-tools/audit-doc-coverage.ts#L314)
- Returns: `AuditReport`
- Parameters: `store`: [`GraphStore`](../../packages/shared/src/db/graphStore.ts.mdmd.md#symbol-graphstore); `options`: `AuditOptions`

#### `printReport` {#symbol-printreport}
- Type: function
- Source: [source](../../../../scripts/graph-tools/audit-doc-coverage.ts#L546)
- Parameters: `report`: `AuditReport`

#### `main` {#symbol-main}
- Type: function
- Source: [source](../../../../scripts/graph-tools/audit-doc-coverage.ts#L743)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactLayer`, `GraphStore`, `KnowledgeArtifact`, `LinkedArtifactSummary`, `RelationshipCoverageDiagnostic`, `RelationshipRuleWarning`, `compileRelationshipRules`, `compileSymbolProfiles`, `evaluateRelationshipCoverage`, `formatRelationshipDiagnostics`, `loadRelationshipRuleConfig`
- `node:fs` - `fs`
- `node:path` - `path`
- `node:process` - `process`
- `node:url` - `fileURLToPath`
- [`symbolCorrectnessValidator.SymbolCorrectnessReport`](../../packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts.mdmd.md#symbol-symbolcorrectnessreport)
- [`symbolCorrectnessValidator.generateSymbolCorrectnessDiagnostics`](../../packages/server/src/features/diagnostics/symbolCorrectnessValidator.ts.mdmd.md#symbol-generatesymbolcorrectnessdiagnostics)
- [`snapshot-workspace.DEFAULT_DB`](./snapshot-workspace.ts.mdmd.md#symbol-default_db)
- [`snapshot-workspace.DEFAULT_OUTPUT`](./snapshot-workspace.ts.mdmd.md#symbol-default_output)
- [`snapshot-workspace.snapshotWorkspace`](./snapshot-workspace.ts.mdmd.md#symbol-snapshotworkspace)
<!-- LIVE-DOC:END Dependencies -->
