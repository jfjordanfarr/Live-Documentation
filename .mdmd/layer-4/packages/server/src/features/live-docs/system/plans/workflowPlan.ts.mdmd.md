# packages/server/src/features/live-docs/system/plans/workflowPlan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/workflowPlan.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-workflowplan-ts
- Generated At: 2026-02-18T21:27:52.795Z

## Authored
### Purpose
Builds System-layer `workflow` archetype plans for orchestrator scripts (e.g., `run-all.ts`). Produces a full workflow view with stage-sequence edges showing execution order.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (66 lines)
- Targets any file ending in `run-all.ts`
- Combines direct dependencies with stage-sequence edges for complete orchestration topology

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.795Z","inputHash":"f3a0c0b2d30e40f8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildWorkflowPlans` {#symbol-buildworkflowplans}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/workflowPlan.ts#L16)
- Returns: [`SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan)[]

##### `buildWorkflowPlans` — Summary
Builds workflow System-layer plans centred on `run-all.ts` orchestrators,
wiring up stage-sequence edges and direct dependency edges.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`constants.LAYER3_PREFIX`](../constants.ts.mdmd.md#symbol-layer3_prefix)
- [`stageSequence.buildStageSequenceEdges`](../stageSequence.ts.mdmd.md#symbol-buildstagesequenceedges)
- [`types.StageSequence`](../types.ts.mdmd.md#symbol-stagesequence) (type-only)
- [`types.SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`utils.formatDisplayName`](../utils.ts.mdmd.md#symbol-formatdisplayname)
- [`utils.includeInComponents`](../utils.ts.mdmd.md#symbol-includeincomponents)
- [`utils.layer3Slug`](../utils.ts.mdmd.md#symbol-layer3slug)
- [`types.Stage0Doc`](../../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doc) (type-only)
<!-- LIVE-DOC:END Dependencies -->
