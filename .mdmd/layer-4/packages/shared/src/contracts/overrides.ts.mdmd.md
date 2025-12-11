# packages/shared/src/contracts/overrides.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/contracts/overrides.ts
- Live Doc ID: LD-implementation-packages-shared-src-contracts-overrides-ts
- Generated At: 2025-12-11T02:38:01.549Z

## Authored
### Purpose
Captures the manual override request/response contract introduced with the initial implementation bootstrap in [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-16.SUMMARIZED.md#turn-13-implementation-bootstrap-lines-2000-2523), enabling maintainers to correct or annotate inferred graph edges.

### Notes
GraphStore dedupe and symbol neighbor work reused these shapes—see [AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-27-graphstore-dedupe-attempt--new-failures-lines-3521-4000](../../../../../../AI-Agent-Workspace/ChatHistory/2025/10/Summarized/2025-10-23.SUMMARIZED.md#turn-27-graphstore-dedupe-attempt--new-failures-lines-3521-4000)—so any field changes must stay consistent with `overrideLink.ts` persistence and associated tests.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.549Z","inputHash":"ddb95c0b76d60db9"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkOverrideReason` {#symbol-linkoverridereason}
- Type: type
- Source: [source](../../../../../../packages/shared/src/contracts/overrides.ts#L3)

#### `OverrideLinkArtifactInput` {#symbol-overridelinkartifactinput}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/overrides.ts#L5)

#### `OverrideLinkRequest` {#symbol-overridelinkrequest}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/overrides.ts#L11)

#### `OverrideLinkResponse` {#symbol-overridelinkresponse}
- Type: interface
- Source: [source](../../../../../../packages/shared/src/contracts/overrides.ts#L20)

#### `OVERRIDE_LINK_REQUEST` {#symbol-override_link_request}
- Type: const
- Source: [source](../../../../../../packages/shared/src/contracts/overrides.ts#L26)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`artifacts.ArtifactLayer`](../domain/artifacts.ts.mdmd.md#symbol-artifactlayer)
- [`artifacts.LinkRelationshipKind`](../domain/artifacts.ts.mdmd.md#symbol-linkrelationshipkind)
<!-- LIVE-DOC:END Dependencies -->
