# packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-staticfeedworkspaceprovider-ts
- Generated At: 2025-12-15T00:38:06.426Z

## Authored
### Purpose
Reads curated JSON feeds under `data/knowledge-feeds/` and converts them into seeds and evidences so offline knowledge can bootstrap the graph when live analyzers are unavailable.

### Notes
- Refactored during the static-feed ingestion cleanup noted in [2025-10-22 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md), which hardened URI resolution and logging.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.426Z","inputHash":"61774a7cd11b01ec"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StaticFeedWorkspaceProviderOptions` {#symbol-staticfeedworkspaceprovideroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts#L20)

#### `createStaticFeedWorkspaceProvider` {#symbol-createstaticfeedworkspaceprovider}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts#L61)
- Returns: [`WorkspaceLinkProvider`](../../../../shared/src/inference/linkInference.ts.mdmd.md#symbol-workspacelinkprovider)
- Parameters: `options`: [`StaticFeedWorkspaceProviderOptions`](#symbol-staticfeedworkspaceprovideroptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs` - `fs`, `promises`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
- [`index.ArtifactSeed`](../../../../shared/src/index.ts.mdmd.md#symbol-artifactseed) (type-only)
- [`index.LinkRelationshipKind`](../../../../shared/src/index.ts.mdmd.md#symbol-linkrelationshipkind) (type-only)
- [`index.WorkspaceLinkContribution`](../../../../shared/src/index.ts.mdmd.md#symbol-workspacelinkcontribution) (type-only)
- [`index.WorkspaceLinkProvider`](../../../../shared/src/index.ts.mdmd.md#symbol-workspacelinkprovider) (type-only)
- [`index.WorkspaceLinkProviderContext`](../../../../shared/src/index.ts.mdmd.md#symbol-workspacelinkprovidercontext) (type-only)
<!-- LIVE-DOC:END Dependencies -->
