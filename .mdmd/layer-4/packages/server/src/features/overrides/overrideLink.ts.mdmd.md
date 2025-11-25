# packages/server/src/features/overrides/overrideLink.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/overrides/overrideLink.ts
- Live Doc ID: LD-implementation-packages-server-src-features-overrides-overridelink-ts
- Generated At: 2025-11-24T15:19:58.870Z

## Authored
### Purpose
Implements the language-server side of the T027 manual override flow by persisting `OverrideLinkRequest` payloads into the graph store with deterministic IDs and override metadata, as described in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2799-L2836](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2799-L2836).

### Notes
- Ensures both source and target artifacts exist (creating or refreshing them with override metadata) before writing the SHA‑1-based link, matching the Oct 16 design notes in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2800-L2836](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2800-L2836).
- Automated coverage was deferred in the originating change set because the Node 22 toolchain blocked lint/test execution; the outstanding validation gap is acknowledged in [AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2804-L2836](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/2025-10-16.md#L2804-L2836).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-11-24T15:19:58.870Z","inputHash":"f951b2554812cc1d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `applyOverrideLink` {#symbol-applyoverridelink}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/overrides/overrideLink.ts#L20)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared` - `GraphStore`, `KnowledgeArtifact`, `LinkOverrideReason`, `LinkRelationshipKind`, `OverrideLinkArtifactInput`, `OverrideLinkRequest`, `OverrideLinkResponse`
- `crypto` - `createHash`, `randomUUID`
<!-- LIVE-DOC:END Dependencies -->
