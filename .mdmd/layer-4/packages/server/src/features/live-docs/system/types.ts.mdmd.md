# packages/server/src/features/live-docs/system/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/types.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-types-ts
- Generated At: 2026-01-14T15:17:48.583Z

## Authored
### Purpose
Type definitions for the System-layer Live Documentation generator. Defines archetypes, plan structures, result records, and activation summary types used throughout system materialisation.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (167 lines)
- `Layer3Archetype` defines component/interaction/workflow/integration/testing
- `SystemDocPlan` is the core planning type: components, edges, virtual nodes, and activation data
- Re-exports `LiveDocRenderSection` and `CoActivationEdge` from shared for convenience

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-01-14T15:17:48.583Z","inputHash":"f0385c79ba5c1b53"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Layer3Archetype` {#symbol-layer3archetype}
- Type: type
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L11)

#### `GenerateSystemLiveDocsOptions` {#symbol-generatesystemlivedocsoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L23)

#### `SystemLiveDocWriteRecord` {#symbol-systemlivedocwriterecord}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L33)

#### `GeneratedSystemDocument` {#symbol-generatedsystemdocument}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L40)

#### `SystemLiveDocGeneratorResult` {#symbol-systemlivedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L49)

#### `SystemGeneratorLogger` {#symbol-systemgeneratorlogger}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L60)

#### `SystemDocPlan` {#symbol-systemdocplan}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L70)

#### `SystemVirtualNode` {#symbol-systemvirtualnode}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L82)

#### `NodeMetric` {#symbol-nodemetric}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L88)

#### `PlanActivationSourceSummary` {#symbol-planactivationsourcesummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L99)

#### `PlanActivationEdgeSummary` {#symbol-planactivationedgesummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L104)

#### `PlanActivationSignificanceSummary` {#symbol-planactivationsignificancesummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L115)

#### `PlanActivationSummary` {#symbol-planactivationsummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L126)

#### `RunAllStageDescriptor` {#symbol-runallstagedescriptor}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L145)

#### `StageSequenceMapEntry` {#symbol-stagesequencemapentry}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L150)

#### `StageSequence` {#symbol-stagesequence}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L155)

#### `LiveDocRenderSection` {#symbol-livedocrendersection}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L164)

#### `CoActivationEdge` {#symbol-coactivationedge}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L166)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- [`LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig) (type-only)
- [`coActivation.CoActivationEdge`](../../../../../shared/src/live-docs/analysis/coActivation.ts.mdmd.md#symbol-coactivationedge) (type-only)
- [`markdown.LiveDocRenderSection`](../../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-livedocrendersection) (type-only)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
