# packages/server/src/features/live-docs/system/plans/coActivationPlan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/coActivationPlan.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-coactivationplan-ts
- Generated At: 2025-12-07T05:08:38.475Z

## Authored
### Purpose
_Pending authored purpose_

### Notes
_Pending notes_

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T05:08:38.475Z","inputHash":"4af94a342f1269bd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildCoActivationPlans` {#symbol-buildcoactivationplans}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/coActivationPlan.ts#L29)
- Returns: [`SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan)[]

#### `deriveClusterIdentity` {#symbol-deriveclusteridentity}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/coActivationPlan.ts#L270)

#### `collectTopSources` {#symbol-collecttopsources}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/coActivationPlan.ts#L324)
- Returns: [`PlanActivationSourceSummary`](../types.ts.mdmd.md#symbol-planactivationsourcesummary)[]
- Parameters: `edges`: [`CoActivationEdge`](../types.ts.mdmd.md#symbol-coactivationedge)[]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/live-docs/analysis/coActivation` - `CoActivationEdge`, `CoActivationReport` (type-only)
- `@live-documentation/shared/live-docs/types` - `Stage0Doc` (type-only)
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
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
<!-- LIVE-DOC:END Dependencies -->
