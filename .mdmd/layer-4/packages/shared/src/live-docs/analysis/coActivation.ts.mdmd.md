# packages/shared/src/live-docs/analysis/coActivation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/analysis/coActivation.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-analysis-coactivation-ts
- Generated At: 2026-02-17T21:05:04.206Z

## Authored
### Purpose
Computes co-activation graphs from Stage‑0 manifests to surface statistically significant clusters that guide System-layer documentation and analytics.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-09-stand-up-co-activation-infrastructure-lines-1101-1220]

### Notes
- Initial implementation powered the on-demand CLI and System generator, emitting node/edge weights for manual review.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-10-initial-analytics-review-lines-1221-1320]
- Later upgraded with statistical testing (p/q/z scores) so generated docs highlight significant clusters instead of heuristic caps.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-16-implement-statistically-backed-co-activation-lines-1881-2020]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-17T21:05:04.206Z","inputHash":"bfa98033f1107494"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `DegreeDistribution` {#symbol-degreedistribution}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L11)

##### `DegreeDistribution` — Summary
Degree distribution computed from all observed dependency edges.
Used as the background model for significance testing.

#### `CoActivationBuildArgs` {#symbol-coactivationbuildargs}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L23)

##### `CoActivationBuildArgs` — Summary
Configuration for the co-activation analysis builder.

#### `CoActivationEdge` {#symbol-coactivationedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L44)

##### `CoActivationEdge` — Summary
A weighted edge between two co-activated artifacts, enriched with
statistical significance and provenance metadata.

#### `CoActivationNode` {#symbol-coactivationnode}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L71)

##### `CoActivationNode` — Summary
A node in the co-activation graph with degree, strength, and z-score
metrics relative to the background degree distribution.

#### `CoActivationCluster` {#symbol-coactivationcluster}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L92)

##### `CoActivationCluster` — Summary
A cluster of tightly co-activated nodes identified by the greedy
modularity algorithm, with statistical significance assessment.

#### `CoActivationReport` {#symbol-coactivationreport}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L117)

##### `CoActivationReport` — Summary
Complete co-activation analysis report including nodes, edges,
clusters, and aggregate metrics.

#### `buildCoActivationReport` {#symbol-buildcoactivationreport}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L171)
- Returns: [`CoActivationReport`](#symbol-coactivationreport)
- Parameters: `args`: [`CoActivationBuildArgs`](#symbol-coactivationbuildargs)

##### `buildCoActivationReport` — Summary
Builds a complete co-activation report from Stage-0 Live Docs.

The analysis combines dependency-graph edges with shared-test co-occurrence
to produce a weighted graph, then applies degree-corrected significance
testing and greedy modularity clustering.

##### `buildCoActivationReport` — Parameters
- `args`: Build configuration including Stage-0 docs and weight/threshold params.

##### `buildCoActivationReport` — Returns
Complete {@link CoActivationReport} with nodes, edges, and clusters.

#### `serializeCoActivationReport` {#symbol-serializecoactivationreport}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L394)
- Parameters: `report`: [`CoActivationReport`](#symbol-coactivationreport)

##### `serializeCoActivationReport` — Summary
Serialises a co-activation report to a deterministic JSON string.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`types.Stage0Doc`](../types.ts.mdmd.md#symbol-stage0doc) (type-only)
- [`types.TargetManifest`](../types.ts.mdmd.md#symbol-targetmanifest) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../../../../server/src/features/live-docs/system/generator.test.ts.mdmd.md)
- [coActivation.test.ts](./coActivation.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
