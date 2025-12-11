# packages/server/src/features/live-docs/system/plans/testingPlan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/testingPlan.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-testingplan-ts
- Generated At: 2025-12-11T02:38:01.186Z

## Authored
### Purpose
Builds System-layer `testing` archetype plans from the target manifest. Groups tests targeting `live-docs` paths and creates edges from tests to their implementation targets.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (138 lines)
- Uses `TargetManifest` from `tests/integration/benchmarks/target-manifest.json`
- Creates virtual nodes for test groups without backing Stage0 docs (e.g., integration tests)

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-11T02:38:01.186Z","inputHash":"ad9487106dc34713"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildTestingPlans` {#symbol-buildtestingplans}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/testingPlan.ts#L13)

#### `deriveTestGroupKey` {#symbol-derivetestgroupkey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/testingPlan.ts#L137)

#### `createVirtualNodeKey` {#symbol-createvirtualnodekey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/testingPlan.ts#L137)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/live-docs/types` - `Stage0Doc`, `TargetManifest` (type-only)
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
- [`constants.LAYER3_PREFIX`](../constants.ts.mdmd.md#symbol-layer3_prefix)
- [`constants.VIRTUAL_NODE_PREFIX`](../constants.ts.mdmd.md#symbol-virtual_node_prefix)
- [`types.SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`types.SystemVirtualNode`](../types.ts.mdmd.md#symbol-systemvirtualnode) (type-only)
- [`utils.formatDisplayName`](../utils.ts.mdmd.md#symbol-formatdisplayname)
- [`utils.includeInComponents`](../utils.ts.mdmd.md#symbol-includeincomponents)
- [`utils.layer3Slug`](../utils.ts.mdmd.md#symbol-layer3slug)
- [`manifest.loadTargetManifest`](../../targets/manifest.ts.mdmd.md#symbol-loadtargetmanifest)
<!-- LIVE-DOC:END Dependencies -->
