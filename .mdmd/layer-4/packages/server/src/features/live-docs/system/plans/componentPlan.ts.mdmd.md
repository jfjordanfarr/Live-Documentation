# packages/server/src/features/live-docs/system/plans/componentPlan.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/plans/componentPlan.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-plans-componentplan-ts
- Generated At: 2025-12-07T16:27:06.757Z

## Authored
### Purpose
Builds System-layer `component` archetype plans by grouping Live Docs implementation files by their directory structure. Produces component topology edges from dependency relationships.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (130 lines)
- Groups Live Docs by `deriveComponentKey()` which extracts common path prefixes
- Special handling for `scripts/live-docs` group: injects stage-sequence orchestration edges

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T16:27:06.757Z","inputHash":"aa7018e6e5c38f47"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildComponentPlans` {#symbol-buildcomponentplans}
- Type: function
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/componentPlan.ts#L17)
- Returns: [`SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan)[]

#### `isImplementationDoc` {#symbol-isimplementationdoc}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/componentPlan.ts#L129)

#### `deriveComponentKey` {#symbol-derivecomponentkey}
- Type: unknown
- Source: [source](../../../../../../../../../packages/server/src/features/live-docs/system/plans/componentPlan.ts#L129)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/live-docs/types` - `Stage0Doc` (type-only)
- [`constants.IMPLEMENTATION_ARCHETYPE`](../constants.ts.mdmd.md#symbol-implementation_archetype)
- [`constants.LAYER3_PREFIX`](../constants.ts.mdmd.md#symbol-layer3_prefix)
- [`constants.LIVE_DOCS_SEGMENT`](../constants.ts.mdmd.md#symbol-live_docs_segment)
- [`constants.RUN_ALL_SCRIPT_PATH`](../constants.ts.mdmd.md#symbol-run_all_script_path)
- [`stageSequence.buildStageSequenceEdges`](../stageSequence.ts.mdmd.md#symbol-buildstagesequenceedges)
- [`types.StageSequence`](../types.ts.mdmd.md#symbol-stagesequence) (type-only)
- [`types.SystemDocPlan`](../types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`utils.formatDisplayName`](../utils.ts.mdmd.md#symbol-formatdisplayname)
- [`utils.includeInComponents`](../utils.ts.mdmd.md#symbol-includeincomponents)
- [`utils.layer3Slug`](../utils.ts.mdmd.md#symbol-layer3slug)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](../generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
