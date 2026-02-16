# packages/server/src/features/live-docs/system/types.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/types.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-types-ts
- Generated At: 2026-02-16T03:54:28.042Z

## Authored
### Purpose
Type definitions for the System-layer Live Documentation generator. Defines archetypes, plan structures, result records, and activation summary types used throughout system materialisation.

### Notes
- Extracted 2025-12-06 from `system/generator.ts` during the generator refactoring (167 lines)
- `Layer3Archetype` defines component/interaction/workflow/integration/testing
- `SystemDocPlan` is the core planning type: components, edges, virtual nodes, and activation data
- Re-exports `LiveDocRenderSection` and `CoActivationEdge` from shared for convenience

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2026-02-16T03:54:28.042Z","inputHash":"6de422f395f756a1"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `Layer3Archetype` {#symbol-layer3archetype}
- Type: type
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L22)

##### `Layer3Archetype` — Summary
Discriminant for the six MDMD Layer 3 system document archetypes.

Each archetype corresponds to a distinct analytical strategy in the
system generator's plan builders. The generator materialises one
document per archetype per detected cluster.

##### `Layer3Archetype` — Remarks
Extracted from the monolithic `generator.ts` on 2025-12-07 during the
decomposition into 10 capability modules.

#### `GenerateSystemLiveDocsOptions` {#symbol-generatesystemlivedocsoptions}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L40)

##### `GenerateSystemLiveDocsOptions` — Summary
Configuration for a system-layer Live Docs generation run.

Supports dry-run mode, custom output directories, clean-before-write,
and a pluggable {@link SystemGeneratorLogger} for CLI/test integration.

#### `SystemLiveDocWriteRecord` {#symbol-systemlivedocwriterecord}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L54)

##### `SystemLiveDocWriteRecord` — Summary
Record-level summary of a single system document write, used for
aggregate counting in the generator result.

#### `GeneratedSystemDocument` {#symbol-generatedsystemdocument}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L68)

##### `GeneratedSystemDocument` — Summary
Full representation of a generated system document, including its
rendered markdown content and filesystem paths.

Consumed by the CLI to write documents and by tests to assert on
generated content without touching the filesystem.

#### `SystemLiveDocGeneratorResult` {#symbol-systemlivedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L84)

##### `SystemLiveDocGeneratorResult` — Summary
Aggregated result of a system-layer generation run.

The CLI (`npm run live-docs:system`) and integration tests consume
this to report processed/written/skipped/deleted counts and to
access the full list of generated documents.

#### `SystemGeneratorLogger` {#symbol-systemgeneratorlogger}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L99)

##### `SystemGeneratorLogger` — Summary
Pluggable logger interface for system generation, enabling both
CLI console output and silent test execution.

#### `SystemDocPlan` {#symbol-systemdocplan}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L121)

##### `SystemDocPlan` — Summary
A plan describing a single system-layer document to materialise.

Each plan builder (component, interaction, workflow, testing,
co-activation) produces one or more `SystemDocPlan`s. The generator
orchestrator then renders each plan into a markdown document.

`componentPaths` lists the workspace artifacts that belong to this
cluster, `edgeTuples` captures the dependency edges between them,
and the optional `activation` summary provides statistical
significance data from co-activation analysis.

#### `SystemVirtualNode` {#symbol-systemvirtualnode}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L137)

##### `SystemVirtualNode` — Summary
A synthetic node injected into a system document plan for concepts
that don't map to a single file (e.g. aggregated test summaries).

#### `NodeMetric` {#symbol-nodemetric}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L147)

##### `NodeMetric` — Summary
Per-node metrics within a system document cluster, computed from
the co-activation graph.

#### `PlanActivationSourceSummary` {#symbol-planactivationsourcesummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L162)

##### `PlanActivationSourceSummary` — Summary
A test or dependency source contributing to a cluster's activation,
with the number of edges it participates in.

#### `PlanActivationEdgeSummary` {#symbol-planactivationedgesummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L174)

##### `PlanActivationEdgeSummary` — Summary
A single co-activation edge with statistical significance metadata.

`pValue` and `qValue` (Benjamini-Hochberg FDR-corrected) indicate
whether the shared-test count between `source` and `target` is
statistically significant given the workspace baseline.

#### `PlanActivationSignificanceSummary` {#symbol-planactivationsignificancesummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L192)

##### `PlanActivationSignificanceSummary` — Summary
Cluster-level statistical significance summary, comparing observed
edge density against the expected density under a null model.

`clusterPValue` and `clusterQValue` quantify whether the cluster's
internal co-activation is stronger than chance.

#### `PlanActivationSummary` {#symbol-planactivationsummary}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L211)

##### `PlanActivationSummary` — Summary
Complete activation summary for a system document plan's cluster.

Aggregates member coverage, edge statistics, top components by
z-score, top edges by weight, and the contributing test/dependency
sources. Used by the rendering pipeline to produce the
"Activation" section of system-layer Live Docs.

#### `RunAllStageDescriptor` {#symbol-runallstagedescriptor}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L234)

##### `RunAllStageDescriptor` — Summary
A single stage descriptor parsed from `run-all.ts`, describing
a named pipeline stage and its npm script.

#### `StageSequenceMapEntry` {#symbol-stagesequencemapentry}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L243)

##### `StageSequenceMapEntry` — Summary
DAG adjacency entry for a single stage, listing which stages must
run before and after it.

#### `StageSequence` {#symbol-stagesequence}
- Type: interface
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L254)

##### `StageSequence` — Summary
The complete stage execution DAG extracted from `run-all.ts`.

`order` is a topological sort of stage names; `map` provides the
adjacency list (before/after) for each stage.

#### `LiveDocRenderSection` {#symbol-livedocrendersection}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L263)

#### `CoActivationEdge` {#symbol-coactivationedge}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/types.ts#L265)
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
