# packages/server/src/features/changeEvents/saveCodeChange.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/changeEvents/saveCodeChange.ts
- Live Doc ID: LD-implementation-packages-server-src-features-changeevents-savecodechange-ts
- Generated At: 2025-11-24T15:19:58.458Z

## Authored
### Purpose
Records code edits and their change events in the graph store, feeding the ripple diagnostics loop introduced in [2025-10-19 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-19.SUMMARIZED.md).

### Notes
- Reuses the canonical artifact returned from `GraphStore.upsertArtifact` after the foreign-key fix documented in [2025-10-29 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-29.SUMMARIZED.md) so persisted change events stay relationally valid.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.458Z","inputHash":"9868137702856116"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `PersistedCodeChange` {#symbol-persistedcodechange}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/saveCodeChange.ts#L8)

#### `SaveCodeChangeOptions` {#symbol-savecodechangeoptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/saveCodeChange.ts#L13)

#### `saveCodeChange` {#symbol-savecodechange}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/changeEvents/saveCodeChange.ts#L21)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`, `KnowledgeArtifact`
- `node:crypto` - `randomUUID`
- [`uri.normalizeFileUri`](../utils/uri.ts.mdmd.md#symbol-normalizefileuri)
- [`artifactWatcher.CodeTrackedArtifactChange`](../watchers/artifactWatcher.ts.mdmd.md#symbol-codetrackedartifactchange) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [saveCodeChange.test.ts](./saveCodeChange.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
