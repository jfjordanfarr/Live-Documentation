# packages/server/src/features/live-docs/system/plans/index.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/index.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-index-ts
- Generated At: 2026-02-03T21:55:38.019Z

## Authored
### Purpose
Barrel re-export for the System-layer plan builders. Aggregates component, interaction, workflow, testing, and co-activation plan factories for the main generator.

### Notes
- Extracted 2025-12-06 as part of the `system/generator.ts` refactoring
- Pure re-export module with no implementation logic
- Provides a single import point for all plan builder functions

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.019Z","inputHash":"2638e2726be0f7fd"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildComponentPlans` {#symbol-buildcomponentplans}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L1)

#### `isImplementationDoc` {#symbol-isimplementationdoc}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L1)

#### `deriveComponentKey` {#symbol-derivecomponentkey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L1)

#### `buildInteractionPlans` {#symbol-buildinteractionplans}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L2)

#### `buildWorkflowPlans` {#symbol-buildworkflowplans}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L3)

#### `buildTestingPlans` {#symbol-buildtestingplans}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L4)

#### `deriveTestGroupKey` {#symbol-derivetestgroupkey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L4)

#### `createVirtualNodeKey` {#symbol-createvirtualnodekey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L4)

#### `buildCoActivationPlans` {#symbol-buildcoactivationplans}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L5)

#### `deriveClusterIdentity` {#symbol-deriveclusteridentity}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L5)

#### `collectTopSources` {#symbol-collecttopsources}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/index.ts#L5)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`coActivationPlan.buildCoActivationPlans`](./coActivationPlan.ts.mdmd.md#symbol-buildcoactivationplans) (re-export)
- [`coActivationPlan.collectTopSources`](./coActivationPlan.ts.mdmd.md#symbol-collecttopsources) (re-export)
- [`coActivationPlan.deriveClusterIdentity`](./coActivationPlan.ts.mdmd.md#symbol-deriveclusteridentity) (re-export)
- [`componentPlan.buildComponentPlans`](./componentPlan.ts.mdmd.md#symbol-buildcomponentplans) (re-export)
- [`componentPlan.deriveComponentKey`](./componentPlan.ts.mdmd.md#symbol-derivecomponentkey) (re-export)
- [`componentPlan.isImplementationDoc`](./componentPlan.ts.mdmd.md#symbol-isimplementationdoc) (re-export)
- [`interactionPlan.buildInteractionPlans`](./interactionPlan.ts.mdmd.md#symbol-buildinteractionplans) (re-export)
- [`testingPlan.buildTestingPlans`](./testingPlan.ts.mdmd.md#symbol-buildtestingplans) (re-export)
- [`testingPlan.createVirtualNodeKey`](./testingPlan.ts.mdmd.md#symbol-createvirtualnodekey) (re-export)
- [`testingPlan.deriveTestGroupKey`](./testingPlan.ts.mdmd.md#symbol-derivetestgroupkey) (re-export)
- [`workflowPlan.buildWorkflowPlans`](./workflowPlan.ts.mdmd.md#symbol-buildworkflowplans) (re-export)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
