# packages/server/src/features/live-docs/system/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/system/generator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-system-generator-ts
- Generated At: 2025-12-15T00:38:06.508Z

## Authored
### Purpose
Synthesizes Stage-0 Live Docs, co-activation analytics, and optional target manifests into on-demand System-layer markdown so the CLI can emit statistically justified integration views ([2025-11-11 summary](../../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-11.SUMMARIZED.md)).

### Notes
- Applies the p/q/z thresholds produced by `coActivation.ts` before writing clusters, preventing the oversized views we rejected earlier in the 2025-11-11 session.
- Supports custom `outputDir` and mirror cleanup so headless harness and `npm run live-docs:system` executions materialize ephemeral System docs outside the repo, matching the on-demand plan agreed the same day.

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.508Z","inputHash":"2bc727a75e1c55be"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `GeneratedSystemDocument` {#symbol-generatedsystemdocument}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L76)

#### `GenerateSystemLiveDocsOptions` {#symbol-generatesystemlivedocsoptions}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L77)

#### `SystemGeneratorLogger` {#symbol-systemgeneratorlogger}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L78)

#### `SystemLiveDocGeneratorResult` {#symbol-systemlivedocgeneratorresult}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L79)

#### `SystemLiveDocWriteRecord` {#symbol-systemlivedocwriterecord}
- Type: unknown
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L80)

#### `generateSystemLiveDocs` {#symbol-generatesystemlivedocs}
- Type: function
- Source: [source](../../../../../../../../packages/server/src/features/live-docs/system/generator.ts#L87)
- Parameters: `options`: [`GenerateSystemLiveDocsOptions`](./types.ts.mdmd.md#symbol-generatesystemlivedocsoptions)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`docLoader.loadStage0Docs`](../stage0/docLoader.ts.mdmd.md#symbol-loadstage0docs)
- [`constants.DEFAULT_CO_ACTIVATION_RELATIVE_PATH`](./constants.ts.mdmd.md#symbol-default_co_activation_relative_path)
- [`constants.DEFAULT_LOGGER`](./constants.ts.mdmd.md#symbol-default_logger)
- [`constants.LIVE_DOCS_SEGMENT`](./constants.ts.mdmd.md#symbol-live_docs_segment)
- [`constants.SUPPORTED_LAYER3_ARCHETYPES`](./constants.ts.mdmd.md#symbol-supported_layer3_archetypes)
- [`constants.SYSTEM_LAYER_NAME`](./constants.ts.mdmd.md#symbol-system_layer_name)
- [`index.buildCoActivationPlans`](./plans/index.ts.mdmd.md#symbol-buildcoactivationplans)
- [`index.buildComponentPlans`](./plans/index.ts.mdmd.md#symbol-buildcomponentplans)
- [`index.buildInteractionPlans`](./plans/index.ts.mdmd.md#symbol-buildinteractionplans)
- [`index.buildTestingPlans`](./plans/index.ts.mdmd.md#symbol-buildtestingplans)
- [`index.buildWorkflowPlans`](./plans/index.ts.mdmd.md#symbol-buildworkflowplans)
- [`index.isImplementationDoc`](./plans/index.ts.mdmd.md#symbol-isimplementationdoc)
- [`rendering.renderActivationSection`](./rendering.ts.mdmd.md#symbol-renderactivationsection)
- [`rendering.renderComponentsSection`](./rendering.ts.mdmd.md#symbol-rendercomponentssection)
- [`rendering.renderPublicSymbolsSection`](./rendering.ts.mdmd.md#symbol-renderpublicsymbolssection)
- [`rendering.renderTopologySection`](./rendering.ts.mdmd.md#symbol-rendertopologysection)
- [`stageSequence.buildStageSequence`](./stageSequence.ts.mdmd.md#symbol-buildstagesequence)
- [`stageSequence.extractRunAllStageDescriptors`](./stageSequence.ts.mdmd.md#symbol-extractrunallstagedescriptors)
- [`types.GenerateSystemLiveDocsOptions`](./types.ts.mdmd.md#symbol-generatesystemlivedocsoptions) (type-only)
- [`types.GeneratedSystemDocument`](./types.ts.mdmd.md#symbol-generatedsystemdocument) (type-only)
- [`types.SystemDocPlan`](./types.ts.mdmd.md#symbol-systemdocplan) (type-only)
- [`types.SystemGeneratorLogger`](./types.ts.mdmd.md#symbol-systemgeneratorlogger) (type-only)
- [`types.SystemLiveDocGeneratorResult`](./types.ts.mdmd.md#symbol-systemlivedocgeneratorresult) (type-only)
- [`types.SystemLiveDocWriteRecord`](./types.ts.mdmd.md#symbol-systemlivedocwriterecord) (type-only)
- [`utils.classifyChange`](./utils.ts.mdmd.md#symbol-classifychange)
- [`utils.extractGeneratedAt`](./utils.ts.mdmd.md#symbol-extractgeneratedat)
- [`utils.isCompiledArtifactPath`](./utils.ts.mdmd.md#symbol-iscompiledartifactpath)
- [`utils.readIfExists`](./utils.ts.mdmd.md#symbol-readifexists)
- [`utils.resolveOutputDirectory`](./utils.ts.mdmd.md#symbol-resolveoutputdirectory)
- [`utils.resolveSystemDocPaths`](./utils.ts.mdmd.md#symbol-resolvesystemdocpaths)
- [`utils.stripCodePathLine`](./utils.ts.mdmd.md#symbol-stripcodepathline)
- [`utils.systemMetadataSourcePath`](./utils.ts.mdmd.md#symbol-systemmetadatasourcepath)
- [`manifest.loadTargetManifest`](../targets/manifest.ts.mdmd.md#symbol-loadtargetmanifest)
- [`liveDocumentationConfig.LiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`coActivation.CoActivationReport`](../../../../../shared/src/live-docs/analysis/coActivation.ts.mdmd.md#symbol-coactivationreport) (type-only)
- [`core.cleanupEmptyParents`](../../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-cleanupemptyparents)
- [`core.directoryExists`](../../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-directoryexists)
- [`core.hasMeaningfulAuthoredContent`](../../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`markdown.LiveDocRenderSection`](../../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-livedocrendersection)
- [`markdown.extractAuthoredBlock`](../../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-extractauthoredblock)
- [`markdown.renderLiveDocMarkdown`](../../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-renderlivedocmarkdown)
- [`schema.LiveDocMetadata`](../../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocmetadata)
- [`schema.LiveDocProvenance`](../../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocprovenance)
- [`schema.normalizeLiveDocMetadata`](../../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-normalizelivedocmetadata)
- [`types.Stage0Doc`](../../../../../shared/src/live-docs/types.ts.mdmd.md#symbol-stage0doc) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
