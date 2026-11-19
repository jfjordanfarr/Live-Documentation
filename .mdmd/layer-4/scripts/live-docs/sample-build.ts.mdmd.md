# `scripts/live-docs/sample-build.ts`

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: `scripts/live-docs/sample-build.ts`
- Generated At: 2026-11-19T21:10:19.257Z

## Authored
### Purpose
Builds the static Explorer over one sample program, with its Live Docs generated into a temporary copy, so that the sample itself is never written to.

### Notes
Moved out of [visualize-sample.ts](visualize-sample.ts.mdmd.md) on 2026-11-18 so that the estate and the Rosetta samples are built by one function ([the slice's brief](../../../../AI-Agent-Workspace/AgentSessionHistory/2026/11/2026-11-18/2026-11-18.1.record.md#work-notes-the-scenario-suites-builder-dispatched)).

## Generated
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `SampleBuilt` {#symbol-samplebuilt}
- Type: interface
- Source: [source](../../../../scripts/live-docs/sample-build.ts#L18)

##### `SampleBuilt` — Summary
What a build made: how many files and edges the site carries.

#### `buildSample` {#symbol-buildsample}
- Type: function
- Source: [source](../../../../scripts/live-docs/sample-build.ts#L27)

##### `buildSample` — Summary
Generates the program's Live Docs in a copy, with the shipped default configuration, and writes the Explorer's site
to `outputDir`; `boardPath`, inside the program, draws the World Map from a board it carries.
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `node:fs`
- `node:path`
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../packages/engine/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`staticBuilder.buildStaticExplorer`](../../packages/explorer/src/shared/staticBuilder.ts.mdmd.md#symbol-buildstaticexplorer)
- [`generator.generateLiveDocs`](../../packages/generator/src/generator.ts.mdmd.md#symbol-generatelivedocs)
- [`fixture.copyFixture`](../oracle/fixture.ts.mdmd.md#symbol-copyfixture)
<!-- LIVE-DOC:END Dependencies -->
