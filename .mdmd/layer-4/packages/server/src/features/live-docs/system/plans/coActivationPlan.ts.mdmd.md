# packages/server/src/features/live-docs/system/plans/coActivationPlan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/coActivationPlan.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-coactivationplan-ts
- Generated At: 2026-02-18T21:27:52.665Z

## Authored
### Purpose
Builds System-layer plans from co-activation report clusters. Converts statistically-significant clusters into `SystemDocPlan` objects with component lists, edges, activation summaries, and node metrics.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (349 lines)
- `buildCoActivationPlans()` filters clusters by significance and min member count
- `deriveClusterIdentity()` picks a descriptive slug from common path segments or highest-degree node

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.665Z","inputHash":"299b6a212032977a"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildCoActivationPlans` {#symbol-buildcoactivationplans}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/coActivationPlan.ts#L36)
- Returns: [`SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan)[]

##### `buildCoActivationPlans` — Summary
Builds System-layer co-activation plans from clustered edge data.

Each significant cluster above the minimum member/weight thresholds
produces one {@link SystemDocPlan} with ranked components, edges,
test sources, and dependency sources.

#### `deriveClusterIdentity` {#symbol-deriveclusteridentity}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/coActivationPlan.ts#L278)

##### `deriveClusterIdentity` — Summary
Derives a human-readable slug and display name for a cluster from its top-ranked component path.

#### `collectTopSources` {#symbol-collecttopsources}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/coActivationPlan.ts#L333)
- Returns: [`PlanActivationSourceSummary`](../types.ts.mdmd.md#symbol-planactivationsourcesummary)[]
- Parameters: `edges`: [`CoActivationEdge`](../types.ts.mdmd.md#symbol-coactivationedge)[]

##### `collectTopSources` — Summary
Tallies test or dependency sources across a set of co-activation edges, returning ranked summaries.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`constants.LAYER3_PREFIX`](../constants.ts.mdmd.md#symbol-layer3_prefix)
- [`constants.MAX_ACTIVATION_TOP_EDGES`](../constants.ts.mdmd.md#symbol-max_activation_top_edges)
- [`constants.MAX_ACTIVATION_TOP_SOURCES`](../constants.ts.mdmd.md#symbol-max_activation_top_sources)
- [`constants.MAX_CLUSTER_COMPONENTS`](../constants.ts.mdmd.md#symbol-max_cluster_components)
- [`constants.MAX_TOPOLOGY_EDGES`](../constants.ts.mdmd.md#symbol-max_topology_edges)
- [`constants.MIN_CLUSTER_MEMBER_COUNT`](../constants.ts.mdmd.md#symbol-min_cluster_member_count)
- [`constants.MIN_CLUSTER_TOTAL_WEIGHT`](../constants.ts.mdmd.md#symbol-min_cluster_total_weight)
- [`types.NodeMetric`](../types.ts.mdmd.md#symbol-nodemetric) (type-only)
- [`types.PlanActivationSourceSummary`](../types.ts.mdmd.md#symbol-planactivationsourcesummary) (type-only)
- [`types.PlanActivationSummary`](../types.ts.mdmd.md#symbol-planactivationsummary) (type-only)
- [`types.SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`utils.formatDisplayName`](../utils.ts.mdmd.md#symbol-formatdisplayname)
- [`utils.layer3Slug`](../utils.ts.mdmd.md#symbol-layer3slug)
- [`coActivation.CoActivationEdge`](../../../../../../shared/src/live-docs/analysis/coActivation.ts.mdmd.md#symbol-coactivationedge) (type-only)
- [`coActivation.CoActivationReport`](../../../../../../shared/src/live-docs/analysis/coActivation.ts.mdmd.md#symbol-coactivationreport) (type-only)
- [`types.Stage0Doc`](../../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doc) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
