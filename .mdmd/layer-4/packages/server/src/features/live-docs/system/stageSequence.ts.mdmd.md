# packages/server/src/features/live-docs/system/stageSequence.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/stageSequence.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-stagesequence-ts
- Generated At: 2025-12-07T16:27:06.858Z

## Authored
### Purpose
Builds the ordered stage sequence from `run-all.ts` descriptors for Workflow system views. Produces edges representing script execution order to visualise orchestration flows.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (118 lines)
- `buildStageSequence()` converts stage descriptors into an ordered list with before/after neighbours
- `extractRunAllStageDescriptors()` parses `run-all.ts` to discover script references

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-07T16:27:06.858Z","inputHash":"cadb3a272cf6d4f8"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildStageSequence` {#symbol-buildstagesequence}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/stageSequence.ts#L13)
- Returns: [`StageSequence`](./types.ts.mdmd.md#symbol-stagesequence)
- Parameters: `stageDescriptors`: [`RunAllStageDescriptor`](./types.ts.mdmd.md#symbol-runallstagedescriptor)[]

#### `buildStageSequenceEdges` {#symbol-buildstagesequenceedges}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/stageSequence.ts#L51)

#### `extractRunAllStageDescriptors` {#symbol-extractrunallstagedescriptors}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/stageSequence.ts#L88)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `@live-documentation/shared/tooling/pathUtils` - `normalizeWorkspacePath`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`types.RunAllStageDescriptor`](./types.ts.mdmd.md#symbol-runallstagedescriptor) (type-only)
- [`types.StageSequence`](./types.ts.mdmd.md#symbol-stagesequence) (type-only)
- [`types.StageSequenceMapEntry`](./types.ts.mdmd.md#symbol-stagesequencemapentry) (type-only)
- [`utils.includeInComponents`](./utils.ts.mdmd.md#symbol-includeincomponents)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
