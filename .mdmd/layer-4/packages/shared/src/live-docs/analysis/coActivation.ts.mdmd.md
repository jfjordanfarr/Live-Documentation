# packages/shared/src/live-docs/analysis/coActivation.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/shared/src/live-docs/analysis/coActivation.ts
- Live Doc ID: LD-implementation-packages-shared-src-live-docs-analysis-coactivation-ts
- Generated At: 2025-12-05T04:16:19.838Z

## Authored
### Purpose
Computes co-activation graphs from Stage‑0 manifests to surface statistically significant clusters that guide System-layer documentation and analytics.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-09-stand-up-co-activation-infrastructure-lines-1101-1220]

### Notes
- Initial implementation powered the on-demand CLI and System generator, emitting node/edge weights for manual review.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-10-initial-analytics-review-lines-1221-1320]
- Later upgraded with statistical testing (p/q/z scores) so generated docs highlight significant clusters instead of heuristic caps.[AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md#turn-16-implement-statistically-backed-co-activation-lines-1881-2020]

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-05T04:16:19.838Z","inputHash":"a8ea740b97a81de8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `CoActivationBuildArgs` {#symbol-coactivationbuildargs}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L7)

#### `CoActivationEdge` {#symbol-coactivationedge}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L17)

#### `CoActivationNode` {#symbol-coactivationnode}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L31)

#### `CoActivationCluster` {#symbol-coactivationcluster}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L41)

#### `CoActivationReport` {#symbol-coactivationreport}
- Type: interface
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L53)

#### `buildCoActivationReport` {#symbol-buildcoactivationreport}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L93)
- Returns: `CoActivationReport`
- Parameters: `args`: `CoActivationBuildArgs`

#### `serializeCoActivationReport` {#symbol-serializecoactivationreport}
- Type: function
- Source: [source](../../../../../../../packages/shared/src/live-docs/analysis/coActivation.ts#L304)
- Parameters: `report`: `CoActivationReport`
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
