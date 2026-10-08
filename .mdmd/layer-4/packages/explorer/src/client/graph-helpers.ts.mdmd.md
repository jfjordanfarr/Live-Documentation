# packages/explorer/src/client/graph-helpers.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/graph-helpers.ts
- Generated At: 2026-09-28T01:11:42.821Z

## Authored
### Purpose
Provides utility functions for graph data manipulation in the Explorer client. Includes link endpoint resolution, node lookup helpers, and graph traversal utilities used across multiple views.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19). These helpers are consumed by the Local Map, Circuit Board, and Force Graph views for consistent graph data access. `escapeHtml` is the client's one HTML escaper since 2026-10-08, when [the dead code sweep](../../../../../../AI-Agent-Workspace/Probes/2026-10-08/dead-code-sweep.md) replaced eleven local copies with it; it escapes the five characters that matter in text and attribute content alike.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `getInputById` {#symbol-getinputbyid}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/graph-helpers.ts#L18)

##### `getInputById` — Summary
Get an input element by ID, returning null if not found or not an input.

#### `buildTestCoverageMap` {#symbol-buildtestcoveragemap}
- Type: function
- Source: [source](../../../../../../packages/explorer/src/client/graph-helpers.ts#L29)
- Returns: [`TestCoverageMap`](./types.ts.mdmd.md#symbol-testcoveragemap)
- Parameters: `graphData`: [`ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload); `_unnamed_`: [`ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)

##### `buildTestCoverageMap` — Summary
Build a map of implementation node IDs to their covering test nodes.

A test "covers" an implementation if there's a link from test → implementation.
This allows showing test coverage badges on non-test nodes.

#### `resolveLinkEndpoint` {#symbol-resolvelinkendpoint}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/graph-helpers.ts#L78)

##### `resolveLinkEndpoint` — Summary
Resolve a link endpoint to its node ID string.
Handles both string IDs and object references.

#### `escapeHtml` {#symbol-escapehtml}
- Type: const
- Source: [source](../../../../../../packages/explorer/src/client/graph-helpers.ts#L94)

##### `escapeHtml` — Summary
Escape HTML special characters for safe rendering.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.TestCoverageMap`](./types.ts.mdmd.md#symbol-testcoveragemap) (type-only)
- [`types.ExplorerGraphPayload`](../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->
