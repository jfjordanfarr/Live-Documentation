# packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts
- Live Doc ID: LD-implementation-packages-scripts-src-live-docs-explorer-client-bootstrap-index-ts
- Generated At: 2025-12-19T21:19:50.703Z

## Authored
### Purpose
Orchestrates Explorer initialization: loads graph data, detects static vs server mode, initializes UI panels, and hydrates persisted state. The main `bootstrapExplorer()` function is the Explorer's entry point.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19) as part of Phase 2 tech-debt reduction. Consolidates bootstrap logic that was previously scattered across the monolithic index.ts.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-19T21:19:50.703Z","inputHash":"aa76daf7278720fb"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `inferDefaultEntryNodeId` {#symbol-inferdefaultentrynodeid}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts#L8)

#### `scoreNode` {#symbol-scorenode}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts#L9)

#### `buildDegreeMap` {#symbol-builddegreemap}
- Type: unknown
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts#L10)

#### `LinkEndpointResolver` {#symbol-linkendpointresolver}
- Type: type (type-only)
- Source: [source](../../../../../../../../../packages/scripts/src/live-docs/explorer/client/bootstrap/index.ts#L11)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`entry-heuristics.LinkEndpointResolver`](./entry-heuristics.ts.mdmd.md#symbol-linkendpointresolver) (re-export)
- [`entry-heuristics.buildDegreeMap`](./entry-heuristics.ts.mdmd.md#symbol-builddegreemap) (re-export)
- [`entry-heuristics.inferDefaultEntryNodeId`](./entry-heuristics.ts.mdmd.md#symbol-inferdefaultentrynodeid) (re-export)
- [`entry-heuristics.scoreNode`](./entry-heuristics.ts.mdmd.md#symbol-scorenode) (re-export)
<!-- LIVE-DOC:END Dependencies -->
