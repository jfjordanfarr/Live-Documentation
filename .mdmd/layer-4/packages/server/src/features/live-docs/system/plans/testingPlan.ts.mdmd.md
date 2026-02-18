# packages/server/src/features/live-docs/system/plans/testingPlan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/testingPlan.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-testingplan-ts
- Generated At: 2026-02-18T21:27:52.767Z

## Authored
### Purpose
Builds System-layer `testing` archetype plans from the target manifest. Groups tests targeting `live-docs` paths and creates edges from tests to their implementation targets.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (138 lines)
- Uses `TargetManifest` from `tests/integration/benchmarks/target-manifest.json`
- Creates virtual nodes for test groups without backing Stage0 docs (e.g., integration tests)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.767Z","inputHash":"be70bed7e82c2bad"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildTestingPlans` {#symbol-buildtestingplans}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/testingPlan.ts#L17)

##### `buildTestingPlans` — Summary
Builds testing-focused System-layer plans from the target manifest,
linking test files to the live-docs implementation artifacts they cover.

#### `deriveTestGroupKey` {#symbol-derivetestgroupkey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/testingPlan.ts#L143)

#### `createVirtualNodeKey` {#symbol-createvirtualnodekey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/testingPlan.ts#L143)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`constants.LAYER3_PREFIX`](../constants.ts.mdmd.md#symbol-layer3_prefix)
- [`constants.VIRTUAL_NODE_PREFIX`](../constants.ts.mdmd.md#symbol-virtual_node_prefix)
- [`types.SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`types.SystemVirtualNode`](../types.ts.mdmd.md#symbol-systemvirtualnode) (type-only)
- [`utils.formatDisplayName`](../utils.ts.mdmd.md#symbol-formatdisplayname)
- [`utils.includeInComponents`](../utils.ts.mdmd.md#symbol-includeincomponents)
- [`utils.layer3Slug`](../utils.ts.mdmd.md#symbol-layer3slug)
- [`manifest.loadTargetManifest`](../../targets/manifest.ts.mdmd.md#symbol-loadtargetmanifest)
- [`types.Stage0Doc`](../../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doc) (type-only)
- [`types.TargetManifest`](../../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-targetmanifest) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->
