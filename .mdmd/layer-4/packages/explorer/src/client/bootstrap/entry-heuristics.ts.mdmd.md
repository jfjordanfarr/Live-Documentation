# packages/explorer/src/client/bootstrap/entry-heuristics.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/explorer/src/client/bootstrap/entry-heuristics.ts
- Generated At: 2026-10-22T16:47:53.774Z

## Authored
### Purpose
Guesses the first subject by file name, path and centrality when nothing else names one: the landing's last fallback since 2026-10-15, used only when the docs declare no entry point at all.

### Notes
Extracted from client/index.ts during Dev Day 50 (12/19) as part of Phase 2 tech-debt reduction. The `inferDefaultEntryNodeId()` function is called during bootstrap when no node ID is in the URL.

- On 2026-10-15 ([the decision](../../../../../../../.mdmd/layer-3/architectural-decisions.mdmd.md#entry-points-are-written-on-the-entry-and-what-they-reach-is-one-walk-recorded-2026-10-15)) the docs' `Entry` lines took over the landing through `landing.ts`; this guess, "wrong for our repo but not a stupid guess" in the owner's words, remains for a bundle whose docs declare no entry, such as one generated before the lines existed. On this repository it had picked the rosetta sample's `main.ts`.

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LinkEndpointResolver` {#symbol-linkendpointresolver}
- Type: type
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/entry-heuristics.ts#L19)
- Parameters: `_unnamed_`: [`ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload)

##### `LinkEndpointResolver` — Summary
Resolver for link endpoints to node IDs

#### `scoreNode` {#symbol-scorenode}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/entry-heuristics.ts#L49)

##### `scoreNode` — Summary
Score a node for entry-point likelihood.
Higher scores indicate more likely entry points.

##### `scoreNode` — Parameters
- `degreeById`: Pre-computed degree counts for graph centrality
- `node`: The node to score

##### `scoreNode` — Returns
A score, with negative values indicating exclusion

#### `buildDegreeMap` {#symbol-builddegreemap}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/entry-heuristics.ts#L109)

##### `buildDegreeMap` — Summary
Build a degree map for all nodes in the graph.
Counts both inbound and outbound links for each node.

#### `inferDefaultEntryNodeId` {#symbol-inferdefaultentrynodeid}
- Type: const
- Source: [source](../../../../../../../packages/explorer/src/client/bootstrap/entry-heuristics.ts#L134)

##### `inferDefaultEntryNodeId` — Summary
Infer the best default entry node when none is specified.
Returns null if no suitable node can be found.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.ExplorerGraphPayload`](../../shared/types.ts.mdmd.md#symbol-explorergraphpayload) (type-only)
- [`types.ExplorerLinkPayload`](../../shared/types.ts.mdmd.md#symbol-explorerlinkpayload) (type-only)
- [`types.ExplorerNodePayload`](../../shared/types.ts.mdmd.md#symbol-explorernodepayload) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Cited By -->
### Cited By
- [`.mdmd/layer-3/live-documentation-explorer.mdmd.md`](../../../../../../layer-3/live-documentation-explorer.mdmd.md)
<!-- LIVE-DOC:END Cited By -->
