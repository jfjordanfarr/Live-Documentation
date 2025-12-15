# packages/server/src/features/live-docs/generator.ts

## Metadata
- Layer: 4
- Archetype: implementation
- Code Path: packages/server/src/features/live-docs/generator.ts
- Live Doc ID: LD-implementation-packages-server-src-features-live-docs-generator-ts
- Generated At: 2025-12-15T00:38:06.466Z

## Authored
### Purpose
Coordinates Live Documentation generation by analyzing source files, merging authored sections, recording provenance, and writing deterministic markdown mirrors for each artifact.

### Notes
- Refactored into a layer-agnostic pipeline to support both Stage‑0 and System docs; see [2025-11-10 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-10.SUMMARIZED.md).
- Exposes `__testUtils` hooks to validate rendering behaviour as documented in [2025-11-08 summary](../../../../../../../AI-Agent-Workspace/ChatHistory/2025/11/Summarized/2025-11-08.SUMMARIZED.md).

## Generated
<!-- LIVE-DOC:PROVENANCE {"generators":[{"tool":"live-docs-generator","version":"0.1.0","generatedAt":"2025-12-15T00:38:06.466Z","inputHash":"20cd1166db44fd89"}]} -->
<!-- LIVE-DOC:BEGIN Public Symbols -->
### Public Symbols
#### `LiveDocGeneratorResult` {#symbol-livedocgeneratorresult}
- Type: interface
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L72)

#### `generateLiveDocs` {#symbol-generatelivedocs}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L95)
- Parameters: `options`: `GenerateLiveDocsOptions`

#### `__testUtils` {#symbol-__testutils}
- Type: const
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L780)

#### `withDefaultConfig` {#symbol-withdefaultconfig}
- Type: function
- Source: [source](../../../../../../../packages/server/src/features/live-docs/generator.ts#L789)
- Returns: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- Parameters: `config`: [`LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
<!-- LIVE-DOC:END Public Symbols -->

<!-- LIVE-DOC:BEGIN Dependencies -->
### Dependencies
- `glob` - `glob`
- `node:crypto` - `createHash`
- `node:fs/promises` - `fs`
- `node:path` - `path`
- [`evidenceBridge.CoverageSummary`](./evidenceBridge.ts.mdmd.md#symbol-coveragesummary)
- [`evidenceBridge.EvidenceSnapshot`](./evidenceBridge.ts.mdmd.md#symbol-evidencesnapshot)
- [`evidenceBridge.ImplementationEvidenceItem`](./evidenceBridge.ts.mdmd.md#symbol-implementationevidenceitem)
- [`evidenceBridge.TestEvidenceItem`](./evidenceBridge.ts.mdmd.md#symbol-testevidenceitem)
- [`evidenceBridge.loadEvidenceSnapshot`](./evidenceBridge.ts.mdmd.md#symbol-loadevidencesnapshot)
- [`liveDocumentationConfig.DEFAULT_LIVE_DOCUMENTATION_CONFIG`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-default_live_documentation_config)
- [`liveDocumentationConfig.LiveDocumentationArchetype`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationarchetype)
- [`liveDocumentationConfig.LiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-livedocumentationconfig)
- [`liveDocumentationConfig.normalizeLiveDocumentationConfig`](../../../../shared/src/config/liveDocumentationConfig.ts.mdmd.md#symbol-normalizelivedocumentationconfig)
- [`core.SourceAnalysisResult`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-sourceanalysisresult)
- [`core.WorkspaceSymbolIndex`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-workspacesymbolindex)
- [`core.analyzeSourceFile`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-analyzesourcefile)
- [`core.buildWorkspaceSymbolIndex`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-buildworkspacesymbolindex)
- [`core.cleanupEmptyParents`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-cleanupemptyparents)
- [`core.collectDependencies`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-collectdependencies)
- [`core.collectExportedSymbols`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-collectexportedsymbols)
- [`core.computePublicSymbolHeadingInfo`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-computepublicsymbolheadinginfo)
- [`core.directoryExists`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-directoryexists)
- [`core.discoverTargetFiles`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-discovertargetfiles)
- [`core.formatRelativePathFromDoc`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-formatrelativepathfromdoc)
- [`core.hasMeaningfulAuthoredContent`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-hasmeaningfulauthoredcontent)
- [`core.inferScriptKind`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-inferscriptkind)
- [`core.renderDependencyLines`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-renderdependencylines)
- [`core.renderPublicSymbolLines`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-renderpublicsymbollines)
- [`core.renderReExportedAnchorLines`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-renderreexportedanchorlines)
- [`core.resolveArchetype`](../../../../shared/src/live-docs/core.ts.mdmd.md#symbol-resolvearchetype)
- [`markdown.LiveDocRenderSection`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-livedocrendersection)
- [`markdown.composeLiveDocId`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-composelivedocid)
- [`markdown.extractAuthoredBlock`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-extractauthoredblock)
- [`markdown.renderLiveDocMarkdown`](../../../../shared/src/live-docs/markdown.ts.mdmd.md#symbol-renderlivedocmarkdown)
- [`schema.LiveDocGeneratorProvenance`](../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocgeneratorprovenance) (type-only)
- [`schema.LiveDocMetadata`](../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocmetadata) (type-only)
- [`schema.LiveDocProvenance`](../../../../shared/src/live-docs/schema.ts.mdmd.md#symbol-livedocprovenance) (type-only)
- [`pathUtils.normalizeWorkspacePath`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-normalizeworkspacepath)
- [`pathUtils.toWorkspaceFileUri`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacefileuri)
- [`pathUtils.toWorkspaceRelativePath`](../../../../shared/src/tooling/pathUtils.ts.mdmd.md#symbol-toworkspacerelativepath)
<!-- LIVE-DOC:END Dependencies -->

<!-- LIVE-DOC:BEGIN Observed Evidence -->
### Observed Evidence
#### Vitest Unit Tests
- [generator.test.ts](./generator.test.ts.mdmd.md)
- [renderPublicSymbolLines.test.ts](./renderPublicSymbolLines.test.ts.mdmd.md)
<!-- LIVE-DOC:END Observed Evidence -->
