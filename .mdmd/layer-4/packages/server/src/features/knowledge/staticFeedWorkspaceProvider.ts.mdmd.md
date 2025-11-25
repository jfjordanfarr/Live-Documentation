# packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts
- Live Doc ID: LD-implementation-packages-server-src-features-knowledge-staticfeedworkspaceprovider-ts
- Generated At: 2025-11-24T15:19:58.709Z

## Authored
### Purpose
Reads curated JSON feeds under `data/knowledge-feeds/` and converts them into seeds and evidences so offline knowledge can bootstrap the graph when live analyzers are unavailable.

### Notes
- Refactored during the static-feed ingestion cleanup noted in [2025-10-22 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-22.SUMMARIZED.md), which hardened URI resolution and logging.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.709Z","inputHash":"f2dd51da9692759a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `StaticFeedWorkspaceProviderOptions` {#symbol-staticfeedworkspaceprovideroptions}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts#L20)

#### `createStaticFeedWorkspaceProvider` {#symbol-createstaticfeedworkspaceprovider}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/knowledge/staticFeedWorkspaceProvider.ts#L61)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `ArtifactSeed`, `LinkRelationshipKind`, `WorkspaceLinkContribution`, `WorkspaceLinkProvider`, `WorkspaceLinkProviderContext` (type-only)
- `node:fs` - `fs`, `promises`
- `node:path` - `path`
- `node:url` - `pathToFileURL`
<!-- LIVE-DOC:END Dependencies -->
