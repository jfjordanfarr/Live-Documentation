# packages/scripts/src/live-docs/explorer/shared/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/shared/types.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-shared-types-ts
- Generated At: 2025-12-07T01:16:51.708Z

## Authored
### Purpose
Shared type definitions used by both the Explorer server and client. Defines the shape of graph payloads, node payloads, link payloads, and detail responses exchanged over the HTTP API.[AI-Agent-Workspace/ChatHistory/2025/11/2025-11-21.md]

### Notes
- Created 2025-11-21 when the monolithic `visualize-explorer.ts` was split into client/server/shared modules.
- Extended in December 2025 with `ExplorerTypeReference` and `ExplorerPublicSymbol` to support type-reference rendering in the Local Map.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T01:16:51.708Z","inputHash":"5b15e3e8aeb6de08"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `ExplorerLinkKind` {#symbol-explorerlinkkind}
- Type: type
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L1)

#### `ExplorerDependencyReference` {#symbol-explorerdependencyreference}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L7)

#### `ExplorerTypeReference` {#symbol-explorertypereference}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L27)

##### `ExplorerTypeReference` — Summary
Represents a type reference for a public symbol, enabling type-aware navigation.

##### `ExplorerTypeReference` — Remarks
When a symbol's return type, parameter type, or inheritance clause references
a type defined in another Live Doc, we capture this information to enable
click-to-navigate in the Local Map view.

#### `ExplorerPublicSymbol` {#symbol-explorerpublicsymbol}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L45)

##### `ExplorerPublicSymbol` — Summary
Extended symbol information including type references.

#### `ExplorerNodePayload` {#symbol-explorernodepayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L52)

#### `ExplorerLinkPayload` {#symbol-explorerlinkpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L70)

#### `ExplorerGraphStats` {#symbol-explorergraphstats}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L78)

#### `ExplorerGraphPayload` {#symbol-explorergraphpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L84)

#### `ExplorerDetailPayload` {#symbol-explorerdetailpayload}
- Type: interface
- Source: [source](../../../../../../../../packages/scripts/src/live-docs/explorer/shared/types.ts#L90)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
_No dependencies documented yet_
<!-- LIVE-DOC:END Dependencies -->
