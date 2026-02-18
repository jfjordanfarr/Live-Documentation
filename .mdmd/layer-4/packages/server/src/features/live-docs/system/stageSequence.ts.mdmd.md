# packages/server/src/features/live-docs/system/stageSequence.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/stageSequence.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-stagesequence-ts
- Generated At: 2026-02-18T21:27:52.854Z

## Authored
### Purpose
Builds the ordered stage sequence from `run-all.ts` descriptors for Workflow system views. Produces edges representing script execution order to visualise orchestration flows.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (118 lines)
- `buildStageSequence()` converts stage descriptors into an ordered list with before/after neighbours
- `extractRunAllStageDescriptors()` parses `run-all.ts` to discover script references

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-18T21:27:52.854Z","inputHash":"7703173c6674543d"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `buildStageSequence` {#symbol-buildstagesequence}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/stageSequence.ts#L20)
- Returns: [`StageSequence`](./types.ts.mdmd.md#symbol-stagesequence)
- Parameters: `stageDescriptors`: [`RunAllStageDescriptor`](./types.ts.mdmd.md#symbol-runallstagedescriptor)[]

##### `buildStageSequence` — Summary
Transforms an ordered list of stage descriptors into a doubly-linked
sequence structure recording before/after neighbours for each script.

Only scripts present in the `stage0PathSet` (via {@link includeInComponents})
are included.

#### `buildStageSequenceEdges` {#symbol-buildstagesequenceedges}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/stageSequence.ts#L65)

##### `buildStageSequenceEdges` — Summary
Converts a stage sequence into a list of directed edges.

Creates a `from → to` edge for each sequential pair in the stage order,
optionally prefixes the chain with an edge from the orchestrator path
to the first stage.

#### `extractRunAllStageDescriptors` {#symbol-extractrunallstagedescriptors}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/stageSequence.ts#L109)

##### `extractRunAllStageDescriptors` — Summary
Extracts stage descriptors from the `scripts/live-docs/run-all.ts` orchestrator.

Parses the file with a regex that captures `label` / `script` pairs, deduplicates
by script path, and returns the ordered list.  Returns an empty array when the
orchestrator file does not exist.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs/promises`
- `node:path` - `path`
- [`types.RunAllStageDescriptor`](./types.ts.mdmd.md#symbol-runallstagedescriptor) (type-only)
- [`types.StageSequence`](./types.ts.mdmd.md#symbol-stagesequence) (type-only)
- [`types.StageSequenceMapEntry`](./types.ts.mdmd.md#symbol-stagesequencemapentry) (type-only)
- [`utils.includeInComponents`](./utils.ts.mdmd.md#symbol-includeincomponents)
- [`pathUtils.normalizeWorkspacePath`](../../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
