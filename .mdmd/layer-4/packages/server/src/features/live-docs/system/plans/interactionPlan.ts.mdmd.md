# packages/server/src/features/live-docs/system/plans/interactionPlan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/interactionPlan.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-interactionplan-ts
- Generated At: 2026-02-03T21:55:38.045Z

## Authored
### Purpose
Builds System-layer `interaction` archetype plans for scripts in `scripts/live-docs/`. Each script (except `run-all.ts`) gets an interaction view showing its dependencies and stage-sequence neighbours.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (91 lines)
- Skips scripts already covered by component plans via `skipSources`
- Edges derive from direct dependencies and stage-sequence before/after neighbours

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-03T21:55:38.045Z","inputHash":"e80f3bf9a66d9fb1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildInteractionPlans` {#symbol-buildinteractionplans}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/interactionPlan.ts#L15)
- Returns: [`SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan)[]
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`constants.LAYER3_PREFIX`](../constants.ts.mdmd.md#symbol-layer3_prefix)
- [`constants.LIVE_DOCS_SEGMENT`](../constants.ts.mdmd.md#symbol-live_docs_segment)
- [`constants.RUN_ALL_SCRIPT_PATH`](../constants.ts.mdmd.md#symbol-run_all_script_path)
- [`types.StageSequence`](../types.ts.mdmd.md#symbol-stagesequence) (type-only)
- [`types.SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`utils.formatDisplayName`](../utils.ts.mdmd.md#symbol-formatdisplayname)
- [`utils.includeInComponents`](../utils.ts.mdmd.md#symbol-includeincomponents)
- [`utils.layer3Slug`](../utils.ts.mdmd.md#symbol-layer3slug)
- [`types.Stage0Doc`](../../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doc) (type-only)
<!-- LIVE-DOC:END Dependencies -->
