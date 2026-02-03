# packages/shared/src/contracts/maintenance.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/maintenance.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-maintenance-ts
- Generated At: 2026-02-03T21:55:38.559Z

## Authored
### Purpose
Defines the rebind notification payloads surfaced during the initial maintenance scaffolding in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523), giving the server a standard shape for prompting users to repair broken links.

### Notes
Rebind UX and consent documentation rely on these types—see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-09-documentation--script-polish-lines-4851-5050](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md#turn-09-documentation--script-polish-lines-4851-5050)—so keep the contract stable when updating quickstart guidance or maintenance telemetry.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.559Z","inputHash":"2981f3ed874f4cbe"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `RebindReason` {#symbol-rebindreason}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/maintenance.ts#L3)

#### `RebindRequiredArtifact` {#symbol-rebindrequiredartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/maintenance.ts#L5)

#### `RebindImpactedArtifact` {#symbol-rebindimpactedartifact}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/maintenance.ts#L10)
- Extends: [`RebindRequiredArtifact`](#symbol-rebindrequiredartifact)

#### `RebindRequiredPayload` {#symbol-rebindrequiredpayload}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/maintenance.ts#L15)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.ArtifactLayer`](../domain/artifacts.ts.mdmd.md#symbol-artifactlayer)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
<!-- LIVE-DOC:END Dependencies -->
